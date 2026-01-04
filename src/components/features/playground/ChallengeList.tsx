import type { FC } from "react";
import { Sparkles, Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import type {
  Challenge,
  ChallengeId,
  ProgressState,
  SimulationStatus,
} from "../../../data/security-challenges";

interface ChallengeListProps {
  challenges: ReadonlyArray<Challenge>;
  progress: ProgressState;
  selectedChallengeId: ChallengeId;
  onSelectChallenge: (id: ChallengeId) => void;
  progressSummary: {
    attempts: number;
    blocked: number;
    compromised: number;
    safe: number;
    completed: number;
  };
  isReady: boolean;
  onResetProgress: () => void;
}

export const ChallengeList: FC<ChallengeListProps> = ({
  challenges,
  progress,
  selectedChallengeId,
  onSelectChallenge,
  progressSummary,
  isReady,
  onResetProgress,
}) => {
  return (
    <aside className="space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-950/50">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 uppercase tracking-[0.2em]">
          <Sparkles className="h-4 w-4 text-emerald-500" />
          Challenges
        </div>
        <div className="mt-4 space-y-3">
          {challenges.map((challenge) => {
            const isActive = challenge.id === selectedChallengeId;
            const progressEntry = progress[challenge.id as ChallengeId];
            const status = progressEntry.lastStatus;
            const statusTone =
              status === "blocked"
                ? "bg-emerald-500"
                : status === "compromised"
                  ? "bg-rose-500"
                  : "bg-slate-300";

            return (
              <button
                key={challenge.id}
                type="button"
                onClick={() => onSelectChallenge(challenge.id as ChallengeId)}
                className={`w-full rounded-xl border px-4 py-3 text-left transition-all ${
                  isActive
                    ? "border-emerald-400/70 bg-emerald-50/60 shadow-md dark:border-emerald-500/40 dark:bg-emerald-950/40"
                    : "border-slate-200/70 bg-white hover:border-emerald-200 hover:bg-emerald-50/40 dark:border-slate-800/60 dark:bg-slate-950/50 dark:hover:border-emerald-500/30"
                }`}
                aria-pressed={isActive}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {challenge.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {challenge.goal}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="rounded-full border border-slate-200 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:border-slate-700 dark:text-slate-300">
                      {challenge.difficulty}
                    </span>
                    <span
                      className={`h-2 w-2 rounded-full ${statusTone}`}
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

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
            onClick={onResetProgress}
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
              {progressSummary.completed}/{challenges.length}
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
            <span className="text-slate-500 dark:text-slate-400">
              Blocked
            </span>
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
    </aside>
  );
};
