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
  Zap,
  Activity,
  Layers,
  Terminal,
  TrendingUp,
  Cpu,
  Check,
  Sparkles,
} from "lucide-react";
import { loginSchema } from "@/lib/validations/schemas";
import { BrandSymbol, BrandLogo } from "@/components/brand-logo";
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

  const fillDemoCredentials = () => {
    setEmail("trader@propfirm.com");
    setPassword("Trader123456!");
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#07090e] gap-4">
        <BrandSymbol size={48} className="animate-pulse" />
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
          LEFT COLUMN: The Authentication Console (45% - 50%)
          ======================================================== */}
      <div className="w-full lg:w-[48%] xl:w-[44%] min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-14 relative z-10 bg-white dark:bg-[#090b11] border-r border-slate-200/80 dark:border-white/[0.06]">
        {/* Top Bar inside Left Column */}
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
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
                Consola v2.4
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Iniciar Sesión
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Introduce tus credenciales para acceder a la gestión de cuentas, analítica cuantitativa y copiador.
            </p>
          </div>

          {/* Quick Demo Autofill Pill */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
              <span className="text-[11px] font-medium">¿Modo prueba o demo?</span>
            </div>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Cargar datos demo
            </button>
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
                  <span>Acceder a la Terminal</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Bottom Trust Indicators */}
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
          RIGHT COLUMN: The Terminal & Live Telemetry Panel (52% - 56%)
          Hidden on small viewports, high-tech fintech showcase on desktop
          ======================================================== */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-10 xl:p-14 bg-gradient-to-br from-[#080a10] via-[#090d18] to-[#06080e] relative overflow-hidden text-white select-none">
        {/* Ambient Radial Lights */}
        <div className="absolute -top-32 right-10 w-[500px] h-[400px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 left-10 w-[450px] h-[350px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Subtle Tech Grid Texture */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #60a5fa 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />

        {/* Top Header of Right Panel: Status Pill */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono font-semibold text-emerald-400 uppercase tracking-wider">
              SISTEMAS OPERACIONALES · FEED EN TIEMPO REAL
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <Cpu className="h-3.5 w-3.5 text-blue-400" />
            <span>LATENCIA: 11ms</span>
          </div>
        </div>

        {/* Center: Interactive Glass Terminal & Mock Telemetry */}
        <div className="my-auto space-y-6 relative z-10 max-w-xl">
          {/* Main Terminal Window */}
          <div className="rounded-3xl border border-white/[0.12] bg-[#0c0f1a]/85 backdrop-blur-xl shadow-2xl shadow-black/60 overflow-hidden">
            {/* Terminal Chrome Header */}
            <div className="px-5 py-3.5 border-b border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="text-xs font-mono text-zinc-400 ml-2 font-medium">
                  telemetry-terminal :: session#8420
                </span>
              </div>
              <Badge variant="outline" className="border-blue-500/30 text-blue-400 font-mono text-[10px]">
                TRADOVATE BRIDGE
              </Badge>
            </div>

            {/* Metrics Dashboard Inside Terminal */}
            <div className="p-6 space-y-6">
              {/* KPIs Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] uppercase font-mono text-zinc-400 block tracking-wider">
                    Capital Gestionado
                  </span>
                  <span className="text-lg font-bold font-mono text-white mt-1 block">
                    $250,000.00
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                    <TrendingUp className="h-3 w-3" />
                    +$18,450.00 (+7.38%)
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] uppercase font-mono text-zinc-400 block tracking-wider">
                    Cuentas Fondeadas
                  </span>
                  <span className="text-lg font-bold font-mono text-white mt-1 block">
                    4 Activas
                  </span>
                  <span className="text-[10px] text-zinc-400 mt-0.5 block truncate">
                    Apex · Topstep · MFF
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] uppercase font-mono text-zinc-400 block tracking-wider">
                    Colchón Drawdown
                  </span>
                  <span className="text-lg font-bold font-mono text-emerald-400 mt-1 block">
                    Seguro ($50K)
                  </span>
                  <span className="text-[10px] text-zinc-400 mt-0.5 block">
                    Trailing Bloqueado
                  </span>
                </div>
              </div>

              {/* Streaming Execution Logs */}
              <div className="rounded-2xl bg-black/50 border border-white/[0.06] p-4 font-mono text-xs space-y-2">
                <div className="flex items-center gap-2 text-zinc-500 text-[11px] pb-1 border-b border-white/[0.04]">
                  <Terminal className="h-3.5 w-3.5 text-blue-400" />
                  <span>REGISTRO DE EJECUCIÓN & REGLAS</span>
                </div>

                <div className="flex items-start gap-2 text-zinc-300">
                  <span className="text-blue-400 font-bold shrink-0">[14:58:10]</span>
                  <span>
                    <span className="text-emerald-400">COPIER_DISPATCH</span>: Replicando orden NQ 1x en 4 cuentas esclavas
                  </span>
                </div>

                <div className="flex items-start gap-2 text-zinc-300">
                  <span className="text-blue-400 font-bold shrink-0">[15:00:22]</span>
                  <span>
                    <span className="text-cyan-400">DRAWDOWN_SHIELD</span>: Trailing threshold bloqueado en balance base
                  </span>
                </div>

                <div className="flex items-start gap-2 text-zinc-300">
                  <span className="text-blue-400 font-bold shrink-0">[15:02:44]</span>
                  <span>
                    <span className="text-amber-400">CONSISTENCY_AUDIT</span>: Mejor día representa 24.5% (Regla 30% <span className="text-emerald-400 font-bold">CUMPLIDA</span>)
                  </span>
                </div>

                <div className="flex items-center gap-2 text-emerald-400 pt-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[11px]">Monitoreando actividad de mercado...</span>
                </div>
              </div>
            </div>
          </div>

          {/* Value Prop Row Under Terminal */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <Activity className="h-4 w-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-white block">Multi-Firma</span>
                <span className="text-[10px] text-zinc-400 block">Sincronización unificada</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Zap className="h-4 w-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-white block">Baja Latencia</span>
                <span className="text-[10px] text-zinc-400 block">Copia en milisegundos</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-white block">Anti-Quiebre</span>
                <span className="text-[10px] text-zinc-400 block">Supervisión en vivo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Institutional Quote */}
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400 border-t border-white/[0.06] pt-5 relative z-10">
          <span>PLATAFORMA INSTITUCIONAL DE TRADING</span>
          <span>© {new Date().getFullYear()} PROPFIRM TRACKER</span>
        </div>
      </div>
    </div>
  );
}
