import DashboardLayout from "@/app/dashboard-layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-60" />
            <Skeleton className="h-3 w-80" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-32 rounded-lg" />
          </div>
        </div>

        {/* Search Bar Skeleton */}
        <div className="h-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800" />

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-xl" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-6 w-6 rounded-md" />
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <Skeleton className="h-3 w-44" />
                <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-6 w-20 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
