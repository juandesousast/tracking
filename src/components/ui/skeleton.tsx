import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-xl bg-slate-200/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-800", className)}
      {...props}
    />
  )
}

export { Skeleton }
