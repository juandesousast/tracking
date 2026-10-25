'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Laptop,
  Download,
  Apple,
  ShieldCheck,
  Zap,
  Bell,
  Clock,
  CheckCircle2,
  Cpu,
  ArrowRight,
} from 'lucide-react';

export function DesktopDownloadBanner({ className }: { className?: string }) {
  const [selectedOS, setSelectedOS] = useState<'mac' | 'win'>('mac');

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950/40 p-6 sm:p-8 text-white shadow-2xl',
        className
      )}
    >
      {/* Background glow effects */}
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Top Header & Badges */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <Laptop className="h-3.5 w-3.5" />
                App Nativa de Escritorio
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <ShieldCheck className="h-3.5 w-3.5" />
                IP Residencial Segura ($0 Fees)
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/30">
                <Bell className="h-3.5 w-3.5" />
                Notificaciones Nativas
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              EdgeFlow Copier Pro Desktop
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Copia operaciones entre múltiples cuentas de Tradovate con <strong>latencia sub-milisegundo</strong>, sin costes de suscripción de API y con <strong>Guardián de Riesgo</strong> activo en segundo plano.
            </p>
          </div>

          {/* OS Switcher Pills */}
          <div className="flex items-center p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800 shrink-0 self-start lg:self-center">
            <button
              type="button"
              onClick={() => setSelectedOS('mac')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer',
                selectedOS === 'mac'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              <Apple className="h-4 w-4" />
              <span>macOS</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedOS('win')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer',
                selectedOS === 'win'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              <Cpu className="h-4 w-4" />
              <span>Windows</span>
            </button>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Zap className="h-4 w-4" />
              <span>&lt; 3 ms Latencia</span>
            </div>
            <span className="text-[11px] text-slate-400 leading-tight">
              WebSocket directo a Tradovate en tiempo real.
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-blue-400 font-bold">
              <ShieldCheck className="h-4 w-4" />
              <span>IP Residencial</span>
            </div>
            <span className="text-[11px] text-slate-400 leading-tight">
              Protección anti-flagging en Apex, Topstep y FTMO.
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-purple-400 font-bold">
              <Bell className="h-4 w-4" />
              <span>Avisos Nativos</span>
            </div>
            <span className="text-[11px] text-slate-400 leading-tight">
              Alertas de réplica y riesgo incluso minimizada.
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Clock className="h-4 w-4" />
              <span>Cierre EOD Watchdog</span>
            </div>
            <span className="text-[11px] text-slate-400 leading-tight">
              Aplanamiento automático antes del corte diario.
            </span>
          </div>
        </div>

        {/* Download Actions Box */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/90 border border-slate-800/90 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="space-y-1 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-white">
                {selectedOS === 'mac' ? 'EdgeFlow Copier para macOS' : 'EdgeFlow Copier para Windows'}
              </span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                v1.0.0 Oficial
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {selectedOS === 'mac'
                ? 'Compatible con Apple Silicon (M1/M2/M3/M4) e Intel. Requiere macOS 11 o superior.'
                : 'Compatible con Windows 10 y Windows 11 (64-bit). Instalador verificado.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {selectedOS === 'mac' ? (
              <a
                href="/api/download?os=mac"
                download="EdgeFlow-Copier-1.0.0-arm64.dmg"
                className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-bold gap-2 text-xs sm:text-sm h-11 px-6 rounded-xl shadow-lg shadow-blue-600/30 flex-1 sm:flex-none cursor-pointer transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Descargar para macOS (.dmg)</span>
              </a>
            ) : (
              <a
                href="/api/download?os=win"
                download="EdgeFlow-Copier-Setup-1.0.0.exe"
                className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-bold gap-2 text-xs sm:text-sm h-11 px-6 rounded-xl shadow-lg shadow-blue-600/30 flex-1 sm:flex-none cursor-pointer transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Descargar para Windows (.exe)</span>
              </a>
            )}
          </div>
        </div>

        {/* Clean 3-Step Setup Instructions */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 font-mono font-bold text-[11px]">
                1
              </span>
              <div>
                <strong className="block text-white font-semibold mb-0.5">Descarga el Instalador</strong>
                <span className="text-[11px] text-slate-400">Instala la aplicación en tu ordenador habitual de trading.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 font-mono font-bold text-[11px]">
                2
              </span>
              <div>
                <strong className="block text-white font-semibold mb-0.5">Inicia Sesión</strong>
                <span className="text-[11px] text-slate-400">Accede con tu cuenta; tus configuraciones se cargarán solas.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 font-mono font-bold text-[11px]">
                3
              </span>
              <div>
                <strong className="block text-white font-semibold mb-0.5">Opera Protegido</strong>
                <span className="text-[11px] text-slate-400">Conecta Tradovate y opera con réplica local sin latencia.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
