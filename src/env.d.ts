/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly UPSTASH_REDIS_REST_URL: string;
  readonly UPSTASH_REDIS_REST_TOKEN: string;
  readonly ANTHROPIC_API_KEY?: string;
  readonly UMAMI_WEBSITE_ID?: string;
  readonly PUBLIC_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.astro" {
  const Component: any;
  export default Component;
}

declare namespace App {
  interface Locals {
    clientIp?: string;
  }
}
