"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function TopNavLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [animating, setAnimating] = React.useState(false);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    // Whenever pathname or searchParams change, flash the top loader smoothly
    setVisible(true);
    setAnimating(true);

    const timer = setTimeout(() => {
      setAnimating(false);
      const hideTimer = setTimeout(() => {
        setVisible(false);
      }, 300);
      return () => clearTimeout(hideTimer);
    }, 450);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-50 h-[2px] pointer-events-none overflow-hidden bg-transparent"
    >
      <div
        className={`h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-white dark:from-white dark:via-blue-300 dark:to-white shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-300 ${
          animating ? "w-full opacity-100 animate-linear-progress" : "w-full opacity-0"
        }`}
      />
    </div>
  );
}

export default TopNavLoader;
