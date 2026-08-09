"use client";

import { useState, useEffect } from "react";
import { ResponsiveModal } from "./responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PropFirm } from "@/types/database";
import { Building2, Loader2 } from "lucide-react";

interface EditFirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  firm: PropFirm | null;
  onSubmit: (id: string, firm: { name: string; website: string | null }) => Promise<void> | void;
}

export function EditFirmModal({
  open,
  onOpenChange,
  firm,
  onSubmit,
}: EditFirmModalProps) {
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (firm) {
      setName(firm.name || "");
      setWebsite(firm.website || "");
    }
  }, [firm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firm) return;

    if (!name.trim()) {
      setError("El nombre de la empresa es requerido");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await onSubmit(firm.id, {
        name: name.trim(),
        website: website.trim() ? website.trim() : null,
      });
      onOpenChange(false);
    } catch (err) {
      console.error("Error updating firm:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Editar Empresa de Fondeo"
      description="Actualiza la información de la firma de fondeo."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="edit-firm-name" className="text-xs font-medium">
            Nombre de la Empresa *
          </Label>
          <Input
            id="edit-firm-name"
            placeholder="ej. FTMO, FundedNext, 5%ers"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-firm-website" className="text-xs font-medium">
            Sitio Web (Opcional)
          </Label>
          <Input
            id="edit-firm-website"
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
            Actualizar Empresa
          </Button>
        </div>
      </form>
    </ResponsiveModal>
  );
}
