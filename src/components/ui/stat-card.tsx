"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  subtitle?: string;
  badge?: {
    text: string;
    variant?: "positive" | "negative" | "neutral" | "info";
  };
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  badge,
  icon: Icon,
  iconColor = "text-blue-500 bg-blue-500/10",
  className,
  ...props
}: StatCardProps) {
  const badgeColors = {
    positive: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    negative: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    neutral: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
    info: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  }[badge?.variant || "neutral"];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "group relative flex flex-col justify-between p-5 rounded-2xl bg-white/80 dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-md shadow-xs transition-all duration-200 hover:border-slate-300 dark:hover:border-white/[0.16] overflow-hidden",
        className
      )}
      {...(props as any)}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-[11px] font-semibold tracking-wider text-slate-500 dark:text-zinc-400 uppercase">
          {title}
        </span>
        {Icon && (
          <div
            className={cn(
              "h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border border-transparent dark:border-white/[0.04]",
              iconColor
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Main KPI Value */}
      <div className="flex items-baseline gap-2.5 my-1">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono text-slate-900 dark:text-white tabular-nums">
          {value}
        </span>
      </div>

      {/* Bottom Subtitle / Badge */}
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        {badge && (
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border tracking-tight",
              badgeColors
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
            {badge.text}
          </span>
        )}
        {subtitle && (
          <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">
            {subtitle}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default StatCard;
