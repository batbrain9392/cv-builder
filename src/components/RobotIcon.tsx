import type { SVGProps } from 'react';

/**
 * Document-robot icon matching the app branding (filled style with knockout details).
 * ViewBox frames the page rectangle; antenna overflows above via overflow: visible.
 */
export function RobotIcon(props: SVGProps<SVGSVGElement>) {
  // Page body: x=146 y=141 w=220 h=270 (r=24, fold=36)
  // Antenna extends above y=141 and is visible via overflow:visible
  return (
    <svg
      viewBox="136 141 240 270"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
      {...props}
    >
      {/* Antenna stem */}
      <line
        x1="256"
        y1="141"
        x2="256"
        y2="96"
        stroke="currentColor"
        strokeWidth="14"
        strokeLinecap="round"
      />
      {/* Antenna tip */}
      <circle cx="256" cy="89" r="16" fill="currentColor" />
      {/* Filled page body */}
      <path
        d="M330 141 L170 141 A24 24 0 0 0 146 165 L146 387 A24 24 0 0 0 170 411 L342 411 A24 24 0 0 0 366 387 L366 177 Z"
        fill="currentColor"
      />
      {/* Fold triangle (knockout) — uses a class or hardcoded bg if needed */}
      <path d="M330 141 L330 177 L366 177 Z" className="fill-background" />
      {/* Eyes (knockout) */}
      <circle cx="223" cy="228" r="19" className="fill-background" />
      <circle cx="289" cy="228" r="19" className="fill-background" />
      {/* Mouth (knockout) */}
      <line
        x1="231"
        y1="271"
        x2="281"
        y2="271"
        className="stroke-background"
        strokeWidth="14"
        strokeLinecap="round"
      />
      {/* Text lines (knockout) */}
      <line
        x1="176"
        y1="319"
        x2="336"
        y2="319"
        className="stroke-background"
        strokeWidth="13"
        strokeLinecap="round"
      />
      <line
        x1="176"
        y1="345"
        x2="336"
        y2="345"
        className="stroke-background"
        strokeWidth="13"
        strokeLinecap="round"
      />
      <line
        x1="176"
        y1="371"
        x2="296"
        y2="371"
        className="stroke-background"
        strokeWidth="13"
        strokeLinecap="round"
      />
    </svg>
  );
}
