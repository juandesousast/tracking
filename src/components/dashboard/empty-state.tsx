import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FolderPlus, PlusCircle } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = "No hay datos registrados",
  description = "Comienza agregando tu primera empresa de fondeo o registrando una cuenta de evaluación.",
  actionLabel = "Registrar Cuenta",
  onAction,
}: EmptyStateProps) {
  return (
    <Card className="border border-dashed border-border/80 bg-card/40 my-6">
      <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-4 border border-border/40 shadow-xs">
          <FolderPlus className="h-7 w-7" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
        {onAction && (
          <Button onClick={onAction} size="sm" className="gap-2 font-medium shadow-xs">
            <PlusCircle className="h-4 w-4" />
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
