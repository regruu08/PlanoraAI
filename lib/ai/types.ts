import type { EventBlueprint } from "@/types";

export type AIMode = "live" | "offline";

export interface AIBlueprintResult {
  blueprint: EventBlueprint;
  mode: AIMode;
  modelUsed?: string;
  error?: string;
}

export interface AICopilotResult {
  reply: string;
  mode: AIMode;
  modelUsed?: string;
  error?: string;
}
