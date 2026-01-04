import { useState, useEffect } from "react";

interface GitHubStats {
  repos: number;
  commits: number;
  prs: number;
  contributions: number;
  loading: boolean;
  error: boolean;
}

const CACHE_KEY = "github-stats-cache";
const CACHE_TTL = 3600 * 1000; // 1 hour

const FALLBACK_STATS = {
  repos: 12,
  commits: 450,
  prs: 25,
  contributions: 850,
};

export const useGitHubStats = () => {
  const [stats, setStats] = useState<GitHubStats>({
    repos: 0,
    commits: 0,
    prs: 0,
    contributions: 0,
    loading: true,
    error: false,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const statsEndpoint = import.meta.env.PUBLIC_GITHUB_STATS_ENDPOINT;

      if (!statsEndpoint) {
        setStats({
          ...FALLBACK_STATS,
          loading: false,
          error: true,
        });
        return;
      }

      // Check cache
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { timestamp, data } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          setStats({ ...data, loading: false, error: false });
          return;
        }
      }

      try {
        const response = await fetch(statsEndpoint, {
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error("GitHub stats endpoint error");
        }

        const data = (await response.json()) as Partial<GitHubStats>;
        const newStats = {
          repos: data.repos ?? FALLBACK_STATS.repos,
          commits: data.commits ?? FALLBACK_STATS.commits,
          prs: data.prs ?? FALLBACK_STATS.prs,
          contributions: data.contributions ?? FALLBACK_STATS.contributions,
        };

        setStats({ ...newStats, loading: false, error: false });

        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            timestamp: Date.now(),
            data: newStats,
          }),
        );
      } catch (error) {
        console.warn("Error fetching GitHub stats:", error);
        setStats({
          ...FALLBACK_STATS,
          loading: false,
          error: true,
        });
      }
    };

    fetchStats();
  }, []);

  return stats;
};
