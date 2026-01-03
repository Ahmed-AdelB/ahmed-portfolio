import type { APIRoute } from "astro";
import { z } from "zod";
import { SYSTEM_PROMPT } from "../../lib/chatContext";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
});

const ChatRequestSchema = z.object({
  messages: z.array(MessageSchema).min(1),
});

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

const getClientIp = (
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

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const ip = getClientIp(request, clientAddress);
    const now = Date.now();
    const entry = rateLimitStore.get(ip);

    if (!entry || now > entry.resetAt) {
      rateLimitStore.set(ip, {
        count: 1,
        resetAt: now + RATE_LIMIT_WINDOW_MS,
      });
    } else if (entry.count >= RATE_LIMIT_MAX) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((entry.resetAt - now) / 1000),
      );
      return new Response(JSON.stringify({ error: "Too Many Requests" }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": retryAfterSeconds.toString(),
        },
      });
    } else {
      entry.count += 1;
      rateLimitStore.set(ip, entry);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const result = ChatRequestSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid messages format",
          details: result.error.issues,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const { messages } = result.data;

    const apiKey = import.meta.env.ANTHROPIC_API_KEY;

    // Fallback/Mock if no API key is present (for development/demo)
    if (!apiKey) {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simple keyword matching for demo purposes when no API key
      const lastUserMessage =
        messages[messages.length - 1].content.toLowerCase();
      let mockResponse =
        "I am currently running in demo mode (no API key configured). I can tell you that Ahmed is an AI Security Researcher based in Ireland. Please add an ANTHROPIC_API_KEY to see my full capabilities!";

      if (lastUserMessage.includes("skill")) {
        mockResponse =
          "Ahmed's skills include Python, TypeScript, AI Security, and DevSecOps. He is also proficient with tools like Git, Docker, and Linux.";
      } else if (lastUserMessage.includes("contact")) {
        mockResponse =
          "You can contact Ahmed via email or LinkedIn. (Note: Real contact details would be provided here with the live API).";
      } else if (
        lastUserMessage.includes("oss") ||
        lastUserMessage.includes("open source")
      ) {
        mockResponse =
          "Ahmed has contributed to several Python projects and authored the 'github-reputation-toolkit'. He has over 7 PRs to major repositories.";
      }

      return new Response(JSON.stringify({ response: mockResponse }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Actual call to Anthropic API
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: messages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Anthropic API Error:", errorData);
        throw new Error("Anthropic API request failed");
      }

      const data = await response.json();
      const content = data.content[0].text;

      return new Response(JSON.stringify({ response: content }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("API Call failed:", error);
      return new Response(
        JSON.stringify({ error: "Failed to communicate with AI service" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  } catch (error) {
    console.error("Server error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
