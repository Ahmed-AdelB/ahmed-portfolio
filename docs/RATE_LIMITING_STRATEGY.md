# Rate Limiting Strategy for Portfolio APIs

**Author:** Ahmed Adel Bakr Alderai
**Date:** January 3, 2026

## Executive Summary

To protect the portfolio's AI and Newsletter APIs from abuse and cost overruns, we require a robust rate limiting strategy. After evaluating options compatible with our Vercel + Astro serverless architecture, we recommend a **Redis-backed Token Bucket** approach using **Upstash**.

## Research Findings

### 1. Upstash Redis Rate Limiting (`@upstash/ratelimit`)

- **Verdict:** ✅ **Recommended**
- **Pros:**
  - Designed specifically for serverless/edge environments (HTTP-based, stateless clients).
  - Durable state: Limits persist across independent serverless function invocations.
  - Global: Counts are shared across regions (if configured) or at least consistent per region.
  - Free Tier: Upstash offers a generous free tier (10k requests/day) suitable for a portfolio.
- **Cons:**
  - External dependency (Upstash).

### 2. Vercel Edge Middleware

- **Verdict:** ⚠️ **Partial Solution**
- **Analysis:** Vercel Middleware runs before the cache, at the edge. It is the _perfect place_ to enforce limits. However, Middleware itself is stateless. It _needs_ a store.
- **Strategy:** We will use Vercel/Astro Middleware _as the enforcement point_, but it must query Upstash Redis to maintain the counts.

### 3. In-Memory Rate Limiting

- **Verdict:** ❌ **Not Recommended**
- **Analysis:** In a serverless environment (Vercel Functions), memory is not shared between requests. A variable `let requestCount = 0` resets every time the function wakes up or scales. This makes in-memory rate limiting ineffective for limiting users across multiple requests.

---

## Implementation Plan

We will implement a **Sliding Window** or **Token Bucket** rate limiter using `@upstash/ratelimit` within an Astro Middleware. This ensures all API routes are protected uniformly without code duplication.

### Step 1: Dependencies

Install the required packages:

```bash
npm install @upstash/ratelimit @upstash/redis
```

### Step 2: Configuration

Add the following to `.env`:

```env
UPSTASH_REDIS_REST_URL="your_upstash_url"
UPSTASH_REDIS_REST_TOKEN="your_upstash_token"
```

### Step 3: Rate Limiter Library (`src/lib/ratelimit.ts`)

This utility initializes the Redis client and defines our limits.

```typescript
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Initialize Redis client
// We use a try/catch or non-null assertion depending on strictness preferences,
// but for a portfolio, we can fail gracefully if not configured.
const redis = new Redis({
  url: import.meta.env.UPSTASH_REDIS_REST_URL || "",
  token: import.meta.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Create a new ratelimiter, that allows 10 requests per 10 seconds
// Analytics/Chat: 5 requests per 1 hour per IP?
// Let's go with:
// Chat: 10 requests per day (Cost control)
// Newsletter: 5 requests per hour (Spam control)

export const chatLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 d"),
  analytics: true,
  prefix: "@upstash/ratelimit/chat",
});

export const newsletterLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  analytics: true,
  prefix: "@upstash/ratelimit/newsletter",
});
```

### Step 4: Middleware Enforcement (`src/middleware.ts`)

Astro middleware allows us to intercept requests before they hit the API routes.

```typescript
import { defineMiddleware } from "astro:middleware";
import { chatLimiter, newsletterLimiter } from "./lib/ratelimit";

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, url, clientAddress } = context;

  // Only run on API routes
  if (!url.pathname.startsWith("/api/")) {
    return next();
  }

  // Identify the user (IP address)
  // Vercel/Astro provides clientAddress, or we fallback to headers
  const ip =
    clientAddress || request.headers.get("x-forwarded-for") || "127.0.0.1";

  // Select limiter based on path
  let limitResult = {
    success: true,
    pending: Promise.resolve(),
    limit: 0,
    remaining: 0,
    reset: 0,
  };

  try {
    if (url.pathname === "/api/chat") {
      // Chat limit
      if (!import.meta.env.UPSTASH_REDIS_REST_URL) return next(); // Skip if not configured
      limitResult = await chatLimiter.limit(ip);
    } else if (url.pathname === "/api/newsletter") {
      // Newsletter limit
      if (!import.meta.env.UPSTASH_REDIS_REST_URL) return next();
      limitResult = await newsletterLimiter.limit(ip);
    } else {
      // Default API limit (optional)
      return next();
    }

    if (!limitResult.success) {
      return new Response(
        JSON.stringify({
          error: "Too Many Requests",
          message: "You have exceeded the rate limit for this action.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": limitResult.limit.toString(),
            "X-RateLimit-Remaining": limitResult.remaining.toString(),
            "X-RateLimit-Reset": limitResult.reset.toString(),
          },
        },
      );
    }
  } catch (error) {
    console.error("Rate limit error:", error);
    // Fail open (allow request) if Redis fails
    return next();
  }

  return next();
});
```

## Next Steps

1.  Obtain Upstash credentials.
2.  Implement the files as described above.
3.  Deploy and verify.

---

_Signed,_
**Ahmed Adel Bakr Alderai**
