import type { FC } from "react";
import type { ChallengeId, ProgressState } from "../../../types/security";

interface ProgressTrackerProps {
  progress: ProgressState;
  challengeIds: ChallengeId[];
  isReady: boolean;
  onReset: () => void;
}

export const ProgressTracker: FC<ProgressTrackerProps> = ({
  progress,
  challengeIds,
  isReady,
  onReset,
}) => {
  const progressSummary = challengeIds.reduce(
    (acc, id) => {
      const entry = progress[id];
      acc.attempts += entry.attempts;
      acc.blocked += entry.blocked;
      acc.compromised += entry.compromised;
      acc.safe += entry.safe;
      if (entry.blocked > 0) acc.completed += 1;
      return acc;
    },
    {
      attempts: 0,
      blocked: 0,
      compromised: 0,
      safe: 0,
      completed: 0,
    },
  );

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-950/50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Progress Tracker
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isReady ? "Saved locally in your browser" : "Loading progress..."}
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:text-slate-300"
        >
          Reset
        </button>
      </div>
      <div className="mt-4 grid gap-4 rounded-xl bg-slate-50/80 p-4 text-center text-sm dark:bg-slate-900/60">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">
            Challenges completed
          </span>
          <span className="text-base font-semibold text-slate-900 dark:text-white">
            {progressSummary.completed}/{challengeIds.length}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">
            Total attempts
          </span>
          <span className="text-base font-semibold text-slate-900 dark:text-white">
            {progressSummary.attempts}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">Blocked</span>
          <span className="text-base font-semibold text-emerald-600 dark:text-emerald-300">
            {progressSummary.blocked}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">
            Compromised
          </span>
          <span className="text-base font-semibold text-rose-600 dark:text-rose-300">
            {progressSummary.compromised}
          </span>
        </div>
      </div>
    </div>
  );
};
