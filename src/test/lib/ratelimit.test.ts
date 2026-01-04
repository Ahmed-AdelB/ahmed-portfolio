import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock environment variables
vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://mock-url.upstash.io");
vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "mock-token");

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

describe("Rate Limiting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://mock-url.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "mock-token");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
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
        vi.resetModules();
        vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
        vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
        
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