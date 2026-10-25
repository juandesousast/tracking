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
import { Textarea } from "@/components/ui/textarea";
import { TradovateCredential } from "@/types/database";
import { Key, Loader2, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";

interface AddTradovateConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connection?: TradovateCredential | null;
  onSubmit: (data: {
    id?: string;
    connection_name: string;
    username_encrypted: string;
    password_encrypted?: string | null;
    app_id?: string;
    access_token_encrypted?: string | null;
    account_environment: "demo" | "live";
  }) => Promise<void>;
}

export function AddTradovateConnectionModal({
  open,
  onOpenChange,
  connection,
  onSubmit,
}: AddTradovateConnectionModalProps) {
  const [activeTab, setActiveTab] = useState<"token" | "manual">("token");
  const [connectionName, setConnectionName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [appId, setAppId] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [environment, setEnvironment] = useState<"demo" | "live">("demo");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedNotice, setParsedNotice] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    setParsedNotice(null);
    if (connection) {
      setConnectionName(connection.connection_name || "");
      setUsername(connection.username_encrypted || "");
      setPassword(connection.password_encrypted || "");
      setAppId(connection.app_id || "");
      setTokenInput(connection.access_token_encrypted || "");
      setEnvironment(connection.account_environment || "demo");
      if (!connection.access_token_encrypted && connection.app_id) {
        setActiveTab("manual");
      } else {
        setActiveTab("token");
      }
    } else {
      setConnectionName("");
      setUsername("");
      setPassword("");
      setAppId("TradovateWeb");
      setTokenInput("");
      setEnvironment("demo");
      setActiveTab("token");
    }
  }, [connection, open]);

  // Automatically detect JSON paste with token / username / environment
  const handleTokenPaste = (value: string) => {
    setTokenInput(value);
    setError(null);
    setParsedNotice(null);

    const trimmed = value.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const json = JSON.parse(trimmed);
        const detectedToken = json.token || json.accessToken || json.checkToken;
        const detectedUser = json.username || json.name || json.userId;
        const detectedEnv = json.environment === "live" ? "live" : "demo";

        if (detectedToken) {
          setTokenInput(detectedToken);
        }
        if (detectedUser) {
          setUsername(String(detectedUser));
          if (!connectionName) {
            setConnectionName(`Tradovate ${detectedEnv === "live" ? "Real" : "Demo"} (${detectedUser})`);
          }
        }
        if (detectedEnv) {
          setEnvironment(detectedEnv);
        }

        setParsedNotice(`Datos detectados: Usuario ${detectedUser || "OK"}, Entorno ${detectedEnv}`);
      } catch (e) {
        // Not strict JSON, continue as raw token
      }
    } else if (trimmed.startsWith("eyJ")) {
      // Looks like a direct JWT token
      if (!connectionName && username) {
        setConnectionName(`Tradovate ${environment === "live" ? "Real" : "Demo"} (${username})`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (activeTab === "token") {
      if (!tokenInput.trim()) {
        setError("Por favor introduce el token o JSON de sesión de Tradovate.");
        return;
      }
      const finalUser = username.trim() || "Tradovate_User";
      const finalName = connectionName.trim() || `Tradovate (${finalUser})`;

      setIsSubmitting(true);
      try {
        await onSubmit({
          id: connection?.id,
          connection_name: finalName,
          username_encrypted: finalUser,
          password_encrypted: null,
          app_id: "TradovateWeb",
          access_token_encrypted: tokenInput.trim(),
          account_environment: environment,
        });
        onOpenChange(false);
      } catch (err: any) {
        console.error("Error saving tradovate connection:", err);
        setError(err?.message || "Ocurrió un error al guardar la conexión Tradovate.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Manual API credentials tab
      if (!connectionName.trim() || !username.trim() || !appId.trim()) {
        setError("Por favor completa los campos requeridos: Nombre, Usuario y App ID.");
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit({
          id: connection?.id,
          connection_name: connectionName.trim(),
          username_encrypted: username.trim(),
          password_encrypted: password || null,
          app_id: appId.trim(),
          access_token_encrypted: null,
          account_environment: environment,
        });
        onOpenChange(false);
      } catch (err: any) {
        console.error("Error saving tradovate connection:", err);
        setError(err?.message || "Ocurrió un error al guardar la conexión Tradovate.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
                {connection ? "Editar Conexión Tradovate" : "Conectar Empresa Tradovate"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Conecta tu sesión web o credenciales para replicación con tu IP local.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl mt-1">
          <button
            type="button"
            onClick={() => setActiveTab("token")}
            className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "token"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Sesión Web / Token (0 €)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("manual")}
            className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "manual"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Key className="h-3.5 w-3.5" />
            <span>API Oficial (Avanzado)</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {parsedNotice && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{parsedNotice}</span>
            </div>
          )}

          {activeTab === "token" ? (
            <>
              {/* Token or JSON Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="token-input" className="text-xs font-semibold">
                    Pegar Token o JSON de Sesión Tradovate
                  </Label>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Sin coste de $25/mes
                  </span>
                </div>
                <Textarea
                  id="token-input"
                  placeholder='Pega aquí el JSON de Tradovate o tu token jwt ("eyJraWQi...")'
                  value={tokenInput}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleTokenPaste(e.target.value)}
                  className="font-mono text-[11px] h-24 resize-none leading-relaxed"
                  required
                />
              </div>

              {/* Nombre y Usuario */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="conn-name-token" className="text-xs font-semibold">
                    Nombre Descriptivo
                  </Label>
                  <Input
                    id="conn-name-token"
                    type="text"
                    placeholder="ej. Tradovate Demo Principal"
                    value={connectionName}
                    onChange={(e) => setConnectionName(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="trado-user-token" className="text-xs font-semibold">
                    Usuario Tradovate
                  </Label>
                  <Input
                    id="trado-user-token"
                    type="text"
                    placeholder="ej. conquestandspare"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* Entorno */}
              <div className="space-y-1.5">
                <Label htmlFor="trado-env-token" className="text-xs font-semibold">
                  Entorno
                </Label>
                <select
                  id="trado-env-token"
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value as "demo" | "live")}
                  className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="demo">Demo / Simulación (demo.tradovateapi.com)</option>
                  <option value="live">Live / Cuenta Real (live.tradovateapi.com)</option>
                </select>
              </div>
            </>
          ) : (
            <>
              {/* Manual Fields */}
              <div className="space-y-1.5">
                <Label htmlFor="conn-name" className="text-xs font-semibold">
                  Nombre de la Conexión / Empresa
                </Label>
                <Input
                  id="conn-name"
                  type="text"
                  placeholder="ej. Mi Topstep, Apex Trading"
                  value={connectionName}
                  onChange={(e) => setConnectionName(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="trado-appid-modal" className="text-xs font-semibold">
                    App ID
                  </Label>
                  <Input
                    id="trado-appid-modal"
                    type="text"
                    placeholder="ej. MiAppAPI"
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                    className="h-9 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="trado-env-modal" className="text-xs font-semibold">
                    Entorno
                  </Label>
                  <select
                    id="trado-env-modal"
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value as "demo" | "live")}
                    className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="demo">Demo / Simulación</option>
                    <option value="live">Live / Cuenta Real</option>
                  </select>
                </div>
              </div>
            </>
          )}

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
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Conectando...</span>
                </>
              ) : connection ? (
                "Guardar Cambios"
              ) : (
                "Guardar y Conectar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
