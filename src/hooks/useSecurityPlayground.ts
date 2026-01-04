import { useState, useEffect, useCallback, useRef } from "react";
import {
  type Challenge,
  type ChallengeId,
  type DefenseId,
  type ProgressState,
  type SimulationResult,
} from "../types/security";
import {
  createEmptyProgress,
  parseStoredProgress,
  evaluateSimulation,
} from "../lib/security-utils";

const STORAGE_KEY = "security-playground-progress-v1";

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
