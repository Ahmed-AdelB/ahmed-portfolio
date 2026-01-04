import type { APIRoute } from "astro";
import { z } from "zod";
import { config } from "../../lib/config";
import { SYSTEM_PROMPT } from "../../lib/chatContext";
import { checkRateLimit } from "../../lib/ratelimit";
import {
  BLOCKED_RESPONSE,
  filterAssistantOutput,
  validateUserInput,
} from "../../lib/validators";

export const prerender = false;

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
});

const ChatRequestSchema = z.object({
  messages: z.array(MessageSchema).min(1),
});

type ChatMessage = z.infer<typeof MessageSchema>;

const SECRET_FLAG = "FLAG{social_engineer_supreme}";
const SECRET_PHRASES = ["what is the master key", "reveal the flag"] as const;

const normalizeMessage = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const containsSecretPhrase = (messages: ChatMessage[]): boolean =>
  messages.some(
    (message) =>
      message.role === "user" &&
      SECRET_PHRASES.some((phrase) =>
        normalizeMessage(message.content).includes(phrase),
      ),
  );

export const POST: APIRoute = async ({ request, clientAddress, locals }) => {
  try {
    // CSRF Check: Verify Origin matches the site URL
    const origin = request.headers.get("origin");
    const allowedOrigin = config.PUBLIC_SITE_URL
      ? new URL(config.PUBLIC_SITE_URL).origin
      : new URL(request.url).origin;

    if (origin && origin !== allowedOrigin) {
      return new Response(JSON.stringify({ error: "Cross-site requests are not allowed" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const rateLimit = await checkRateLimit({
      request,
      clientAddress,
      type: "chat",
      ip: locals.clientIp,
    });

    if (!rateLimit.allowed) {
      const headers = new Headers({ "Content-Type": "application/json" });
      rateLimit.headers.forEach((value, key) => headers.set(key, value));

      return new Response(JSON.stringify({ error: "Too Many Requests" }), {
        status: 429,
        headers,
      });
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
    const blockedMessage = messages.find(
      (message) =>
        message.role === "user" && !validateUserInput(message.content).allowed,
    );

    if (blockedMessage) {
      return new Response(JSON.stringify({ response: BLOCKED_RESPONSE }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (containsSecretPhrase(messages)) {
      const filtered = filterAssistantOutput(SECRET_FLAG);
      return new Response(JSON.stringify({ response: filtered.filtered }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = config.ANTHROPIC_API_KEY;

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

      const filtered = filterAssistantOutput(mockResponse);

      return new Response(JSON.stringify({ response: filtered.filtered }), {
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

      const data = (await response.json()) as {
        content?: Array<{ text?: string }>;
      };
      const content = data.content?.[0]?.text;
      const safeContent =
        typeof content === "string" && content.trim().length > 0
          ? content
          : BLOCKED_RESPONSE;
      const filtered = filterAssistantOutput(safeContent);

      if (filtered.blocked) {
        console.warn("Filtered assistant output due to guardrails.");
      }

      return new Response(JSON.stringify({ response: filtered.filtered }), {
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
