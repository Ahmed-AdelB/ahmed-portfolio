import type { APIRoute } from "astro";
import { z } from "zod";
import { checkRateLimit } from "../../lib/ratelimit";
import { SITE_CONFIG } from "../../site.config";

export const prerender = false;

interface NewsletterResponse {
  success: boolean;
  message: string;
}

const BUTTONDOWN_API_URL = SITE_CONFIG.api.buttondown;

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
    // CSRF Check: Verify Origin matches the site URL
    const origin = request.headers.get("origin");
    const allowedOrigin = import.meta.env.PUBLIC_SITE_URL
      ? new URL(import.meta.env.PUBLIC_SITE_URL).origin
      : new URL(request.url).origin;

    if (origin && origin !== allowedOrigin) {
      return jsonResponse(403, {
        success: false,
        message: "Cross-site requests are not allowed.",
      });
    }

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
    
    // Mock backend if API key is missing
    if (!apiKey) {
      const body = await request.json().catch(() => null);
      const result = SubscribeSchema.safeParse(body);
      
      if (!result.success) {
        return jsonResponse(400, {
          success: false,
          message: result.error.errors[0]?.message || MESSAGES.invalidEmail,
        });
      }
      
      console.log("[MOCK EMAIL STORAGE]", result.data.email);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return jsonResponse(200, {
        success: true,
        message: MESSAGES.subscribeSuccess,
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
