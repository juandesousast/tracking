"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface TabOption<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

interface AnimatedTabsProps<T extends string = string> {
  tabs: TabOption<T>[];
  activeTab: T;
  onChange: (id: T) => void;
  className?: string;
  tabClassName?: string;
  layoutId?: string;
  size?: "sm" | "md";
}

export function AnimatedTabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className,
  tabClassName,
  layoutId = "animated-tab-pill",
  size = "md",
}: AnimatedTabsProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100/80 dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-md",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative z-10 flex items-center gap-2 rounded-lg font-semibold transition-colors duration-150 select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-xs",
              isActive
                ? "text-slate-950 dark:text-white"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200",
              tabClassName
            )}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 32,
                }}
                className="absolute inset-0 rounded-lg bg-white dark:bg-white/[0.12] shadow-xs dark:shadow-[0_1px_3px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.12)] -z-10"
              />
            )}
            {Icon && <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold tracking-tight",
                  isActive
                    ? "bg-slate-900/10 text-slate-900 dark:bg-white/20 dark:text-white"
                    : "bg-slate-200/70 text-slate-600 dark:bg-white/10 dark:text-zinc-400"
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default AnimatedTabs;
