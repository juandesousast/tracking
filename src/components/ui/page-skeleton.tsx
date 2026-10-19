import { Loader2, TrendingUp } from "lucide-react";

export function PageSkeleton({
  title = "Cargando información...",
  subtitle = "Sincronizando métricas institucionales en tiempo real",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="min-h-[55vh] w-full flex flex-col items-center justify-center p-6">
      <div className="relative flex flex-col items-center max-w-sm w-full text-center p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none transition-all">
        {/* Glow & Fintech Icon */}
        <div className="relative mb-5 flex items-center justify-center">
          <div className="absolute h-16 w-16 rounded-2xl bg-blue-500/20 dark:bg-blue-500/10 blur-xl animate-pulse" />
          <div className="relative h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-xs">
            <Loader2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 animate-spin" />
          </div>
        </div>

        {/* Text */}
        <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {subtitle}
        </p>

        {/* Smooth modern pulsing line */}
        <div className="w-36 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-6 relative">
          <div className="h-full bg-blue-600 dark:bg-blue-500 rounded-full w-2/3 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export const PageLoader = PageSkeleton;
export default PageSkeleton;

