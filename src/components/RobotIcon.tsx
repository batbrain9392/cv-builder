import type { SVGProps } from 'react';

/**
 * Document-robot icon matching the app branding.
 * ViewBox frames the page body; antenna extends above via overflow: visible.
 */
export function RobotIcon(props: SVGProps<SVGSVGElement>) {
  // Page: x=146 y=141 w=220 h=270, stroke=10 → visual bounds ~141..371 x ~136..416
  // ViewBox covers the page body so it center-aligns with adjacent text.
  return (
    <svg
      viewBox="136 136 240 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
      {...props}
    >
      {/* Page outline with folded corner */}
      <path
        d="M334 141 L166 141 A20 20 0 0 0 146 161 L146 391 A20 20 0 0 0 166 411 L346 411 A20 20 0 0 0 366 391 L366 173 Z"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Fold */}
      <path
        d="M334 141 L334 173 L366 173"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Eyes */}
      <circle cx="223" cy="228" r="22" fill="currentColor" />
      <circle cx="289" cy="228" r="22" fill="currentColor" />
      {/* Mouth */}
      <line
        x1="216"
        y1="271"
        x2="296"
        y2="271"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* Text lines */}
      <line
        x1="176"
        y1="308"
        x2="336"
        y2="308"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <line
        x1="176"
        y1="338"
        x2="336"
        y2="338"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <line
        x1="176"
        y1="368"
        x2="296"
        y2="368"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
      {/* Antenna */}
      <line
        x1="256"
        y1="141"
        x2="256"
        y2="96"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <circle cx="256" cy="89" r="12" fill="currentColor" />
    </svg>
  );
}
