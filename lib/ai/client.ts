import "server-only";

import type {
  BudgetItem,
  Idea,
  PlanoraEvent,
  Task,
  Vendor,
} from "@/types";
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
import type { AIBlueprintResult, AICopilotResult } from "./types";

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
  const configured = (process.env.GEMINI_MODEL || "gemini-2.5-flash").trim();
  const candidates: string[] = [];

  if (cachedWorkingModel) {
    candidates.push(cachedWorkingModel);
  }

  if (configured && !candidates.includes(configured)) {
    candidates.push(configured);
  }

  // Fallback candidates
  const defaults = [
    "gemini-3-flash-preview",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemma-4-26b-a4b-it",
    "gemini-3.8-flash",
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
      maxOutputTokens: isJson ? 2048 : 600,
    };

    if (isJson) {
      generationConfig.responseMimeType = "application/json";
    }

    // Models like gemini-2.5/3.x support disabling thinking budget for fast response times
    if (!model.startsWith("gemma")) {
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
 * Generate AI Event Blueprint with strict schema validation and graceful fallback
 */
export async function generateAIBlueprintWithFallback(
  event: PlanoraEvent,
): Promise<AIBlueprintResult> {
  const apiKey = getApiKey();

  if (apiKey) {
    try {
      const userPrompt = buildBlueprintUserPrompt(event);
      // Timeout: 10 seconds for plan generation
      const { text, model } = await executeAIGeneration(
        BLUEPRINT_SYSTEM_PROMPT,
        userPrompt,
        true,
        10000,
      );

      const parsed = safeParseAndRepairJSON(text);
      const validatedBlueprint = normalizeAndValidateBlueprint(parsed, event);

      return {
        blueprint: validatedBlueprint,
        mode: "live",
        modelUsed: model,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(
        `[Planora AI] Live Blueprint generation unavailable (${message}). Using procedural fallback engine.`,
      );
    }
  }

  // Graceful local offline fallback
  const proceduralBlueprint = generateProceduralBlueprint(event);
  return {
    blueprint: proceduralBlueprint,
    mode: "offline",
    modelUsed: "procedural-rules-engine",
  };
}

/**
 * AI Copilot context-grounded chat with scannable structure and graceful fallback
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

  if (apiKey) {
    try {
      const systemPrompt = buildCopilotSystemPrompt(event, context);
      const userPrompt = `<user_input>${userMessage.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;")}</user_input>`;
      // Timeout: 6 seconds for copilot chat
      const { text, model } = await executeAIGeneration(
        systemPrompt,
        userPrompt,
        false,
        6000,
      );

      return {
        reply: text.trim(),
        mode: "live",
        modelUsed: model,
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
  return {
    reply: proceduralReply,
    mode: "offline",
    modelUsed: "context-aware-local-engine",
  };
}
