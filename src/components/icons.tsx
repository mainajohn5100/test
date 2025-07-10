import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="3" fill="#4F4F4F" stroke="none" />
      
      {/* Connecting Lines */}
      <path d="M10 8.5H14" stroke="#888888" strokeWidth="1.5" />
      <path d="M7.5 11V14" stroke="#888888" strokeWidth="1.5" />
      <path d="M11 17.5H14" stroke="#888888" strokeWidth="1.5" />
      <path d="M17 11.5V14" stroke="#888888" strokeWidth="1.5" />

      {/* Shapes */}
      <rect x="4" y="6" width="6" height="5" fill="#C895E8" stroke="none" />
      <circle cx="17" cy="8.5" r="3" fill="#F7625B" stroke="none" />
      <rect x="4" y="14" width="7" height="7" fill="#7FB5F8" stroke="none" />
      <rect x="14" y="14" width="6" height="6" fill="#72D572" stroke="none" />
    </svg>
  );
}
