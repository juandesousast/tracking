"use client";

import { useState, useMemo } from "react";
import { ResponsiveModal } from "./responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Building2, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { KNOWN_PROP_FIRMS, findKnownPropFirm } from "@/lib/constants/prop-firms";

interface AddFirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (firm: { name: string; website: string | null; logo_url?: string | null }) => Promise<void> | void;
}

export function AddFirmModal({ open, onOpenChange, onSubmit }: AddFirmModalProps) {
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time detection of known prop firm
  const matchedFirm = useMemo(() => findKnownPropFirm(name), [name]);

  // Suggestions for autocomplete when typing
  const suggestions = useMemo(() => {
    const q = name.trim().toLowerCase();
    if (q.length < 2) return [];
    return KNOWN_PROP_FIRMS.filter(
      (kf) =>
        kf.name.toLowerCase().includes(q) ||
        kf.aliases.some((a) => a.toLowerCase().includes(q))
    ).slice(0, 4);
  }, [name]);

  const handleSelectSuggestion = (suggested: (typeof KNOWN_PROP_FIRMS)[number]) => {
    setName(suggested.name);
    if (!website) {
      setWebsite(suggested.website);
    }
  };

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
        website: website.trim() ? website.trim() : (matchedFirm ? matchedFirm.website : null),
        logo_url: matchedFirm ? matchedFirm.logoUrl : null,
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
            placeholder="ej. Apex Trader Funding, Topstep, FTMO..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9 text-xs"
            autoComplete="off"
          />

          {/* Known Firm Autocomplete Suggestions */}
          {suggestions.length > 0 && (!matchedFirm || matchedFirm.name.toLowerCase() !== name.trim().toLowerCase()) && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mr-1">
                Sugerencias:
              </span>
              {suggestions.map((kf) => (
                <button
                  type="button"
                  key={kf.id}
                  onClick={() => handleSelectSuggestion(kf)}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/40 text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  <img
                    src={kf.logoUrl}
                    alt=""
                    className="h-3.5 w-3.5 rounded object-contain shrink-0 bg-white"
                  />
                  <span>{kf.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Real-Time Detected Firm Preview */}
          {matchedFirm && (
            <div className="mt-2 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 flex items-center justify-between gap-3 animate-in fade-in-50 duration-200">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={matchedFirm.logoUrl}
                  alt={matchedFirm.name}
                  className="h-7 w-7 rounded-lg object-contain bg-white border border-blue-200 dark:border-blue-800 p-0.5 shrink-0 shadow-2xs"
                />
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {matchedFirm.name}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-[10px] h-4 px-1.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-none font-medium gap-1"
                    >
                      <Sparkles className="h-2.5 w-2.5 text-blue-500" />
                      Logo Oficial
                    </Badge>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {matchedFirm.website}
                  </p>
                </div>
              </div>

              {!website && (
                <button
                  type="button"
                  onClick={() => setWebsite(matchedFirm.website)}
                  className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
                >
                  Usar web
                </button>
              )}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="firm-website" className="text-xs font-medium">
            Sitio Web (Opcional)
          </Label>
          <Input
            id="firm-website"
            type="url"
            placeholder="https://apextraderfunding.com"
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
