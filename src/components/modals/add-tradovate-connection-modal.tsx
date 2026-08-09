"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TradovateCredential } from "@/types/database";
import { Key } from "lucide-react";

interface AddTradovateConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connection?: TradovateCredential | null;
  onSubmit: (data: {
    id?: string;
    connection_name: string;
    username_encrypted: string;
    password_encrypted?: string | null;
    app_id: string;
    account_environment: "demo" | "live";
  }) => Promise<void>;
}

export function AddTradovateConnectionModal({
  open,
  onOpenChange,
  connection,
  onSubmit,
}: AddTradovateConnectionModalProps) {
  const [connectionName, setConnectionName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [appId, setAppId] = useState("");
  const [environment, setEnvironment] = useState<"demo" | "live">("demo");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (connection) {
      setConnectionName(connection.connection_name || "");
      setUsername(connection.username_encrypted || "");
      setPassword(connection.password_encrypted || "");
      setAppId(connection.app_id || "");
      setEnvironment(connection.account_environment || "demo");
    } else {
      setConnectionName("");
      setUsername("");
      setPassword("");
      setAppId("");
      setEnvironment("demo");
    }
  }, [connection, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectionName || !username || !appId) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        id: connection?.id,
        connection_name: connectionName,
        username_encrypted: username,
        password_encrypted: password || null,
        app_id: appId,
        account_environment: environment,
      });
      onOpenChange(false);
    } catch (err) {
      console.error("Error saving tradovate connection:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
                {connection ? "Editar Conexión Tradovate" : "Conectar Nueva Empresa"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Añade tus credenciales API Tradovate / NinjaTrader para esta firma o cuenta.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Nombre Personalizado */}
          <div className="space-y-1.5">
            <Label htmlFor="conn-name" className="text-xs font-semibold">
              Nombre de la Conexión / Empresa
            </Label>
            <Input
              id="conn-name"
              type="text"
              placeholder="ej. Mi Topstep, Lucid Cuentas"
              value={connectionName}
              onChange={(e) => setConnectionName(e.target.value)}
              className="h-9 text-xs"
              required
            />
          </div>

          {/* Usuario Tradovate & Contraseña */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="trado-user-modal" className="text-xs font-semibold">
                Usuario Tradovate
              </Label>
              <Input
                id="trado-user-modal"
                type="text"
                placeholder="ej. trader_pro"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="trado-pass-modal" className="text-xs font-semibold">
                Contraseña API (Opcional)
              </Label>
              <Input
                id="trado-pass-modal"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* App ID & Entorno */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="trado-appid-modal" className="text-xs font-semibold">
                App ID
              </Label>
              <Input
                id="trado-appid-modal"
                type="text"
                placeholder="ej. EdgeFlowCopier"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="trado-env-modal" className="text-xs font-semibold">
                Entorno de Operación
              </Label>
              <select
                id="trado-env-modal"
                value={environment}
                onChange={(e) =>
                  setEnvironment(e.target.value as "demo" | "live")
                }
                className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="demo">Demo / Simulación</option>
                <option value="live">Live / Cuenta Real</option>
              </select>
            </div>
          </div>

          <DialogFooter className="pt-2">
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
              disabled={isSubmitting}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {isSubmitting
                ? "Guardando..."
                : connection
                ? "Guardar Cambios"
                : "Guardar Conexión"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
