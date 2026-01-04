import type { FC } from "react";
import { Shield } from "lucide-react";
import {
  type SimulationResult,
  defenseMap,
  statusMeta,
} from "../../../data/security-challenges";

interface ResultDisplayProps {
  isAnalyzing: boolean;
  result: SimulationResult | null;
}

export const ResultDisplay: FC<ResultDisplayProps> = ({
  isAnalyzing,
  result,
}) => {
  const statusDetails = result ? statusMeta[result.status] : null;
  const StatusIcon = statusDetails?.icon ?? Shield;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-950/50">
      <div className="flex items-center gap-2">
        <StatusIcon className="h-4 w-4 text-emerald-500" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Simulation Result
        </p>
      </div>
      {isAnalyzing && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
          Analyzing prompt injection signals...
        </div>
      )}
      {!isAnalyzing && !result && (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Run the simulation to see the model response and defense impact.
        </div>
      )}
      {result && (
        <div className="mt-4 space-y-4" aria-live="polite">
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${statusDetails?.tone}`}
          >
            <p className="font-semibold">{statusDetails?.label}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
              {result.reasoning}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Risk meter
            </p>
            <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className={`h-2 rounded-full ${
                  result.status === "compromised"
                    ? "bg-rose-500"
                    : result.status === "blocked"
                      ? "bg-emerald-500"
                      : "bg-slate-400"
                }`}
                style={{ width: `${result.riskScore}%` }}
              />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Simulated response
            </p>
            <pre className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200">
              {result.response}
            </pre>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Detected signals
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {result.matchedSignals.length === 0 && (
                <span className="rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  No injection cues detected
                </span>
              )}
              {result.matchedSignals.map((signal) => (
                <span
                  key={signal}
                  className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-700 dark:border-emerald-700/40 dark:bg-emerald-950/40 dark:text-emerald-200"
                >
                  {signal}
                </span>
              ))}
            </div>
          </div>
          {result.recommendedDefenses.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Recommended defenses
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.recommendedDefenses.map((defenseId) => (
                  <span
                    key={defenseId}
                    className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-700 dark:border-amber-700/40 dark:bg-amber-950/40 dark:text-amber-200"
                  >
                    {defenseMap[defenseId].name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
