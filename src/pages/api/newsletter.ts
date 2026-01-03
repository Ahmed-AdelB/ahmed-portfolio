import type { APIRoute } from 'astro';

interface NewsletterResponse {
  success: boolean;
  message: string;
}

const BUTTONDOWN_API_URL = 'https://api.buttondown.com/v1/subscribers';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MESSAGES = {
  invalidEmail: 'Please enter a valid email address.',
  missingConfig: 'Newsletter service is not configured.',
  subscribeFailed: 'Unable to subscribe right now. Please try again later.',
  subscribeSuccess: 'Thanks for subscribing! Please check your inbox to confirm.',
} as const;

const jsonResponse = (status: number, payload: NewsletterResponse): Response =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const extractEmail = (body: unknown): string | null => {
  if (!isRecord(body)) return null;
  if (typeof body.email !== 'string') return null;
  const trimmed = body.email.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const isValidEmail = (email: string): boolean => EMAIL_PATTERN.test(email);

const extractErrorMessage = (payload: unknown): string | null => {
  if (!isRecord(payload)) return null;
  if (typeof payload.detail === 'string') return payload.detail;
  if (typeof payload.message === 'string') return payload.message;
  if (typeof payload.error === 'string') return payload.error;
  return null;
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const apiKey = import.meta.env.BUTTONDOWN_API_KEY;
    if (!apiKey) {
      return jsonResponse(500, { success: false, message: MESSAGES.missingConfig });
    }

    const body = await request.json().catch(() => null);
    const email = extractEmail(body);
    if (!email || !isValidEmail(email)) {
      return jsonResponse(400, { success: false, message: MESSAGES.invalidEmail });
    }

    const response = await fetch(BUTTONDOWN_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
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
    console.error('Newsletter API error:', error);
    return jsonResponse(500, { success: false, message: MESSAGES.subscribeFailed });
  }
};
