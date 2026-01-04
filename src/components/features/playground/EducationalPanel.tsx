import type { FC } from "react";
import { BookOpen as BookOpenIcon } from "lucide-react";
import type { Challenge } from "../../../data/security-challenges";

interface EducationalPanelProps {
  activeChallenge: Challenge;
}

export const EducationalPanel: FC<EducationalPanelProps> = ({
  activeChallenge,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-950/50">
      <div className="flex items-center gap-2">
        <BookOpenIcon className="h-4 w-4 text-emerald-500" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Educational Explanation
        </p>
      </div>
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
        {activeChallenge.lesson}
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {activeChallenge.takeaways.map((takeaway) => (
          <div
            key={takeaway}
            className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300"
          >
            {takeaway}
          </div>
        ))}
      </div>
    </div>
  );
};
