import { useCallback, useEffect, useState } from "react";
import {
  createEmptyProgress,
  parseStoredProgress,
} from "../lib/security-utils";
import type { ChallengeId, ProgressState } from "../types/security";

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
