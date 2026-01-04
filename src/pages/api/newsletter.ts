import type { APIRoute } from "astro";
import { z } from "zod";
import { checkRateLimit } from "../../lib/ratelimit";

export const prerender = false;

interface NewsletterResponse {
  success: boolean;
  message: string;
}

const BUTTONDOWN_API_URL = "https://api.buttondown.com/v1/subscribers";

const MESSAGES = {
  invalidEmail: "Please enter a valid email address.",
  missingConfig: "Newsletter service is not configured.",
  subscribeFailed: "Unable to subscribe right now. Please try again later.",
  subscribeSuccess:
    "Thanks for subscribing! Please check your inbox to confirm.",
} as const;

const SubscribeSchema = z.object({
  email: z.string().email(MESSAGES.invalidEmail),
});

const jsonResponse = (
  status: number,
  payload: NewsletterResponse,
  headers?: HeadersInit,
): Response => {
  const responseHeaders = new Headers({ "Content-Type": "application/json" });

  if (headers) {
    const merged = new Headers(headers);
    merged.forEach((value, key) => responseHeaders.set(key, value));
  }

  return new Response(JSON.stringify(payload), {
    status,
    headers: responseHeaders,
  });
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const extractErrorMessage = (payload: unknown): string | null => {
  if (!isRecord(payload)) return null;
  if (typeof payload.detail === "string") return payload.detail;
  if (typeof payload.message === "string") return payload.message;
  if (typeof payload.error === "string") return payload.error;
  return null;
};

export const POST: APIRoute = async ({ request, clientAddress, locals }) => {
  try {
    const rateLimit = await checkRateLimit({
      request,
      clientAddress,
      type: "newsletter",
      ip: locals.clientIp,
    });

    if (!rateLimit.allowed) {
      return jsonResponse(
        429,
        {
          success: false,
          message: "Too many requests. Please try again shortly.",
        },
        rateLimit.headers,
      );
    }

    const apiKey = import.meta.env.BUTTONDOWN_API_KEY;
    if (!apiKey) {
      return jsonResponse(500, {
        success: false,
        message: MESSAGES.missingConfig,
      });
    }

    const body = await request.json().catch(() => null);
    const result = SubscribeSchema.safeParse(body);

    if (!result.success) {
      return jsonResponse(400, {
        success: false,
        message: result.error.errors[0]?.message || MESSAGES.invalidEmail,
      });
    }

    const { email } = result.data;

    const response = await fetch(BUTTONDOWN_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email_address: email }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const apiMessage = extractErrorMessage(payload);
      return jsonResponse(response.status, {
        success: false,
        message: apiMessage ?? MESSAGES.subscribeFailed,
      });
    }

    return jsonResponse(200, {
      success: true,
      message: MESSAGES.subscribeSuccess,
    });
  } catch (error) {
    console.error("Newsletter API error:", error);
    return jsonResponse(500, {
      success: false,
      message: MESSAGES.subscribeFailed,
    });
  }
};
