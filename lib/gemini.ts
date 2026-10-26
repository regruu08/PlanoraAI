import type {
  BudgetItem,
  EventBlueprint,
  Idea,
  PlanoraEvent,
  Task,
  Vendor,
} from "@/types";
import {
  generateAIBlueprintWithFallback,
  askAICopilotWithFallback,
} from "./ai/client";
import {
  generateProceduralBlueprint,
  askProceduralCopilot,
} from "./ai/fallback";

export {
  generateProceduralBlueprint,
  askProceduralCopilot,
  generateAIBlueprintWithFallback,
  askAICopilotWithFallback,
};

/**
 * Generate AI Event Blueprint (Backward compatible wrapper)
 */
export async function generateAIEventBlueprint(
  event: PlanoraEvent,
): Promise<EventBlueprint> {
  const result = await generateAIBlueprintWithFallback(event);
  return result.blueprint;
}

/**
 * AI Copilot Context-Aware Chat (Backward compatible wrapper)
 */
export async function askAICopilot(
  event: PlanoraEvent,
  context: {
    budgets: BudgetItem[];
    tasks: Task[];
    vendors: Vendor[];
    ideas: Idea[];
  },
  userMessage: string,
): Promise<string> {
  const result = await askAICopilotWithFallback(event, context, userMessage);
  return result.reply;
}
