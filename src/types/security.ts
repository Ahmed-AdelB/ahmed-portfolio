import type { Shield } from "lucide-react";

export type Difficulty = "Easy" | "Medium" | "Hard";
export type SimulationStatus = "safe" | "blocked" | "compromised";
export type DefenseId =
  | "instruction-hierarchy"
  | "input-sanitization"
  | "context-isolation"
  | "tool-gating"
  | "output-filtering";

export interface DefenseMechanism {
  id: DefenseId;
  name: string;
  description: string;
  strength: number;
  guardrail: string;
}

export interface Challenge {
  id: string;
  title: string;
  difficulty: Difficulty;
  context: string;
  systemPrompt: string;
  userPrompt: string;
  goal: string;
  exploitPatterns: string[];
  normalResponse: string;
  safeResponse: string;
  compromisedResponse: string;
  lesson: string;
  takeaways: string[];
  recommendedDefenses: DefenseId[];
}

export type ChallengeId = string;

export interface ChallengeProgress {
  attempts: number;
  blocked: number;
  compromised: number;
  safe: number;
  lastStatus: SimulationStatus | null;
  lastUpdated: number | null;
}

export type ProgressState = Record<ChallengeId, ChallengeProgress>;

export interface SimulationResult {
  status: SimulationStatus;
  score: number;
  threshold: number;
  matchedSignals: string[];
  response: string;
  reasoning: string;
  recommendedDefenses: DefenseId[];
  riskScore: number;
}
