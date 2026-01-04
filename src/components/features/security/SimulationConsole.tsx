import type { FC } from "react";
import { Gauge, Target } from "lucide-react";
import type { Challenge } from "../../../types/security";

interface SimulationConsoleProps {
  activeChallenge: Challenge;
  promptInput: string;
  isAnalyzing: boolean;
  onPromptChange: (value: string) => void;
  onResetPrompt: () => void;
  onRunSimulation: () => void;
}

export const SimulationConsole: FC<SimulationConsoleProps> = ({
  activeChallenge,
  promptInput,
  isAnalyzing,
  onPromptChange,
  onResetPrompt,
  onRunSimulation,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-950/50">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500">
            Simulation Console
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {activeChallenge.title}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
            <Target className="h-3.5 w-3.5 text-emerald-500" />
            {activeChallenge.difficulty}
          </span>
          <span className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-600/40 dark:bg-emerald-950/40 dark:text-emerald-300">
            <Gauge className="h-3.5 w-3.5" />
            {activeChallenge.goal}
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200/70 bg-slate-50/80 p-4 text-sm text-slate-600 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-300">
        <p className="font-semibold text-slate-700 dark:text-slate-100">
          Scenario
        </p>
        <p className="mt-1 leading-relaxed">{activeChallenge.context}</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              System Prompt
            </p>
            <span className="text-xs text-slate-400">Read-only</span>
          </div>
          <pre className="mt-2 max-h-40 overflow-auto rounded-xl border border-slate-200 bg-slate-100/80 p-3 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200">
            {activeChallenge.systemPrompt}
          </pre>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Attacker Prompt
            </p>
            <button
              type="button"
              onClick={onResetPrompt}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-500"
            >
              Reset sample
            </button>
          </div>
          <textarea
            value={promptInput}
            onChange={(event) => onPromptChange(event.target.value)}
            rows={5}
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
            aria-label="Attacker prompt input"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={onRunSimulation}
          disabled={isAnalyzing || promptInput.trim().length === 0}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isAnalyzing ? "Analyzing..." : "Run simulation"}
        </button>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          This is a local simulation. No external model calls are made.
        </p>
      </div>
    </div>
  );
};
