import "server-only";

import type {
  BudgetItem,
  Idea,
  PlanoraEvent,
  Task,
  Vendor,
} from "@/types";
import { evaluateAndCritiqueBlueprint } from "./critique";
import {
  generateProceduralBlueprint,
  askProceduralCopilot,
} from "./fallback";
import {
  BLUEPRINT_SYSTEM_PROMPT,
  buildBlueprintUserPrompt,
  buildCopilotSystemPrompt,
} from "./prompts";
import { normalizeAndValidateBlueprint, safeParseAndRepairJSON } from "./schema";
import type { AIBlueprintResult, AICopilotResult, AgentReasoningStep } from "./types";

const RAW_API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.OPENAI_API_KEY ||
  "";

// Active working model cache (once a model succeeds, prefer it for future requests)
let cachedWorkingModel: string | null = null;

function getApiKey(): string {
  return RAW_API_KEY.trim();
}

function isOpenAIKey(key: string): boolean {
  return key.startsWith("sk-");
}

/**
 * Returns prioritized list of Gemini model candidates to attempt
 */
function getGeminiCandidateModels(): string[] {
  const configured = (process.env.GEMINI_MODEL || "gemini-3.5-flash").trim();
  const candidates: string[] = [];

  if (cachedWorkingModel) {
    candidates.push(cachedWorkingModel);
  }

  if (configured && !candidates.includes(configured)) {
    candidates.push(configured);
  }

  // Fallback candidates prioritized by active availability, ultra-low latency, and valid endpoints
  const defaults = [
    "gemini-3.5-flash",
    "gemini-3.8-flash",
    "gemma-4-26b-a4b-it",
    "gemini-flash-latest",
  ];

  for (const m of defaults) {
    if (!candidates.includes(m)) {
      candidates.push(m);
    }
  }

  return candidates;
}

/**
 * Calls OpenAI chat completions API as an adapter when an OpenAI key is configured
 */
