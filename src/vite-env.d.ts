/// <reference types="vite/client" />

export {};

declare global {
  interface ImportMetaEnv {
    readonly VITE_SENTRY_DSN: string;
    /** Cloudflare Web Analytics token (dashboard → Web Analytics → Manage site). */
    readonly VITE_CLOUDFLARE_WEB_ANALYTICS_TOKEN?: string;
    readonly VITE_ANALYTICS_SCRIPT_URL?: string;
    readonly VITE_ANALYTICS_DATA_DOMAIN?: string;
  }
}

declare module 'react' {
  interface CSSProperties {
    [key: `--cv-${string}`]: string | number;
  }
}
