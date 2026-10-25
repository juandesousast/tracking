"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  Zap,
  Check,
  ShieldAlert,
  Wallet,
} from "lucide-react";
import { loginSchema } from "@/lib/validations/schemas";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        router.push("/");
        router.refresh();
      } else {
        setIsCheckingAuth(false);
      }
    }
    checkAuth();
  }, [router, supabase]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const validationResult = loginSchema.safeParse({ email, password });
    if (!validationResult.success) {
      const firstError =
        validationResult.error.issues[0]?.message || "Datos de inicio de sesión inválidos";
      setErrorMsg(firstError);
      setIsLoading(false);
      return;
    }

    const { email: sanitizedEmail, password: validPassword } = validationResult.data;

    const { error } = await supabase.auth.signInWithPassword({
      email: sanitizedEmail,
      password: validPassword,
    });

    if (error) {
      setErrorMsg(
        error.message === "Invalid login credentials"
          ? "Credenciales incorrectas. Verifica tu correo y contraseña."
          : error.message
      );
      setIsLoading(false);
    } else {
      setSuccessMsg("¡Autenticación completada! Accediendo a tu terminal...");
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 700);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#07090e] gap-4">
        <div className="h-10 w-10 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 animate-pulse">
          <Activity className="h-5 w-5" />
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
          <span>Verificando sesión segura...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-white transition-colors duration-300">
      {/* ========================================================
          LEFT COLUMN: The Authentication Console (42% - 45%)
          Clean, distraction-free, fully responsive in Light & Dark
          ======================================================== */}
      <div className="w-full lg:w-[46%] xl:w-[42%] min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-14 relative z-20 bg-white dark:bg-[#090b11] border-r border-slate-200/80 dark:border-white/[0.06] transition-colors duration-300">
        {/* Top Header */}
        <div className="flex items-center justify-between w-full">
          <Link href="/" className="transition-opacity hover:opacity-85">
            <BrandLogo size="md" />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>

        {/* Center: Auth Form Container */}
        <div className="w-full max-w-sm mx-auto my-auto py-10 space-y-7">
          <div className="space-y-2 text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Iniciar Sesión
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Introduce tus credenciales para acceder a la gestión de cuentas, analítica cuantitativa y copiador.
            </p>
          </div>

          {/* Alerts */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="login-email"
                className="text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Correo Electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="trader@institucional.com"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 text-xs rounded-xl border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="login-password"
                  className="text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Contraseña
                </Label>
                <Link
                  href="/support"
                  className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  ¿Olvidaste tu clave?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 text-xs font-mono rounded-xl border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
                  title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span>Recordarme en este equipo</span>
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 font-bold text-xs shadow-md shadow-blue-600/20 rounded-xl bg-blue-600 hover:bg-blue-500 text-white gap-2 transition-all cursor-pointer mt-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verificando credenciales...</span>
                </>
              ) : (
                <>
                  <span>Acceder a la Plataforma</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Bottom Security Footer */}
        <div className="pt-6 border-t border-slate-200/60 dark:border-white/[0.05] flex items-center justify-between text-[11px] text-slate-400 dark:text-zinc-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Cifrado TLS 1.3 · AES-256</span>
          </div>
          <Link href="/support" className="hover:underline">
            Soporte 24/7
          </Link>
        </div>
      </div>

      {/* ========================================================
          RIGHT COLUMN: Option A - Free-Standing Luminous Equity Curve
          No clunky boxed window, spacious, clean & fully synced in Light/Dark
          ======================================================== */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-10 xl:p-16 relative overflow-hidden select-none bg-gradient-to-br from-slate-100/90 via-slate-50 to-blue-50/40 dark:from-[#06080e] dark:via-[#090d18] dark:to-[#04060c] text-slate-900 dark:text-white transition-colors duration-300">
        {/* Atmospheric Ambient Glows */}
        <div className="absolute top-1/4 -right-20 w-[600px] h-[500px] bg-blue-500/[0.08] dark:bg-blue-600/[0.12] rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-20 left-10 w-[500px] h-[400px] bg-cyan-400/[0.08] dark:bg-cyan-500/[0.08] rounded-full blur-[120px] pointer-events-none" />

        {/* Geometric Matrix Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1.5px 1.5px, currentColor 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />

        {/* Top Live Ticker Pill */}
        <div className="flex items-center justify-between w-full relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/10 shadow-sm backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                MERCADOS EN VIVO · NQ FUTURES
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>LATENCIA: 11ms · CIFRADO TLS 1.3</span>
          </div>
        </div>

        {/* Center: Open Free-Standing Trading Showcase */}
        <div className="my-auto relative z-10 w-full max-w-2xl mx-auto space-y-8 py-6">
          {/* Main Portfolio Headline (Free of boxes) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-blue-600 dark:text-blue-400 font-bold">
                TELEMETRÍA DE CARTERA INSTITUCIONAL
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline gap-3 sm:gap-5">
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
                $250,000.00
              </span>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 self-start">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>+$18,450.00 (+7.38%)</span>
                <span className="text-slate-400 dark:text-zinc-500 font-normal">este mes</span>
              </div>
            </div>
          </div>

          {/* Clean Luminous Equity Curve (Border-free, breathing canvas) */}
          <div className="relative w-full h-[220px]">
            <svg className="w-full h-full" viewBox="0 0 540 220" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="equityAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
                  <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>

                <linearGradient id="equityLineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              {/* Horizontal Subtle Reference Guides */}
              <line x1="0" y1="35" x2="540" y2="35" stroke="currentColor" strokeOpacity="0.06" strokeDasharray="4 4" />
              <line x1="0" y1="90" x2="540" y2="90" stroke="currentColor" strokeOpacity="0.06" strokeDasharray="4 4" />
              <line x1="0" y1="145" x2="540" y2="145" stroke="currentColor" strokeOpacity="0.06" strokeDasharray="4 4" />
              <line x1="0" y1="200" x2="540" y2="200" stroke="currentColor" strokeOpacity="0.06" strokeDasharray="4 4" />

              {/* Price Scale Text on Right */}
              <text x="495" y="38" fill="#94a3b8" fontSize="9" fontFamily="monospace">$258K</text>
              <text x="495" y="93" fill="#94a3b8" fontSize="9" fontFamily="monospace">$250K</text>
              <text x="495" y="148" fill="#94a3b8" fontSize="9" fontFamily="monospace">$242K</text>
              <text x="495" y="203" fill="#94a3b8" fontSize="9" fontFamily="monospace">$235K</text>

              {/* Gradient Area Fill under Curve */}
              <path
                d="M 15 155 C 65 150, 110 162, 155 130 C 200 100, 240 115, 290 85 C 340 55, 390 65, 440 45 C 465 35, 485 30, 505 28 L 505 210 L 15 210 Z"
                fill="url(#equityAreaGrad)"
              />

              {/* Main Fluid Glowing Curve */}
              <path
                d="M 15 155 C 65 150, 110 162, 155 130 C 200 100, 240 115, 290 85 C 340 55, 390 65, 440 45 C 465 35, 485 30, 505 28"
                fill="none"
                stroke="url(#equityLineGrad)"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Peak Target Marker */}
              <circle cx="505" cy="28" r="4.5" fill="#10b981" />
              <circle cx="505" cy="28" r="9" fill="#10b981" opacity="0.2" />

              {/* Floating Peak Tooltip */}
              <rect x="365" y="16" width="128" height="24" fill="#065f46" rx="6" filter="drop-shadow(0px 3px 6px rgba(0,0,0,0.3))" />
              <text x="373" y="32" fill="#a7f3d0" fontSize="9" fontFamily="monospace" fontWeight="bold">
                MÁXIMO: $258,450.00
              </text>
            </svg>
          </div>

          {/* Two Clean Floating Bento Pills (Restrained & Distributed) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Pill 1: Synchronized Accounts & Copier */}
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] shadow-sm backdrop-blur-md flex items-start gap-3.5">
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                <Zap className="h-4 w-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    4 Cuentas Fondeadas
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                    Sync
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                  Apex, Topstep, MFF · Copiador Tradovate a 11ms
                </p>
              </div>
            </div>

            {/* Pill 2: Consistency & Drawdown Shield */}
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] shadow-sm backdrop-blur-md flex items-start gap-3.5">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Consistencia: 21.4%
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-blue-500/15 text-blue-700 dark:text-blue-400">
                    Elegible
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                  Límite 30% cumplido · Drawdown protegido en $50K
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Institutional Quote */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 dark:text-zinc-500 border-t border-slate-200/60 dark:border-white/[0.06] pt-5 relative z-10">
          <span>SUITE PROFESIONAL DE TRADING</span>
          <span>© {new Date().getFullYear()} PROPFIRM TRACKER</span>
        </div>
      </div>
    </div>
  );
}