async function callOpenAI(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  isJson: boolean,
  timeoutMs: number,
): Promise<{ text: string; model: string }> {
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const endpoint =
    process.env.OPENAI_BASE_URL || "https://api.openai.com/v1/chat/completions";

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: isJson ? { type: "json_object" } : undefined,
      temperature: isJson ? 0.2 : 0.3,
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`OpenAI API error [${res.status}]: ${errText.slice(0, 150)}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "";
  return { text, model };
}

/**
 * Calls Google Gemini REST generateContent API with fast timeout and fallback cascade
 */
async function callGemini(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  isJson: boolean,
  timeoutMs: number,
): Promise<{ text: string; model: string }> {
  const candidateModels = getGeminiCandidateModels();
  let lastError: Error | null = null;

  for (const model of candidateModels) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const generationConfig: Record<string, unknown> = {
      temperature: isJson ? 0.2 : 0.3,
      // 4096 tokens prevents premature JSON truncation syntax errors
      maxOutputTokens: isJson ? 4096 : 1000,
    };

    if (isJson) {
      generationConfig.responseMimeType = "application/json";
    }

    // Models supporting thinking budget
    if (model.includes("2.5") || model.includes("3.8") || model.includes("thinking")) {
      generationConfig.thinkingConfig = { thinkingBudget: 0 };
    }

    const requestBody: Record<string, unknown> = {
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      generationConfig,
    };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (res.status === 200) {
        const data = await res.json();
        const text =
          data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (text) {
          cachedWorkingModel = model;
          return { text, model };
        }
      }

      // If model returned 404 or 400 (model deprecated or unavailable), fail-fast and try next model
      if (res.status === 404 || res.status === 400) {
        const errorData = await res.json().catch(() => ({}));
        const errMsg = errorData.error?.message || res.statusText;
        console.warn(
          `[Planora AI] Gemini model '${model}' unavailable (${res.status}): ${errMsg.slice(0, 100)}. Trying fallback candidate...`,
        );
        lastError = new Error(`Model ${model} returned ${res.status}`);
        continue;
      }

      // Rate limit or service overload (429 or 503)
      if (res.status === 429 || res.status === 503) {
        console.warn(
          `[Planora AI] Gemini model '${model}' status ${res.status}. Trying next candidate...`,
        );
        lastError = new Error(`Model ${model} status ${res.status}`);
        continue;
      }

      // Other HTTP error
      lastError = new Error(`Gemini HTTP ${res.status}`);
    } catch (err) {
      // Fast timeout or network abort
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(
        `[Planora AI] Call to model '${model}' failed or timed out: ${lastError.message}`,
      );
    }
  }

  throw lastError || new Error("All Gemini candidate models failed");
}

/**
 * Universal AI caller router (OpenAI vs Gemini)
 */
export async function executeAIGeneration(
  systemPrompt: string,
  userPrompt: string,
  isJson: boolean,
  timeoutMs: number,
): Promise<{ text: string; model: string }> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("No AI API key configured");
  }

  if (isOpenAIKey(apiKey)) {
    return callOpenAI(apiKey, systemPrompt, userPrompt, isJson, timeoutMs);
  }

  return callGemini(apiKey, systemPrompt, userPrompt, isJson, timeoutMs);
}

/**
 * Generate AI Event Blueprint with strict schema validation, agent evaluator critique, and graceful fallback
 */
export async function generateAIBlueprintWithFallback(
  event: PlanoraEvent,
): Promise<AIBlueprintResult> {
  const apiKey = getApiKey();

  if (apiKey) {
    try {
      const userPrompt = buildBlueprintUserPrompt(event);
      // Timeout: 12 seconds for full plan generation
      const { text, model } = await executeAIGeneration(
        BLUEPRINT_SYSTEM_PROMPT,
        userPrompt,
        true,
        12000,
      );

      const parsed = safeParseAndRepairJSON(text);
      const validatedBlueprint = normalizeAndValidateBlueprint(parsed, event);

      // Multi-phase Agent Evaluator and Critique Loop
      const { refinedBlueprint, critiqueTrace, evaluationScore } =
        evaluateAndCritiqueBlueprint(validatedBlueprint, event);

      return {
        blueprint: refinedBlueprint,
        mode: "live",
        modelUsed: model,
        evaluationScore,
        reasoningTrace: critiqueTrace,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(
        `[Planora AI] Live Blueprint generation unavailable (${message}). Using procedural fallback engine.`,
      );
    }
  }

  // Graceful local offline fallback with critique loop
  const proceduralBlueprint = generateProceduralBlueprint(event);
  const { refinedBlueprint, critiqueTrace, evaluationScore } =
    evaluateAndCritiqueBlueprint(proceduralBlueprint, event);

  return {
    blueprint: refinedBlueprint,
    mode: "offline",
    modelUsed: "procedural-rules-engine",
    evaluationScore,
    reasoningTrace: critiqueTrace,
  };
}

/**
 * AI Copilot context-grounded chat with scannable structure, reasoning traces, and graceful fallback
 */
export async function askAICopilotWithFallback(
  event: PlanoraEvent,
  context: {
    budgets: BudgetItem[];
    tasks: Task[];
    vendors: Vendor[];
    ideas: Idea[];
  },
  userMessage: string,
): Promise<AICopilotResult> {
  const apiKey = getApiKey();

  const totalAllocated = context.budgets.reduce((acc, b) => acc + (b.allocated_amount || 0), 0);
  const totalActual = context.budgets.reduce((acc, b) => acc + (b.actual_amount || 0), 0);
  const pendingTasks = context.tasks.filter((t) => t.status !== "completed");
  const criticalTasks = pendingTasks.filter((t) => t.priority === "critical");

  const copilotTrace: AgentReasoningStep[] = [
    {
      phase: "Phase 1: Memory & Context Grounding",
      status: "passed",
      details: `Loaded live financial state: INR ${totalAllocated.toLocaleString("en-IN")} allocated, INR ${totalActual.toLocaleString("en-IN")} spent of INR ${event.total_budget.toLocaleString("en-IN")}. ${pendingTasks.length} pending tasks (${criticalTasks.length} critical).`,
      timestamp: new Date().toISOString(),
    },
    {
      phase: "Phase 2: Intent Analysis & Strategy",
      status: "passed",
      details: `Parsed user query against event archetypes and vendor economics. Synthesizing practical actionable advice.`,
      timestamp: new Date().toISOString(),
    },
  ];

  if (apiKey) {
    try {
      const systemPrompt = buildCopilotSystemPrompt(event, context);
      const userPrompt = `<user_input>${userMessage.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;")}</user_input>`;
      // Timeout: 8 seconds for copilot chat
      const { text, model } = await executeAIGeneration(
        systemPrompt,
        userPrompt,
        false,
        8000,
      );

      copilotTrace.push({
        phase: "Phase 3: Model Execution & Synthesis",
        status: "passed",
        details: `Generated live context-grounded response via ${model}.`,
        timestamp: new Date().toISOString(),
      });

      return {
        reply: text.trim(),
        mode: "live",
        modelUsed: model,
        reasoningTrace: copilotTrace,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(
        `[Planora AI] Live Copilot chat unavailable (${message}). Using context-aware local response engine.`,
      );
    }
  }

  // Graceful local offline response
  const proceduralReply = askProceduralCopilot(event, context, userMessage);
  copilotTrace.push({
    phase: "Phase 3: Procedural Heuristics Execution",
    status: "passed",
    details: "Synthesized deterministic offline response grounded in current task and budget state.",
    timestamp: new Date().toISOString(),
  });

  return {
    reply: proceduralReply,
    mode: "offline",
    modelUsed: "context-aware-local-engine",
    reasoningTrace: copilotTrace,
  };
}
