"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface BrandLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Size variant for the symbol */
  size?: "sm" | "md" | "lg" | "xl";
  /** Whether to show the accompanying text wordmark */
  showWordmark?: boolean;
  /** Whether to show the institutional subtitle */
  showSubtitle?: boolean;
}

/**
 * Modern SVG brand symbol for PropFirm Tracker.
 * Represents capital expansion, consistency, and institutional precision
 * through an asymmetric geometric apex delta.
 */
export function BrandSymbol({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 select-none", className)}
      aria-label="Brand Logo"
    >
      <defs>
        {/* Core Blue Gradient */}
        <linearGradient id="pft-grad-primary" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>

        {/* Luminous Cyan Accent */}
        <linearGradient id="pft-grad-accent" x1="16" y1="2" x2="28" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>

        {/* Ascending Vector Highlight */}
        <linearGradient id="pft-grad-highlight" x1="16" y1="6" x2="16" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#93c5fd" />
        </linearGradient>

        {/* Subtle Ambient Drop Glow */}
        <filter id="pft-glow" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer Squircle Container / Emblem Base */}
      <rect
        x="1.5"
        y="1.5"
        width="29"
        height="29"
        rx="8"
        className="fill-[#0c1222] dark:fill-[#0c0e14] stroke-blue-500/30 dark:stroke-white/10"
        strokeWidth="1"
      />

      {/* Left Structural Facet (Capital Foundation) */}
      <path
        d="M8 22.5L14.5 9.5L18 16L12 22.5H8Z"
        fill="url(#pft-grad-primary)"
      />

      {/* Right Ascending Facet (Alpha / Yield Peak) */}
      <path
        d="M24 22.5L16 6.5L19.5 6.5L25.5 18.5L24 22.5Z"
        fill="url(#pft-grad-accent)"
        opacity="0.9"
      />

      {/* Central Precision Vector (Upward Institutional Trajectory) */}
      <path
        d="M13.5 22.5L18.5 12.5L22 19.5H16.5L15 22.5H13.5Z"
        fill="url(#pft-grad-highlight)"
        filter="url(#pft-glow)"
      />

      {/* Micro Quantum Focus Dot */}
      <circle cx="16" cy="6.5" r="1.25" fill="#ffffff" />
    </svg>
  );
}

export function BrandLogo({
  size = "md",
  showWordmark = true,
  showSubtitle = true,
  className,
  ...props
}: BrandLogoProps) {
  const pixelSize = {
    sm: 24,
    md: 32,
    lg: 40,
    xl: 48,
  }[size];

  return (
    <div className={cn("flex items-center gap-3 select-none", className)} {...props}>
      <BrandSymbol size={pixelSize} />

      {showWordmark && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-extrabold tracking-tight text-sm sm:text-base text-slate-900 dark:text-white">
              PropFirm
            </span>
            <span className="font-extrabold tracking-tight text-sm sm:text-base bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Tracker
            </span>
          </div>

          {showSubtitle && (
            <span className="text-[9px] font-mono tracking-widest text-slate-400 dark:text-zinc-500 uppercase mt-0.5 font-semibold">
              Suite Institucional Pro
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default BrandLogo;
