/// <reference types="vite/client" />

export {};

declare global {
  interface ImportMetaEnv {
    readonly VITE_SENTRY_DSN: string;
  }
}

declare module 'react' {
  interface CSSProperties {
    [key: `--cv-${string}`]: string | number;
  }
}
