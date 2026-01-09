import { useState, useEffect } from "react";

interface LinkedInStats {
  connections: number;
  followers: number;
  endorsements: number;
  recommendations: number;
  topSkills: string[];
  headline: string;
  loading: boolean;
  error: boolean;
}

const CACHE_KEY = "linkedin-stats-cache";
const CACHE_TTL = 3600 * 1000; // 1 hour

const FALLBACK_STATS: Omit<LinkedInStats, "loading" | "error"> = {
  connections: 500,
  followers: 750,
  endorsements: 45,
  recommendations: 8,
  topSkills: [
    "Python",
    "TypeScript",
    "Security",
    "AI/ML",
    "Cloud Architecture",
  ],
  headline: "Security Engineer & AI Developer",
};

export const useLinkedInStats = () => {
  const [stats, setStats] = useState<LinkedInStats>({
    ...FALLBACK_STATS,
    loading: true,
    error: false,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const statsEndpoint = import.meta.env.PUBLIC_LINKEDIN_STATS_ENDPOINT;

      // Check cache first
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { timestamp, data } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            setStats({ ...data, loading: false, error: false });
            return;
          }
        } catch {
          localStorage.removeItem(CACHE_KEY);
        }
      }

      // If no endpoint configured, use fallback with env overrides
      if (!statsEndpoint) {
        const envStats = {
          connections:
            parseInt(import.meta.env.PUBLIC_LINKEDIN_CONNECTIONS || "0") ||
            FALLBACK_STATS.connections,
          followers:
            parseInt(import.meta.env.PUBLIC_LINKEDIN_FOLLOWERS || "0") ||
            FALLBACK_STATS.followers,
          endorsements:
            parseInt(import.meta.env.PUBLIC_LINKEDIN_ENDORSEMENTS || "0") ||
            FALLBACK_STATS.endorsements,
          recommendations:
            parseInt(import.meta.env.PUBLIC_LINKEDIN_RECOMMENDATIONS || "0") ||
            FALLBACK_STATS.recommendations,
          topSkills:
            import.meta.env.PUBLIC_LINKEDIN_TOP_SKILLS?.split(",") ||
            FALLBACK_STATS.topSkills,
          headline:
            import.meta.env.PUBLIC_LINKEDIN_HEADLINE || FALLBACK_STATS.headline,
        };

        setStats({
          ...envStats,
          loading: false,
          error: false,
        });
        return;
      }

      try {
        const response = await fetch(statsEndpoint, {
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error("LinkedIn stats endpoint error");
        }

        const data = (await response.json()) as Partial<LinkedInStats>;
        const newStats = {
          connections: data.connections ?? FALLBACK_STATS.connections,
          followers: data.followers ?? FALLBACK_STATS.followers,
          endorsements: data.endorsements ?? FALLBACK_STATS.endorsements,
          recommendations:
            data.recommendations ?? FALLBACK_STATS.recommendations,
          topSkills: data.topSkills ?? FALLBACK_STATS.topSkills,
          headline: data.headline ?? FALLBACK_STATS.headline,
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
        console.warn("Error fetching LinkedIn stats:", error);
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
