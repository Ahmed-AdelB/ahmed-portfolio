import type { APIRoute } from "astro";

interface LinkedInStats {
  connections: number;
  followers: number;
  endorsements: number;
  recommendations: number;
  topSkills: string[];
  headline: string;
  profileUrl: string;
  lastUpdated: string;
}

// Cache for LinkedIn stats (server-side)
let statsCache: { data: LinkedInStats; timestamp: number } | null = null;
const CACHE_TTL = 3600 * 1000; // 1 hour

// Default stats - can be updated via environment variables or external service
const getDefaultStats = (): LinkedInStats => ({
  connections: parseInt(import.meta.env.LINKEDIN_CONNECTIONS || "500"),
  followers: parseInt(import.meta.env.LINKEDIN_FOLLOWERS || "750"),
  endorsements: parseInt(import.meta.env.LINKEDIN_ENDORSEMENTS || "45"),
  recommendations: parseInt(import.meta.env.LINKEDIN_RECOMMENDATIONS || "8"),
  topSkills: (import.meta.env.LINKEDIN_TOP_SKILLS || "Python,TypeScript,Security,AI/ML,Cloud Architecture").split(","),
  headline: import.meta.env.LINKEDIN_HEADLINE || "Security Engineer & AI Developer",
  profileUrl: import.meta.env.LINKEDIN_PROFILE_URL || "https://linkedin.com/in/ahmedadelb",
  lastUpdated: new Date().toISOString(),
});

export const GET: APIRoute = async ({ request }) => {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=3600, s-maxage=3600",
    "Access-Control-Allow-Origin": "*",
  };

  try {
    // Check cache
    if (statsCache && Date.now() - statsCache.timestamp < CACHE_TTL) {
      return new Response(JSON.stringify(statsCache.data), {
        status: 200,
        headers,
      });
    }

    // Try to fetch from external service if configured
    const externalEndpoint = import.meta.env.LINKEDIN_EXTERNAL_API;
    let stats: LinkedInStats;

    if (externalEndpoint) {
      try {
        const response = await fetch(externalEndpoint, {
          headers: {
            Authorization: `Bearer ${import.meta.env.LINKEDIN_API_TOKEN || ""}`,
          },
        });

        if (response.ok) {
          const externalData = await response.json();
          stats = {
            ...getDefaultStats(),
            ...externalData,
            lastUpdated: new Date().toISOString(),
          };
        } else {
          stats = getDefaultStats();
        }
      } catch {
        stats = getDefaultStats();
      }
    } else {
      stats = getDefaultStats();
    }

    // Update cache
    statsCache = {
      data: stats,
      timestamp: Date.now(),
    };

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("LinkedIn API error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch LinkedIn stats",
        ...getDefaultStats(),
      }),
      {
        status: 200, // Return 200 with fallback data
        headers,
      }
    );
  }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};
