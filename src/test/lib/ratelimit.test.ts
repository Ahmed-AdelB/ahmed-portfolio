import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock @upstash/redis
const mockLimit = vi.fn();

vi.mock("@upstash/ratelimit", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    Ratelimit: class {
      limit = mockLimit;
      static slidingWindow = vi.fn();
      constructor() {
        return { limit: mockLimit };
      }
    },
  };
});

vi.mock("@upstash/redis", () => ({
  Redis: class {
    constructor() {}
  },
}));

// Mock config
vi.mock("../../lib/config", () => ({
  config: {
    UPSTASH_REDIS_REST_URL: "https://mock-url.upstash.io",
    UPSTASH_REDIS_REST_TOKEN: "mock-token",
  },
  isUpstashConfigured: vi.fn(() => true),
}));

import { isUpstashConfigured } from "../../lib/config";

describe("Rate Limiting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    vi.mocked(isUpstashConfigured).mockReturnValue(true);
  });

  describe("getClientIp", () => {
    it("returns x-forwarded-for if present", async () => {
      const { getClientIp } = await import("../../lib/ratelimit");
      const req = new Request("http://localhost", {
        headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
      });
      expect(getClientIp(req)).toBe("1.2.3.4");
    });

    it("returns x-real-ip if present", async () => {
      const { getClientIp } = await import("../../lib/ratelimit");
      const req = new Request("http://localhost", {
        headers: { "x-real-ip": "10.0.0.1" },
      });
      expect(getClientIp(req)).toBe("10.0.0.1");
    });

    it("returns cf-connecting-ip if present", async () => {
      const { getClientIp } = await import("../../lib/ratelimit");
      const req = new Request("http://localhost", {
        headers: { "cf-connecting-ip": "192.168.1.1" },
      });
      expect(getClientIp(req)).toBe("192.168.1.1");
    });

    it("returns clientAddress if provided", async () => {
      const { getClientIp } = await import("../../lib/ratelimit");
      const req = new Request("http://localhost");
      expect(getClientIp(req, "127.0.0.1")).toBe("127.0.0.1");
    });

    it("returns 'unknown' as fallback", async () => {
      const { getClientIp } = await import("../../lib/ratelimit");
      const req = new Request("http://localhost");
      expect(getClientIp(req)).toBe("unknown");
    });
  });

  describe("checkRateLimit", () => {
    it("allows request when limit is not exceeded", async () => {
      const { checkRateLimit } = await import("../../lib/ratelimit");
      mockLimit.mockResolvedValueOnce({
        success: true,
        limit: 10,
        remaining: 9,
        reset: Date.now() + 60000,
      });

      const req = new Request("http://localhost");
      const result = await checkRateLimit({
        request: req,
        type: "chat",
        ip: "1.2.3.4",
      });

      expect(result.allowed).toBe(true);
    });

    it("blocks request when limit is exceeded", async () => {
      const { checkRateLimit } = await import("../../lib/ratelimit");
      mockLimit.mockResolvedValueOnce({
        success: false,
        limit: 10,
        remaining: 0,
        reset: Date.now() + 5000,
      });

      const req = new Request("http://localhost");
      const result = await checkRateLimit({
        request: req,
        type: "chat",
        ip: "1.2.3.4",
      });

      expect(result.allowed).toBe(false);
      if (!result.allowed) {
        expect(result.retryAfterSeconds).toBeGreaterThan(0);
        expect(result.headers.get("Retry-After")).toBeDefined();
      }
    });

    it("handles missing environment variables gracefully (fail open)", async () => {
      vi.mocked(isUpstashConfigured).mockReturnValue(false);

      // We need to re-import ratelimit to ensure it picks up the mocked config value change if it logic depended on it at module level.
      // BUT ratelimit.ts creates 'redis' and 'rateLimiters' at top level based on 'upstashEnabled'.
      // Since we are mocking the module "../../lib/config", the import inside ratelimit.ts will get the mocked functions.
      // However, 'upstashEnabled' is a const calculated at module load time in 'ratelimit.ts'.
      // "const upstashEnabled = isUpstashConfigured();"
      // So we MUST use vi.resetModules() and re-import to re-evaluate top-level consts.

      vi.resetModules();
      const { checkRateLimit } = await import("../../lib/ratelimit");

      const req = new Request("http://localhost");
      const result = await checkRateLimit({
        request: req,
        type: "chat",
        ip: "1.2.3.4",
      });

      // Should be allowed (fail open)
      expect(result.allowed).toBe(true);
    });
  });
});
