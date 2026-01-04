import type { FC } from "react";
import { Lock } from "lucide-react";
import {
  type DefenseId,
  defenseMechanisms,
} from "../../../data/security-challenges";

interface DefenseControlProps {
  enabledDefenses: Record<DefenseId, boolean>;
  onToggleDefense: (id: DefenseId) => void;
  hardenedPrompt: string;
}

export const DefenseControl: FC<DefenseControlProps> = ({
  enabledDefenses,
  onToggleDefense,
  hardenedPrompt,
}) => {
  const enabledDefenseList = defenseMechanisms.filter(
    (defense) => enabledDefenses[defense.id],
  );

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-950/50">
      <div className="flex items-center gap-2">
        <Lock className="h-4 w-4 text-emerald-500" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Defense Mechanism Demo
        </p>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Toggle defenses to see how the hardened prompt evolves.
      </p>
      <div className="mt-4 grid gap-3">
        {defenseMechanisms.map((defense) => {
          const isEnabled = enabledDefenses[defense.id];
          return (
            <label
              key={defense.id}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 transition ${
                isEnabled
                  ? "border-emerald-300 bg-emerald-50/70 dark:border-emerald-500/40 dark:bg-emerald-950/40"
                  : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
              }`}
            >
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={() => onToggleDefense(defense.id)}
                className="mt-1 h-4 w-4 accent-emerald-500"
                aria-label={`Toggle ${defense.name}`}
              />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {defense.name}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {defense.description}
                </p>
              </div>
            </label>
          );
        })}
      </div>
      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
        <p className="font-semibold text-slate-700 dark:text-slate-100">
          Hardened prompt preview
        </p>
        <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap">
          {hardenedPrompt}
        </pre>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span className="rounded-full border border-slate-200 px-2 py-1 dark:border-slate-700">
          Active defenses: {enabledDefenseList.length}/{defenseMechanisms.length}
        </span>
        {enabledDefenseList.map((defense) => (
          <span
            key={defense.id}
            className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700 dark:border-emerald-700/40 dark:bg-emerald-950/40 dark:text-emerald-200"
          >
            {defense.name}
          </span>
        ))}
      </div>
    </div>
  );
};
