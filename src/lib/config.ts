import { z } from "zod";

const envSchema = z.object({
  // Optional for development/demo, required for production features
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  UMAMI_WEBSITE_ID: z.string().optional(),
  PUBLIC_SITE_URL: z.string().url().optional(),
});

const getEnv = () => {
  // In Astro, import.meta.env contains the env vars
  return import.meta.env;
};

// Validate at runtime
export const config = envSchema.parse(getEnv());

export const isUpstashConfigured = () => {
  return (
    typeof config.UPSTASH_REDIS_REST_URL === "string" &&
    config.UPSTASH_REDIS_REST_URL.length > 0 &&
    typeof config.UPSTASH_REDIS_REST_TOKEN === "string" &&
    config.UPSTASH_REDIS_REST_TOKEN.length > 0
  );
};
