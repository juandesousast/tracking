import { LinearLoader } from "@/components/ui/linear-loader";

export function PageSkeleton({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="min-h-[50vh] w-full flex flex-col items-center justify-center p-6 select-none animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Minimalist Linear Progress Bar */}
        <LinearLoader size="md" label={subtitle || title} />
      </div>
    </div>
  );
}

export const PageLoader = PageSkeleton;
export default PageSkeleton;
