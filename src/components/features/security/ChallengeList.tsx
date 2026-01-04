import type { FC } from "react";
import { Sparkles } from "lucide-react";
import type { Challenge, ChallengeId, ProgressState } from "../../../types/security";

interface ChallengeListProps {
  challenges: ReadonlyArray<Challenge>;
  selectedChallengeId: ChallengeId;
  onSelectChallenge: (id: ChallengeId) => void;
  progress: ProgressState;
}

export const ChallengeList: FC<ChallengeListProps> = ({
  challenges,
  selectedChallengeId,
  onSelectChallenge,
  progress,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-950/50">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 uppercase tracking-[0.2em]">
        <Sparkles className="h-4 w-4 text-emerald-500" />
        Challenges
      </div>
      <div className="mt-4 space-y-3">
        {challenges.map((challenge) => {
          const isActive = challenge.id === selectedChallengeId;
          const progressEntry = progress[challenge.id];
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
              onClick={() => onSelectChallenge(challenge.id)}
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
  );
};
