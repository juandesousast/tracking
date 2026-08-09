import DashboardLayout from "@/app/dashboard-layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-3 w-80" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-32 rounded-lg" />
          </div>
        </div>

        {/* Dashboard Filters Bar Skeleton */}
        <div className="h-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800" />

        {/* Resumen de Gastos Banner Skeleton */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-8 w-32" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>

        {/* Tabla de Gastos Skeleton */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-24 rounded-md" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
