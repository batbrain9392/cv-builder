import type { SVGProps } from 'react';

/**
 * Custom robot icon matching the app branding.
 * The viewBox frames the head so it center-aligns with adjacent text;
 * the antenna extends above via overflow: visible.
 */
export function RobotIcon(props: SVGProps<SVGSVGElement>) {
  // Head rect: x=136 y=186 w=240 h=180, stroke=10 → visual bounds 131..381 x 181..371
  // ViewBox is set to the head bounds so the head aligns with text baseline.
  return (
    <svg
      viewBox="131 181 250 190"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
      {...props}
    >
      <rect
        x="136"
        y="186"
        width="240"
        height="180"
        rx="32"
        stroke="currentColor"
        strokeWidth="10"
      />
      <circle cx="220" cy="262" r="24" fill="currentColor" />
      <circle cx="292" cy="262" r="24" fill="currentColor" />
      <line x1="208" y1="316" x2="304" y2="316" stroke="currentColor" strokeWidth="10" />
      <line x1="256" y1="186" x2="256" y2="131" stroke="currentColor" strokeWidth="10" />
      <circle cx="256" cy="124" r="14" fill="currentColor" />
    </svg>
  );
}
