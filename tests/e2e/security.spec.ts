import { test, expect } from "@playwright/test";

test.describe("Security & Rate Limiting", () => {
  test("should return 429 after exceeding rate limit on chat endpoint", async ({
    request,
  }) => {
    // Chat limit is 10 per minute
    const limit = 10;

    // Make requests up to the limit
    for (let i = 0; i < limit; i++) {
      const response = await request.post("/api/chat", {
        data: { messages: [{ role: "user", content: "Hello" }] },
      });
      // The first few might be 200, or 401 if no API key (which mock handles)
      expect(response.status()).not.toBe(429);
    }

    // The next request should be rate limited
    const response = await request.post("/api/chat", {
      data: { messages: [{ role: "user", content: "Hello" }] },
    });

    expect(response.status()).toBe(429);
    expect(await response.json()).toEqual({ error: "Too Many Requests" });
  });

  test("should return 429 after exceeding rate limit on newsletter endpoint", async ({
    request,
  }) => {
    // Newsletter limit is 5 per minute
    const limit = 5;

    for (let i = 0; i < limit; i++) {
      const response = await request.post("/api/newsletter", {
        data: { email: `test${i}@example.com` },
      });
      expect(response.status()).not.toBe(429);
    }

    const response = await request.post("/api/newsletter", {
      data: { email: "overlimit@example.com" },
    });

    expect(response.status()).toBe(429);
  });
});
