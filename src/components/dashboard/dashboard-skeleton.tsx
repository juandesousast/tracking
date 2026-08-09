import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Filters Bar Skeleton */}
      <Skeleton className="h-14 w-full rounded-2xl" />

      {/* KPI Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-8 w-32" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart & Detail Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border border-border/60">
          <CardHeader className="space-y-2">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3 w-64" />
          </CardHeader>
          <CardContent className="h-72 flex items-end gap-3 pt-4">
            {[45, 65, 80, 50, 70, 40, 85, 60].map((height, i) => (
              <Skeleton
                key={i}
                className="flex-1 rounded-t-md"
                style={{ height: `${height}%` }}
              />
            ))}
          </CardContent>
        </Card>

        <Card className="border border-border/60">
          <CardHeader className="space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-6 w-16 rounded-md" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
