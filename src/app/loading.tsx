import DashboardLayout from "@/app/dashboard-layout";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

export default function Loading() {
  return (
    <DashboardLayout>
      <DashboardSkeleton />
    </DashboardLayout>
  );
}
