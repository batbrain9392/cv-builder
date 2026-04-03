/// <reference types="vite/client" />

export {};

declare module 'react' {
  interface CSSProperties {
    [key: `--cv-${string}`]: string | number;
  }
}
