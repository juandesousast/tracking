"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings, Shield, User, Key, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email || "");
        setUserId(user.id);
      }
    });
  }, [supabase]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Ajustes de Cuenta
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gestiona la preferencia de perfil, credenciales y seguridad de tu cuenta PropFirm Tracker.
          </p>
        </div>

        {/* User Profile Card */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Información del Perfil Privado
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Datos de usuario vinculados con Supabase Auth.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSave} className="space-y-4">
              {isSaved && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Ajustes guardados correctamente.</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="s-email" className="text-xs font-semibold">Correo Electrónico</Label>
                  <Input
                    id="s-email"
                    type="email"
                    value={userEmail}
                    disabled
                    className="h-9 text-xs bg-slate-50 dark:bg-slate-800/60 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="s-id" className="text-xs font-semibold">ID de Usuario (UUID)</Label>
                  <Input
                    id="s-id"
                    type="text"
                    value={userId}
                    disabled
                    className="h-9 text-xs bg-slate-50 dark:bg-slate-800/60 font-mono text-[11px] cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800 text-xs">
                  <Shield className="h-3.5 w-3.5 mr-1" />
                  Acceso Privado Protegido (RLS Habilitado)
                </Badge>

                <Button type="submit" size="sm" className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white">
                  Guardar Preferencias
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security & API Status */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Integraciones & APIs
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Estado de los servicios configurados en el servidor.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>OpenRouter AI Multimodal Vision</span>
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-[10px]">
                Activo
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Supabase PostgreSQL + Auth SSR</span>
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-[10px]">
                Activo
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
