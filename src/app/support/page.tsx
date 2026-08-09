"use client";

import DashboardLayout from "../dashboard-layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, Mail, MessageSquare, ExternalLink, ShieldCheck } from "lucide-react";

export default function SupportPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Centro de Soporte & Ayuda
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Recibe asistencia sobre PropFirm Tracker, el escáner con IA y el Copiador de Tradovate.
          </p>
        </div>

        {/* Support Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Contacto Directo por Email
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <CardDescription className="text-xs text-slate-500">
                Escríbenos directamente para consultas sobre tu cuenta o sugerencias de funciones.
              </CardDescription>
              <Button size="sm" className="w-full text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5" onClick={() => window.location.href = "mailto:support@propfirmtracker.io"}>
                <Mail className="h-3.5 w-3.5" />
                Enviar Email a Soporte
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Documentación & FAQs
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <CardDescription className="text-xs text-slate-500">
                Consulta las guías oficiales para conectar credenciales de Tradovate y optimizar tus reglas de copiado.
              </CardDescription>
              <Button variant="outline" size="sm" className="w-full text-xs font-semibold gap-1.5" onClick={() => window.open("https://github.com/juandesousast/tracking", "_blank")}>
                <ExternalLink className="h-3.5 w-3.5" />
                Ver Repositorio & Documentación
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Security Badge */}
        <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/80 dark:border-blue-800/50 shadow-xs">
          <CardContent className="p-5 flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Sistema 100% Protegido con Encriptación
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Tus credenciales de Tradovate y registros financieros están aislados por usuario con Row Level Security (RLS) en PostgreSQL.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
