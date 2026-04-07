/**
 * Pixel width for Tailwind’s default `lg` breakpoint (Tailwind v4 default theme).
 * If you customize `screens.lg` in CSS/`@theme`, change this value to match.
 */
export const LG_MIN_WIDTH_PX = 1024 as const;

/** `matchMedia` query aligned with Tailwind `lg`. */
export const LG_MEDIA_QUERY = `(min-width: ${LG_MIN_WIDTH_PX}px)` as const;
