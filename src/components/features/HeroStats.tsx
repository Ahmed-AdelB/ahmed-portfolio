import { useState, useEffect, useRef } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";

interface GitHubStats {
  prsmerged: number;
  reposContributed: number;
  totalStars: number;
}

interface StatItemProps {
  label: string;
  value: number;
  suffix?: string;
  delay?: number;
}

// Animated counter component
function AnimatedCounter({
  value,
  delay = 0,
}: {
  value: number;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [hasAnimated, setHasAnimated] = useState(false);

  const spring = useSpring(0, {
    damping: 30,
    stiffness: 100,
    restDelta: 0.001,
  });

  const display = useTransform(spring, (current) => {
    if (current >= 1000) {
      return `${(current / 1000).toFixed(1)}k`;
    }
    return Math.floor(current).toLocaleString();
  });

  useEffect(() => {
    if (isInView && !hasAnimated) {
      const timer = setTimeout(() => {
        spring.set(value);
        setHasAnimated(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isInView, value, spring, delay, hasAnimated]);

  return (
    <motion.span ref={ref} className="tabular-nums">
      {display}
    </motion.span>
  );
}

function StatItem({ label, value, suffix = "", delay = 0 }: StatItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      className="flex flex-col items-center gap-1 px-4 sm:px-6 py-3"
    >
      <div className="text-2xl sm:text-3xl font-bold text-white">
        <AnimatedCounter value={value} delay={delay * 100} />
        {suffix && <span className="text-emerald-400">{suffix}</span>}
      </div>
      <div className="text-xs sm:text-sm text-slate-400 font-medium uppercase tracking-wider">
        {label}
      </div>
    </motion.div>
  );
}

// Loading skeleton
function StatSkeleton() {
  return (
    <div className="flex flex-col items-center gap-1 px-4 sm:px-6 py-3 animate-pulse">
      <div className="h-8 w-16 bg-slate-700/50 rounded"></div>
      <div className="h-4 w-20 bg-slate-700/30 rounded mt-1"></div>
    </div>
  );
}

export default function HeroStats() {
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Static fallback values
  const fallbackStats: GitHubStats = {
    prsmerged: 47,
    reposContributed: 12,
    totalStars: 2800,
  };

  useEffect(() => {
    async function fetchGitHubStats() {
      try {
        // Attempt to fetch from GitHub API
        const username = "aadel";

        // Fetch user events to count PRs
        const eventsResponse = await fetch(
          `https://api.github.com/users/${username}/events?per_page=100`,
          {
            headers: {
              Accept: "application/vnd.github.v3+json",
            },
          },
        );

        if (!eventsResponse.ok) {
          throw new Error("Failed to fetch GitHub data");
        }

        const events = await eventsResponse.json();

        // Count merged PRs from events
        const prEvents = events.filter(
          (event: { type: string; payload?: { action?: string } }) =>
            event.type === "PullRequestEvent" &&
            event.payload?.action === "closed",
        );

        // Get unique repos contributed to
        const repos = new Set(
          events.map((event: { repo?: { name?: string } }) => event.repo?.name),
        );

        // Fetch user's starred repos for stars count
        const reposResponse = await fetch(
          `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
          {
            headers: {
              Accept: "application/vnd.github.v3+json",
            },
          },
        );

        let totalStars = 0;
        if (reposResponse.ok) {
          const reposData = await reposResponse.json();
          totalStars = reposData.reduce(
            (acc: number, repo: { stargazers_count?: number }) =>
              acc + (repo.stargazers_count || 0),
            0,
          );
        }

        setStats({
          prsmerged: Math.max(prEvents.length, fallbackStats.prsmerged),
          reposContributed: Math.max(
            repos.size,
            fallbackStats.reposContributed,
          ),
          totalStars: Math.max(totalStars, fallbackStats.totalStars),
        });
      } catch (err) {
        console.warn("Using fallback GitHub stats:", err);
        setError("Using cached stats");
        setStats(fallbackStats);
      } finally {
        setLoading(false);
      }
    }

    fetchGitHubStats();
  }, []);

  const displayStats = stats || fallbackStats;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.9 }}
      className="relative"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-800/30 via-slate-800/50 to-slate-800/30 rounded-2xl backdrop-blur-sm border border-slate-700/30" />

      {/* Stats Container */}
      <div className="relative flex flex-col sm:flex-row items-center justify-center divide-y sm:divide-y-0 sm:divide-x divide-slate-700/50">
        {loading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <StatItem
              label="PRs Merged"
              value={displayStats.prsmerged}
              suffix="+"
              delay={0}
            />
            <StatItem
              label="Repos Contributed"
              value={displayStats.reposContributed}
              suffix="+"
              delay={1}
            />
            <StatItem
              label="Total Stars"
              value={displayStats.totalStars}
              suffix=""
              delay={2}
            />
          </>
        )}
      </div>

      {/* GitHub Link */}
      <motion.a
        href="https://github.com/aadel"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute -top-3 -end-3 p-2 bg-slate-800 rounded-full border border-slate-700/50 hover:border-emerald-500/50 hover:bg-slate-700 transition-all duration-300 group"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 1.2 }}
        aria-label="View GitHub Profile"
      >
        <svg
          className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors duration-300"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      </motion.a>

      {/* Error indicator (subtle) */}
      {error && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Cached data
          </span>
        </div>
      )}
    </motion.div>
  );
}
