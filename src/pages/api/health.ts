import type { APIRoute } from "astro";
import { z } from "zod";

export const prerender = false;

const HealthCheckSchema = z.object({
  name: z.string(),
  status: z.enum(["pass", "fail"]),
  message: z.string().optional(),
});

const HealthResponseSchema = z.object({
  status: z.enum(["healthy", "degraded", "unhealthy"]),
  timestamp: z.string(),
  version: z.string(),
  uptime: z.number(),
  checks: z.array(HealthCheckSchema),
});

type HealthResponse = z.infer<typeof HealthResponseSchema>;

const startTime = Date.now();

const getVersion = (): string => {
  return process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local";
};

const jsonResponse = (status: number, payload: HealthResponse): Response =>
  new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });

export const GET: APIRoute = async () => {
  const checks: HealthResponse["checks"] = [];
  let overallStatus: HealthResponse["status"] = "healthy";

  // Check 1: Basic runtime check
  checks.push({
    name: "runtime",
    status: "pass",
    message: "Astro runtime operational",
  });

  // Check 2: Environment check
  const envCheck = typeof process !== "undefined";
  checks.push({
    name: "environment",
    status: envCheck ? "pass" : "fail",
    message: envCheck
      ? "Node environment available"
      : "Environment not available",
  });

  // Check 3: Memory check (if available)
  try {
    if (typeof process !== "undefined" && process.memoryUsage) {
      const memory = process.memoryUsage();
      const heapUsedMB = Math.round(memory.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(memory.heapTotal / 1024 / 1024);
      const usagePercent = Math.round(
        (memory.heapUsed / memory.heapTotal) * 100,
      );

      checks.push({
        name: "memory",
        status: usagePercent < 90 ? "pass" : "fail",
        message: `Heap: ${heapUsedMB}MB / ${heapTotalMB}MB (${usagePercent}%)`,
      });

      if (usagePercent >= 90) {
        overallStatus = "degraded";
      }
    }
  } catch {
    // Memory check not available in all environments
  }

  // Determine if any checks failed
  const failedChecks = checks.filter((c) => c.status === "fail");
  if (failedChecks.length > 0) {
    overallStatus =
      failedChecks.length === checks.length ? "unhealthy" : "degraded";
  }

  const response: HealthResponse = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: getVersion(),
    uptime: Math.round((Date.now() - startTime) / 1000),
    checks,
  };

  // Validate response against schema in development for extra safety
  if (import.meta.env.DEV) {
    const result = HealthResponseSchema.safeParse(response);
    if (!result.success) {
      console.error("Health check response validation failed:", result.error);
    }
  }

  const httpStatus = overallStatus === "unhealthy" ? 503 : 200;
  return jsonResponse(httpStatus, response);
};

// Also support HEAD requests for lightweight checks
export const HEAD: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
};
