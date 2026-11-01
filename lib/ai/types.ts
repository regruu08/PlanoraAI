import type { EventBlueprint } from "@/types";

export type AIMode = "live" | "offline";

export interface AgentReasoningStep {
  phase: string;
  status: "passed" | "critiqued" | "revised";
  details: string;
  timestamp: string;
}

export interface AIBlueprintResult {
  blueprint: EventBlueprint;
  mode: AIMode;
  modelUsed?: string;
  evaluationScore?: number;
  reasoningTrace?: AgentReasoningStep[];
  error?: string;
}

export interface AICopilotResult {
  reply: string;
  mode: AIMode;
  modelUsed?: string;
  reasoningTrace?: AgentReasoningStep[];
  error?: string;
}
