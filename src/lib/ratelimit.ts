import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { config, isUpstashConfigured } from "./config";

export type RateLimitTarget = "chat" | "newsletter" | "health";

type RateLimitConfig = {
  limit: number;
  window: `${number} ${"m" | "s" | "h" | "d"}`;
  prefix: string;
};

type RateLimitDecision =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number; headers: Headers };

type RateLimitCheckOptions = {
  request: Request;
  clientAddress?: string | null;
  type: RateLimitTarget;
  ip?: string | null;
};

const RATE_LIMIT_CONFIG: Record<RateLimitTarget, RateLimitConfig> = {
  chat: { limit: 10, window: "1 m", prefix: "ratelimit:chat" },
  newsletter: { limit: 5, window: "1 m", prefix: "ratelimit:newsletter" },
  health: { limit: 60, window: "1 m", prefix: "ratelimit:health" },
};

// --- In-Memory Fallback ---
class MemoryRateLimiter {
  private requests = new Map<string, number[]>();
  private maxRequests: number;
  private windowMs: number;

  constructor(limit: number, windowMs: number) {
    this.maxRequests = limit;
    this.windowMs = windowMs;
  }

  limit(identifier: string): { success: boolean; limit: number; remaining: number; reset: number } {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    let timestamps = this.requests.get(identifier) || [];
    // Cleanup old timestamps
    timestamps = timestamps.filter((t) => t > windowStart);

    if (timestamps.length >= this.maxRequests) {
      return {
        success: false,
        limit: this.maxRequests,
        remaining: 0,
        reset: (timestamps[0] || now) + this.windowMs,
      };
    }

    timestamps.push(now);
    this.requests.set(identifier, timestamps);

    return {
      success: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - timestamps.length,
      reset: now + this.windowMs,
    };
  }
}

const parseWindowToMs = (window: string): number => {
  const [value, unit] = window.split(" ");
  const v = parseInt(value, 10);
  switch (unit) {
    case "s": return v * 1000;
    case "m": return v * 60000;
    case "h": return v * 3600000;
    case "d": return v * 86400000;
    default: return 60000;
  }
};

const memoryLimiters: Record<RateLimitTarget, MemoryRateLimiter> = {
  chat: new MemoryRateLimiter(
    RATE_LIMIT_CONFIG.chat.limit,
    parseWindowToMs(RATE_LIMIT_CONFIG.chat.window)
  ),
  newsletter: new MemoryRateLimiter(
    RATE_LIMIT_CONFIG.newsletter.limit,
    parseWindowToMs(RATE_LIMIT_CONFIG.newsletter.window)
  ),
  health: new MemoryRateLimiter(
    RATE_LIMIT_CONFIG.health.limit,
    parseWindowToMs(RATE_LIMIT_CONFIG.health.window)
  ),
};
// --------------------------

const UPSTASH_REDIS_REST_URL = config.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = config.UPSTASH_REDIS_REST_TOKEN;

const upstashEnabled = isUpstashConfigured();

const redis = upstashEnabled
  ? new Redis({
      url: UPSTASH_REDIS_REST_URL!,
      token: UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

const rateLimiters: Record<RateLimitTarget, Ratelimit> | null = redis
  ? {
      chat: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(
          RATE_LIMIT_CONFIG.chat.limit,
          RATE_LIMIT_CONFIG.chat.window,
        ),
        prefix: RATE_LIMIT_CONFIG.chat.prefix,
      }),
      newsletter: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(
          RATE_LIMIT_CONFIG.newsletter.limit,
          RATE_LIMIT_CONFIG.newsletter.window,
        ),
        prefix: RATE_LIMIT_CONFIG.newsletter.prefix,
      }),
      health: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(
          RATE_LIMIT_CONFIG.health.limit,
          RATE_LIMIT_CONFIG.health.window,
        ),
        prefix: RATE_LIMIT_CONFIG.health.prefix,
      }),
    }
  : null;

let hasWarnedMissingEnv = false;

const warnMissingEnv = (): void => {
  if (hasWarnedMissingEnv) return;
  hasWarnedMissingEnv = true;
  console.warn(
    "Upstash Redis is not configured. Using in-memory fallback rate limiting.",
  );
};

export const getClientIp = (
  request: Request,
  clientAddress?: string | null,
): string => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const [first] = forwardedFor.split(",");
    if (first?.trim()) {
      return first.trim();
    }
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp?.trim()) {
    return realIp.trim();
  }

  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp?.trim()) {
    return cfIp.trim();
  }

  if (clientAddress?.trim()) {
    return clientAddress.trim();
  }

  return "unknown";
};

export const checkRateLimit = async (
  options: RateLimitCheckOptions,
): Promise<RateLimitDecision> => {
  const identifier =
    options.ip?.trim() || getClientIp(options.request, options.clientAddress);

  const redisLimiter = rateLimiters?.[options.type];
  
  // Try Redis first
  if (redisLimiter) {
    try {
      const result = await redisLimiter.limit(identifier);
      void result.pending;

      if (result.success) {
        return { allowed: true };
      }

      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((result.reset - Date.now()) / 1000),
      );

      const headers = new Headers({
        "Retry-After": retryAfterSeconds.toString(),
        "RateLimit-Limit": result.limit.toString(),
        "RateLimit-Remaining": result.remaining.toString(),
        "RateLimit-Reset": Math.ceil(result.reset / 1000).toString(),
      });

      return { allowed: false, retryAfterSeconds, headers };
    } catch (error) {
      console.error("Redis rate limit check failed, falling back to memory:", error);
      // Fall through to memory limiter
    }
  } else {
    if (!upstashEnabled) {
      warnMissingEnv();
    }
  }

  // Fallback to Memory Limiter
  const memoryLimiter = memoryLimiters[options.type];
  const result = memoryLimiter.limit(identifier);

  if (result.success) {
    return { allowed: true };
  }

  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((result.reset - Date.now()) / 1000),
  );

  const headers = new Headers({
    "Retry-After": retryAfterSeconds.toString(),
    "RateLimit-Limit": result.limit.toString(),
    "RateLimit-Remaining": result.remaining.toString(),
    "RateLimit-Reset": Math.ceil(result.reset / 1000).toString(),
    "X-RateLimit-Type": "memory-fallback" // useful for debugging
  });

  return { allowed: false, retryAfterSeconds, headers };
};