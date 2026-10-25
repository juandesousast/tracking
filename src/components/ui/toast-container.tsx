"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { subscribeToasts, toast, ToastItem, ToastType } from "@/lib/services/toast";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

const toastIcons: Record<ToastType, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const iconColors: Record<ToastType, string> = {
  success: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50",
  error: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50",
  info: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50",
  warning: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50",
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return subscribeToasts((updated) => setToasts(updated));
  }, []);

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => {
          const Icon = toastIcons[t.type];
          const iconColor = iconColors[t.type];

          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 450, damping: 32 }}
              className="pointer-events-auto p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-[#0f1015]/95 backdrop-blur-md shadow-lg dark:shadow-[0_4px_20px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.08)] flex items-start gap-3 select-none"
            >
              <div className={`p-1.5 rounded-xl shrink-0 ${iconColor}`}>
                <Icon className="h-4 w-4" />
              </div>

              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {t.title}
                </p>
                {t.description && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {t.description}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => toast.dismiss(t.id)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer shrink-0"
                aria-label="Cerrar notificación"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
