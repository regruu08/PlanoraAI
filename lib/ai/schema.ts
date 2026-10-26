import "server-only";

import type { EventBlueprint, PlanoraEvent } from "@/types";
import { localDateString } from "../utils";
import { validateBlueprintForEvent } from "../validation/event";

type RawBudgetItem = {
  category?: unknown;
  allocatedAmount?: unknown;
  priority?: string;
  reason?: unknown;
};

type RawTask = {
  title?: unknown;
  description?: unknown;
  dueDate?: unknown;
  priority?: string;
};

type RawVendor = {
  vendorType?: unknown;
  estimatedBudget?: unknown;
  checklist?: unknown;
};

type RawChecklistItem = {
  label?: unknown;
};

type RawIdea = {
  category?: string;
  title?: unknown;
  description?: unknown;
  reason?: unknown;
};

type ValidIdeaCategory =
  | "theme"
  | "decor"
  | "food"
  | "activity"
  | "entertainment"
  | "guest_experience"
  | "other";

/**
 * Extracts and cleans raw JSON string from LLM responses (stripping markdown fences & preambles)
 */
export function extractJSONFromText(text: string): string {
  let cleaned = text.trim();

  // Strip markdown code fences if present
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/i, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "");
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.replace(/\s*```$/, "");
  }

  cleaned = cleaned.trim();

  // If text has preamble or postamble outside JSON, find first '{' and last '}'
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  return cleaned;
}

/**
 * Safely parses JSON with auto-repair heuristics for trailing commas and malformed tokens
 */
export function safeParseAndRepairJSON(rawText: string): unknown {
  const extracted = extractJSONFromText(rawText);

  try {
    return JSON.parse(extracted);
  } catch (initialErr) {
    // Attempt auto-repair
    try {
      const repaired = extracted
        // Remove trailing commas before closing braces/brackets
        .replace(/,\s*([}\]])/g, "$1")
        // Remove trailing ellipsis in arrays/objects
        .replace(/,\s*\.\.\.\s*([}\]])/g, "$1")
        // Fix unescaped control chars
        .replace(/[\x00-\x1F\x7F-\x9F]/g, (c) => (c === "\n" || c === "\r" || c === "\t" ? c : ""));

      return JSON.parse(repaired);
    } catch {
      throw initialErr;
    }
  }
}

/**
 * Normalizes and guarantees valid blueprint structure conforming to event budget and date bounds
 */
export function normalizeAndValidateBlueprint(
  raw: unknown,
  event: PlanoraEvent,
): EventBlueprint {
  if (!raw || typeof raw !== "object") {
    throw new Error("Parsed blueprint is not a valid object");
  }

  const data = raw as Record<string, unknown>;
  const totalBudget = Number(event.total_budget) || 100000;
  const eventDate = event.event_date;
  const today = localDateString();

  // 1. Normalize budgetPlan
  const rawBudget = Array.isArray(data.budgetPlan)
    ? (data.budgetPlan as RawBudgetItem[])
    : [];
  const normalizedBudget = rawBudget.map((b, idx: number) => ({
    category: String(b?.category || `Category ${idx + 1}`),
    allocatedAmount: Math.max(0, Number(b?.allocatedAmount) || 0),
    priority: (["low", "medium", "high", "critical"].includes(b?.priority || "")
      ? b.priority
      : "medium") as "low" | "medium" | "high" | "critical",
    reason: String(b?.reason || "Essential event allocation"),
  }));

  // Ensure minimum categories
  if (normalizedBudget.length < 3) {
    throw new Error("Insufficient budget categories returned");
  }

  // Check sum and prorate if exceeded
  const allocatedSum = normalizedBudget.reduce(
    (acc: number, item) => acc + item.allocatedAmount,
    0,
  );

  if (allocatedSum > totalBudget) {
    const ratio = totalBudget / allocatedSum;
    let runningSum = 0;
    for (let i = 0; i < normalizedBudget.length - 1; i++) {
      normalizedBudget[i].allocatedAmount = Math.floor(
        normalizedBudget[i].allocatedAmount * ratio,
      );
      runningSum += normalizedBudget[i].allocatedAmount;
    }
    // Allocate remainder to last item
    normalizedBudget[normalizedBudget.length - 1].allocatedAmount = Math.max(
      0,
      totalBudget - runningSum,
    );
  }

  // 2. Normalize timeline
  const rawTimeline = Array.isArray(data.timeline)
    ? (data.timeline as RawTask[])
    : [];
  const normalizedTimeline = rawTimeline.map((t, idx: number) => {
    let dueDate = String(t?.dueDate || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      dueDate = eventDate;
    }
    // Clamp between today and eventDate
    if (dueDate > eventDate) {
      dueDate = eventDate;
    }
    if (dueDate < today) {
      dueDate = today;
    }

    return {
      title: String(t?.title || `Milestone ${idx + 1}`),
      description: String(t?.description || "Execute planned task"),
      dueDate,
      priority: (["low", "medium", "high", "critical"].includes(t?.priority || "")
        ? t.priority
        : "medium") as "low" | "medium" | "high" | "critical",
    };
  });

  if (normalizedTimeline.length < 3) {
    throw new Error("Insufficient timeline milestones returned");
  }

  // 3. Normalize vendors
  const rawVendors = Array.isArray(data.vendors)
    ? (data.vendors as RawVendor[])
    : [];
  const normalizedVendors = rawVendors.map((v, idx: number) => {
    const rawChecklist = Array.isArray(v?.checklist)
      ? (v.checklist as (RawChecklistItem | string)[])
      : [];
    const checklist = rawChecklist.map((c) => ({
      label:
        typeof c === "string"
          ? c
          : String((c as RawChecklistItem)?.label || "Verify requirement"),
    }));

    if (checklist.length === 0) {
      checklist.push(
        { label: "Verify availability and rates" },
        { label: "Review portfolio and past client references" },
        { label: "Sign written agreement on payment terms" },
      );
    }

    return {
      vendorType: String(v?.vendorType || `Vendor ${idx + 1}`),
      estimatedBudget: Math.max(0, Number(v?.estimatedBudget) || 0),
      checklist,
    };
  });

  if (normalizedVendors.length < 2) {
    throw new Error("Insufficient vendors returned");
  }

  // 4. Normalize personalizedIdeas
  const validIdeaCategories: ValidIdeaCategory[] = [
    "theme",
    "decor",
    "food",
    "activity",
    "entertainment",
    "guest_experience",
    "other",
  ];
  const rawIdeas = Array.isArray(data.personalizedIdeas)
    ? (data.personalizedIdeas as RawIdea[])
    : [];
  const normalizedIdeas = rawIdeas.map((i, idx: number) => ({
    category: (validIdeaCategories.includes((i?.category || "") as ValidIdeaCategory)
      ? (i.category as ValidIdeaCategory)
      : "theme"),
    title: String(i?.title || `Personalized Concept ${idx + 1}`),
    description: String(i?.description || "Creative event styling suggestion"),
    reason: String(i?.reason || "Tailored to event profile"),
  }));

  if (normalizedIdeas.length < 2) {
    throw new Error("Insufficient personalized ideas returned");
  }

  // 5. Normalize nextActions
  const rawActions = Array.isArray(data.nextActions)
    ? (data.nextActions as unknown[])
    : [];
  const normalizedActions = rawActions
    .map((a) => String(a || "").trim())
    .filter(Boolean);

  if (normalizedActions.length < 2) {
    normalizedActions.push(
      "Confirm primary venue and reserve calendar date",
      "Shortlist top priority vendors and request quotes",
    );
  }

  const candidateBlueprint: EventBlueprint = {
    budgetPlan: normalizedBudget,
    timeline: normalizedTimeline,
    vendors: normalizedVendors,
    personalizedIdeas: normalizedIdeas,
    nextActions: normalizedActions,
  };

  // Run final validation check
  return validateBlueprintForEvent(candidateBlueprint, event);
}
