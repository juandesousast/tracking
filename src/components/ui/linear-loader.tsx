"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface LinearLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional determinate percentage (0-100). If omitted, runs smooth indeterminate animation */
  progress?: number;
  /** Optional status text shown beneath the loader */
  label?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Optional custom bar classes */
  barClassName?: string;
}

export function LinearLoader({
  progress,
  label,
  size = "md",
  className,
  barClassName,
  ...props
}: LinearLoaderProps) {
  const isDeterminate = typeof progress === "number";

  const heightClass = {
    sm: "h-[1.5px]",
    md: "h-[2px]",
    lg: "h-[3px]",
  }[size];

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={isDeterminate ? Math.round(progress) : undefined}
      className={cn("flex flex-col items-center justify-center gap-3", className)}
      {...props}
    >
      {/* Track */}
      <div
        className={cn(
          "relative w-36 sm:w-48 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10",
          heightClass
        )}
      >
        {isDeterminate ? (
          <div
            className={cn(
              "h-full rounded-full bg-slate-900 dark:bg-white transition-all duration-300 ease-out shadow-[0_0_6px_rgba(255,255,255,0.6)]",
              barClassName
            )}
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        ) : (
          <div
            className={cn(
              "h-full w-2/5 rounded-full bg-slate-900 dark:bg-white animate-linear-progress shadow-[0_0_8px_rgba(255,255,255,0.8)]",
              barClassName
            )}
          />
        )}
      </div>

      {label && (
        <span className="text-[11px] font-mono tracking-wider uppercase text-slate-400 dark:text-zinc-500 select-none animate-pulse">
          {label}
        </span>
      )}
    </div>
  );
}

export default LinearLoader;
