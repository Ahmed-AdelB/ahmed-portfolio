import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitPullRequest,
  GitMerge,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export interface Contribution {
  project: string;
  title: string;
  type: "PR" | "Issue" | "Review" | "Other";
  pr_url: string;
  impact: string;
  date: Date | string; // Handle serialization
  status: "Merged" | "Open" | "Closed" | "Draft";
  description?: string;
  additions: number;
  deletions: number;
}

interface Props {
  data: Contribution[];
}

export const ContributionTimeline: React.FC<Props> = ({ data }) => {
  const [filter, setFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Normalize date strings back to Date objects if needed
  const contributions = data
    .map((c) => ({
      ...c,
      date: new Date(c.date),
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const projects = Array.from(new Set(contributions.map((c) => c.project)));

  const filteredData =
    filter === "all"
      ? contributions
      : contributions.filter((c) => c.project === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Merged":
        return "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800";
      case "Open":
        return "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800";
      case "Closed":
        return "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700";
    }
  };

  const getIcon = (status: string) => {
    switch (status) {
      case "Merged":
        return <GitMerge size={18} />;
      case "Open":
        return <GitPullRequest size={18} />;
      case "Closed":
        return <AlertCircle size={18} />;
      default:
        return <Clock size={18} />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 justify-center mb-12">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            filter === "all"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
              : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-blue-500"
          }`}
        >
          All Projects
        </button>
        {projects.map((project) => (
          <button
            key={project}
            onClick={() => setFilter(project)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === project
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-blue-500"
            }`}
          >
            {project}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 md:before:mx-auto md:before:translate-x-px md:before:h-full md:before:w-0.5 md:before:bg-gradient-to-b md:before:from-transparent md:before:via-zinc-200 md:before:to-transparent dark:md:before:via-zinc-800">
        <AnimatePresence mode="popLayout">
          {filteredData.map((item, index) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              key={item.pr_url}
              className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group`}
            >
              {/* Timeline Dot/Icon */}
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-zinc-950 shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${
                  item.status === "Merged"
                    ? "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"
                    : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
                }`}
              >
                {getIcon(item.status)}
              </div>

              {/* Card */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)]">
                <div
                  className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                    expandedId === item.pr_url ? "ring-2 ring-blue-500/20" : ""
                  }`}
                  onClick={() =>
                    setExpandedId(
                      expandedId === item.pr_url ? null : item.pr_url,
                    )
                  }
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                      {item.project}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {item.date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-2">
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-3 text-xs mb-3">
                    <span
                      className={`px-2 py-0.5 rounded-full border ${getStatusColor(item.status)}`}
                    >
                      {item.status}
                    </span>
                    <span className="text-green-600 dark:text-green-500 font-mono">
                      +{item.additions}
                    </span>
                    <span className="text-red-600 dark:text-red-500 font-mono">
                      -{item.deletions}
                    </span>
                  </div>

                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2">
                    {item.impact}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <a
                      href={item.pr_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View PR <ExternalLink size={12} />
                    </a>
                    {expandedId === item.pr_url ? (
                      <ChevronUp size={16} className="text-zinc-400" />
                    ) : (
                      <ChevronDown size={16} className="text-zinc-400" />
                    )}
                  </div>

                  <AnimatePresence>
                    {expandedId === item.pr_url && item.description && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 mt-3 text-sm text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                          <strong>Context:</strong>
                          <p className="mt-1">{item.description}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
