import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type RateLimitTarget = "chat" | "newsletter";

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
};

const UPSTASH_REDIS_REST_URL = import.meta.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = import.meta.env.UPSTASH_REDIS_REST_TOKEN;

const upstashEnabled =
  typeof UPSTASH_REDIS_REST_URL === "string" &&
  UPSTASH_REDIS_REST_URL.length > 0 &&
  typeof UPSTASH_REDIS_REST_TOKEN === "string" &&
  UPSTASH_REDIS_REST_TOKEN.length > 0;

const redis = upstashEnabled
  ? new Redis({
      url: UPSTASH_REDIS_REST_URL,
      token: UPSTASH_REDIS_REST_TOKEN,
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
    }
  : null;

let hasWarnedMissingEnv = false;

const warnMissingEnv = (): void => {
  if (hasWarnedMissingEnv) return;
  hasWarnedMissingEnv = true;
  console.warn(
    "Upstash Redis is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.",
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
  const limiter = rateLimiters?.[options.type] ?? null;
  if (!limiter) {
    if (!upstashEnabled) {
      warnMissingEnv();
    }
    return { allowed: true };
  }

  const identifier =
    options.ip?.trim() || getClientIp(options.request, options.clientAddress);

  try {
    const result = await limiter.limit(identifier);
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
    console.error("Rate limit check failed:", error);
    return { allowed: true };
  }
};
