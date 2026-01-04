import { useState, useEffect, useCallback, useRef } from "react";
import {
  type Challenge,
  type ChallengeId,
  type DefenseId,
  type ProgressState,
  type SimulationResult,
  type SimulationStatus,
  type ChallengeProgress,
  baseSignals,
  defenseMechanisms,
  difficultyThresholds,
  difficultyWeights,
  challenges,
} from "../data/security-challenges";

const STORAGE_KEY = "security-playground-progress-v1";

const createEmptyProgress = (ids: ChallengeId[]): ProgressState => {
  return ids.reduce((acc, id) => {
    acc[id] = {
      attempts: 0,
      blocked: 0,
      compromised: 0,
      safe: 0,
      lastStatus: null,
      lastUpdated: null,
    };
    return acc;
  }, {} as ProgressState);
};

const coerceNumber = (value: unknown, fallback = 0): number => {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
};

const coerceNullableNumber = (value: unknown): number | null => {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
};

const coerceStatus = (value: unknown): SimulationStatus | null => {
  if (value === "safe" || value === "blocked" || value === "compromised") {
    return value;
  }
  return null;
};

const parseStoredProgress = (
  raw: string | null,
  ids: ChallengeId[],
): ProgressState => {
  if (!raw) {
    return createEmptyProgress(ids);
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const base = createEmptyProgress(ids);

    ids.forEach((id) => {
      const entry = parsed[id] as Record<string, unknown> | undefined;
      if (!entry) return;

      base[id] = {
        attempts: coerceNumber(entry.attempts),
        blocked: coerceNumber(entry.blocked),
        compromised: coerceNumber(entry.compromised),
        safe: coerceNumber(entry.safe),
        lastStatus: coerceStatus(entry.lastStatus),
        lastUpdated: coerceNullableNumber(entry.lastUpdated),
      };
    });

    return base;
  } catch (error) {
    console.warn("SecurityPlayground: failed to parse progress", error);
    return createEmptyProgress(ids);
  }
};

export const usePersistentProgress = (ids: ChallengeId[]) => {
  const [progress, setProgress] = useState<ProgressState>(() =>
    createEmptyProgress(ids),
  );
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = parseStoredProgress(
      window.localStorage.getItem(STORAGE_KEY),
      ids,
    );
    setProgress(stored);
    setIsReady(true);
  }, [ids]);

  useEffect(() => {
    if (!isReady || typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [isReady, progress]);

  const resetProgress = useCallback(() => {
    const empty = createEmptyProgress(ids);
    setProgress(empty);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(empty));
    }
  }, [ids]);

  return { progress, setProgress, resetProgress, isReady };
};

export const buildHardenedPrompt = (
  challenge: Challenge,
  enabledDefenses: Record<DefenseId, boolean>,
): string => {
  const activeGuardrails = defenseMechanisms
    .filter((defense) => enabledDefenses[defense.id])
    .map((defense) => defense.guardrail);

  return [challenge.systemPrompt, ...activeGuardrails].join("\n");
};

export const evaluateSimulation = (
  prompt: string,
  challenge: Challenge,
  enabledDefenses: Record<DefenseId, boolean>,
): SimulationResult => {
  const normalized = prompt.toLowerCase();
  const matchedBase = baseSignals.filter((signal) =>
    normalized.includes(signal),
  );
  const matchedChallenge = challenge.exploitPatterns.filter((pattern) =>
    normalized.includes(pattern.toLowerCase()),
  );

  const matchedSignals = Array.from(
    new Set([...matchedBase, ...matchedChallenge]),
  );
  const defenseScore = defenseMechanisms.reduce((acc, defense) => {
    return acc + (enabledDefenses[defense.id] ? defense.strength : 0);
  }, 0);

  const difficultyWeight = difficultyWeights[challenge.difficulty];
  const rawScore = matchedSignals.length + difficultyWeight;
  const threshold = difficultyThresholds[challenge.difficulty];
  const effectiveScore = Math.max(0, rawScore - defenseScore);
  const riskScore =
    matchedSignals.length === 0
      ? 5
      : Math.min(100, Math.round((effectiveScore / threshold) * 100));

  let status: SimulationStatus = "safe";
  if (prompt.trim().length > 0 && matchedSignals.length > 0) {
    status = effectiveScore >= threshold ? "compromised" : "blocked";
  }

  const response =
    status === "compromised"
      ? challenge.compromisedResponse
      : status === "blocked"
        ? challenge.safeResponse
        : challenge.normalResponse;

  const reasoning =
    matchedSignals.length === 0
      ? "No injection cues detected. Normal response generated."
      : status === "blocked"
        ? "Defense layers reduced the attack impact below the compromise threshold."
        : "Attack signals exceeded defense coverage, resulting in compromise.";

  const recommendedDefenses = challenge.recommendedDefenses.filter(
    (defenseId) => !enabledDefenses[defenseId],
  );

  return {
    status,
    score: effectiveScore,
    threshold,
    matchedSignals,
    response,
    reasoning,
    recommendedDefenses,
    riskScore,
  };
};

export const useSimulation = () => {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const runSimulation = useCallback(
    (
      prompt: string,
      challenge: Challenge,
      enabledDefenses: Record<DefenseId, boolean>,
      onComplete: (res: SimulationResult) => void,
    ) => {
      if (prompt.trim().length === 0) return;

      setIsAnalyzing(true);
      setResult(null);

      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }

      timerRef.current = window.setTimeout(() => {
        const simulation = evaluateSimulation(
          prompt,
          challenge,
          enabledDefenses,
        );
        setResult(simulation);
        setIsAnalyzing(false);
        onComplete(simulation);
      }, 650);
    },
    [],
  );

  const resetSimulation = useCallback(() => {
    setResult(null);
    setIsAnalyzing(false);
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
  }, []);

  return { result, isAnalyzing, runSimulation, resetSimulation };
};
