"use client";

import { useState, useEffect } from "react";
import { ResponsiveModal } from "./responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PropFirm, Account, Expense } from "@/types/database";
import { Receipt } from "lucide-react";
import { ReceiptScanner } from "@/components/ui/receipt-scanner";
import { ScannedReceiptResult } from "@/lib/actions/scan-receipt";
import { matchAccountFromScan } from "@/lib/match-account";

interface EditExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense | null;
  firms: PropFirm[];
  accounts: Account[];
  onSubmit: (
    id: string,
    expense: {
      firm_id: string;
      account_id: string | null;
      amount: number;
      category: string;
      description: string | null;
      date: string;
    }
  ) => void;
}

export function EditExpenseModal({
  open,
  onOpenChange,
  expense,
  firms,
  accounts,
  onSubmit,
}: EditExpenseModalProps) {
  const [firmId, setFirmId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Challenge Fee");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [ambiguityFirmName, setAmbiguityFirmName] = useState<string | null>(null);

  const filteredAccounts = accounts.filter((acc) => acc.firm_id === firmId);

  useEffect(() => {
    if (expense) {
      setFirmId(expense.firm_id || "");
      setAccountId(expense.account_id || "");
      setAmount(expense.amount.toString());
      setCategory(expense.category);
      setDate(expense.date);
      setDescription(expense.description || "");
      setAmbiguityFirmName(null);
    }
  }, [expense]);

  useEffect(() => {
    if (!open) {
      setAmbiguityFirmName(null);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expense) return;

    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("El monto debe ser un número positivo");
      return;
    }

    if (!date) {
      setError("La fecha es requerida");
      return;
    }

    setError("");
    onSubmit(expense.id, {
      firm_id: firmId,
      account_id: accountId || null,
      amount: parsedAmount,
      category,
      description: description.trim() ? description.trim() : null,
      date,
    });

    setAmbiguityFirmName(null);
    onOpenChange(false);
  };

  const handleScanComplete = (scannedData: ScannedReceiptResult) => {
    if (scannedData.amount) setAmount(scannedData.amount.toString());
    if (scannedData.date) setDate(scannedData.date);
    if (scannedData.description) setDescription(scannedData.description);
    if (scannedData.category) {
      const matchCat = ["Challenge Fee", "Reset", "Activation", "Otro"].find(
        (c) => c.toLowerCase() === scannedData.category.toLowerCase()
      );
      setCategory(matchCat || scannedData.category || "Challenge Fee");
    }

    const matchResult = matchAccountFromScan(
      scannedData.firm_name,
      scannedData.account_number_candidate,
      scannedData.alias_candidate,
      accounts,
      firms
    );

    if (matchResult.matchedFirmId) {
      setFirmId(matchResult.matchedFirmId);
    } else if (scannedData.firm_name) {
      const matchedFirm = firms.find(
        (f) =>
          f.name.toLowerCase().includes(scannedData.firm_name.toLowerCase()) ||
          scannedData.firm_name.toLowerCase().includes(f.name.toLowerCase())
      );
      if (matchedFirm) {
        setFirmId(matchedFirm.id);
      }
    }

    if (matchResult.matchedAccountId) {
      setAccountId(matchResult.matchedAccountId);
      setAmbiguityFirmName(null);
    } else if (matchResult.hasAmbiguity) {
      setAccountId("");
      const firmObj = firms.find((f) => f.id === matchResult.matchedFirmId);
      setAmbiguityFirmName(firmObj?.name || scannedData.firm_name || "la empresa");
    } else {
      setAmbiguityFirmName(null);
    }
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Editar Gasto / Fee"
      description="Actualiza la información de este gasto."
    >
      <ReceiptScanner onScanComplete={handleScanComplete} />
      {ambiguityFirmName && (
        <div className="mb-4 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 font-medium flex items-center gap-2">
          <span className="shrink-0">💡</span>
          <span>
            Se detectaron múltiples cuentas activas en {ambiguityFirmName}. Selecciona a cuál corresponde este registro.
          </span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="edit-expense-firm" className="text-xs font-medium">
              Empresa de Fondeo
            </Label>
            <select
              id="edit-expense-firm"
              value={firmId}
              onChange={(e) => {
                setFirmId(e.target.value);
                setAccountId("");
                setAmbiguityFirmName(null);
              }}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">General (Sin empresa)</option>
              {firms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-expense-account" className="text-xs font-medium">
              Cuenta Asociada
            </Label>
            <select
              id="edit-expense-account"
              value={accountId}
              onChange={(e) => {
                setAccountId(e.target.value);
                if (e.target.value) setAmbiguityFirmName(null);
              }}
              disabled={!firmId || filteredAccounts.length === 0}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
            >
              <option value="">Ninguna / Toda la firma</option>
              {filteredAccounts.map((acc) => {
                const firmName = firms.find((f) => f.id === acc.firm_id)?.name || "";
                const details = [
                  acc.account_number ? `#${acc.account_number}` : null,
                  acc.alias ? acc.alias : null,
                ]
                  .filter(Boolean)
                  .join(" - ");
                const extra = details ? ` (${details})` : "";
                return (
                  <option key={acc.id} value={acc.id}>
                    {firmName ? `${firmName} - ` : ""}${acc.account_size > 0 ? `$${acc.account_size.toLocaleString()}` : ""}${extra}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="edit-expense-amount" className="text-xs font-medium">
              Monto (USD) *
            </Label>
            <Input
              id="edit-expense-amount"
              type="number"
              step="0.01"
              placeholder="150.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-expense-category" className="text-xs font-medium">
              Categoría
            </Label>
            <select
              id="edit-expense-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="Challenge Fee">Challenge Fee</option>
              <option value="Reset">Reset</option>
              <option value="Activation">Activation</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-expense-date" className="text-xs font-medium">
            Fecha *
          </Label>
          <Input
            id="edit-expense-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-9 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-expense-desc" className="text-xs font-medium">
            Descripción / Notas (Opcional)
          </Label>
          <Input
            id="edit-expense-desc"
            placeholder="ej. Pase de fase 1 descuento 10%"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
          <Button type="submit" size="sm" className="text-xs gap-1.5 bg-amber-600 hover:bg-amber-700 text-white">
            <Receipt className="h-3.5 w-3.5" />
            Actualizar Gasto
          </Button>
        </div>
      </form>
    </ResponsiveModal>
  );
}

