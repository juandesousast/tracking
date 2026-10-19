"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";
import { getPropFirmLogo } from "@/lib/constants/prop-firms";
import { cn } from "@/lib/utils";

interface PropFirmLogoProps {
  name: string;
  logoUrl?: string | null;
  website?: string | null;
  className?: string;
  imgClassName?: string;
  size?: "xs" | "sm" | "md" | "lg";
}

export function PropFirmLogo({
  name,
  logoUrl,
  website,
  className,
  imgClassName,
  size = "md",
}: PropFirmLogoProps) {
  const [hasError, setHasError] = useState(false);
  const resolvedUrl = getPropFirmLogo(name, logoUrl, website);

  const sizeClasses = {
    xs: "h-5 w-5 text-[9px]",
    sm: "h-7 w-7 text-[11px]",
    md: "h-8 w-8 text-xs",
    lg: "h-11 w-11 text-sm",
  }[size];

  // If no logo or image failed to load, show a clean, high-contrast initials badge
  if (!resolvedUrl || hasError) {
    const initials = name
      .split(/[\s-_]+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();

    return (
      <div
        className={cn(
          "rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold flex items-center justify-center border border-slate-200/80 dark:border-slate-700/80 shrink-0 select-none shadow-2xs",
          sizeClasses,
          className
        )}
        title={name}
      >
        {initials || <Building2 className="h-3.5 w-3.5 text-slate-400" />}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl bg-white dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs",
        sizeClasses,
        className
      )}
    >
      <img
        src={resolvedUrl}
        alt={name}
        onError={() => setHasError(true)}
        className={cn("h-full w-full object-contain rounded-lg", imgClassName)}
        loading="lazy"
      />
    </div>
  );
}
