"use client";

import { useState } from "react";
import { ResponsiveModal } from "./responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Loader2 } from "lucide-react";

interface AddFirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (firm: { name: string; website: string | null }) => Promise<void> | void;
}

export function AddFirmModal({ open, onOpenChange, onSubmit }: AddFirmModalProps) {
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("El nombre de la empresa es requerido");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        website: website.trim() ? website.trim() : null,
      });
      setName("");
      setWebsite("");
      onOpenChange(false);
    } catch (err) {
      console.error("Error submit firm:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Registrar Empresa de Fondeo"
      description="Añade una nueva firma de fondeo a tu lista de seguimiento."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="firm-name" className="text-xs font-medium">
            Nombre de la Empresa *
          </Label>
          <Input
            id="firm-name"
            placeholder="ej. FTMO, FundedNext, 5%ers"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="firm-website" className="text-xs font-medium">
            Sitio Web (Opcional)
          </Label>
          <Input
            id="firm-website"
            type="url"
            placeholder="https://ftmo.com"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="h-9 text-xs"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            size="sm"
            className="text-xs gap-1.5"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Building2 className="h-3.5 w-3.5" />
            )}
            Guardar Empresa
          </Button>
        </div>
      </form>
    </ResponsiveModal>
  );
}
