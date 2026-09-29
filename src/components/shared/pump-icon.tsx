import type { SVGProps } from "react";

export function PumpIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <rect x="4" y="3" width="10" height="18" rx="2" />
      <rect x="6.5" y="6" width="5" height="4" rx="0.8" />
      <path d="M2.5 21h13" />
      <path d="M14 9h1.5a2 2 0 0 1 2 2v5.5a1.75 1.75 0 0 0 3.5 0V8.5L18.5 6" />
    </svg>
  );
}
