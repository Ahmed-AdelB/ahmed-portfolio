import { defineMiddleware } from "astro/middleware";
import { getClientIp } from "./lib/ratelimit";

export const onRequest = defineMiddleware(async (context, next) => {
  // Skip client IP extraction for prerendered routes (404, etc.)
  // clientAddress is only available for server-rendered routes
  try {
    context.locals.clientIp = getClientIp(
      context.request,
      context.clientAddress,
    );
  } catch {
    // Fallback for prerendered routes where clientAddress is unavailable
    context.locals.clientIp = "unknown";
  }

  return next();
});
