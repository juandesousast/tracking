"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
  Activity,
  Zap,
  ShieldAlert,
} from "lucide-react";
import { loginSchema } from "@/lib/validations/schemas";
import { BrandLogo, BrandSymbol } from "@/components/brand-logo";
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
    <div className="min-h-screen w-full flex flex-col justify-between items-center p-4 sm:p-8 md:p-12 relative overflow-hidden bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-white transition-colors duration-300">
      {/* ========================================================
          ATMOSPHERIC BACKGROUND (Minimalist Mesh Glow & Grid)
          Stripe / Linear / Raycast aesthetic in Light & Dark
          ======================================================== */}
      {/* Top ambient radial glow */}
      <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[720px] h-[520px] bg-blue-500/[0.08] dark:bg-blue-600/[0.12] rounded-full blur-[140px] pointer-events-none" />
      {/* Bottom accent glow */}
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[540px] h-[400px] bg-cyan-400/[0.06] dark:bg-cyan-500/[0.08] rounded-full blur-[120px] pointer-events-none" />

      {/* Subtle Dot Matrix Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1.5px 1.5px, currentColor 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* ========================================================
          TOP BAR: Brand Header & Theme Controls
          ======================================================== */}
      <header className="w-full max-w-5xl flex items-center justify-between relative z-20">
        <Link href="/" className="transition-opacity hover:opacity-85">
          <BrandLogo size="md" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.07] text-[11px] font-mono text-slate-500 dark:text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>TLS 1.3 · 256-Bit</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* ========================================================
          MAIN CENTER: Minimalist Glass Card Console
          ======================================================== */}
      <main className="my-auto w-full max-w-md relative z-10 py-8">
        <div className="relative">
          {/* Subtle Accent Glow around the card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-cyan-500/20 to-blue-600/20 rounded-[32px] blur-xl opacity-50 dark:opacity-40 -z-10" />

          {/* Glass Card Container */}
          <div className="bg-white/95 dark:bg-[#0c0f18]/90 backdrop-blur-2xl border border-slate-200/90 dark:border-white/[0.08] rounded-3xl p-7 sm:p-9 shadow-2xl shadow-slate-900/5 dark:shadow-black/70 space-y-6 transition-colors duration-300">
            {/* Header with Emblem */}
            <div className="space-y-3 text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                <BrandSymbol size={28} />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Iniciar Sesión
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                  Accede a la gestión de cuentas, analítica cuantitativa y copiador institucional.
                </p>
              </div>
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
                    className="pl-10 h-11 text-xs rounded-xl border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03] text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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
                    className="pl-10 pr-10 h-11 text-xs font-mono rounded-xl border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03] text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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
                className="w-full h-11 font-bold text-xs shadow-lg shadow-blue-600/25 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white gap-2 transition-all cursor-pointer mt-1"
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

            {/* Feature Highlights Pills inside card */}
            <div className="pt-4 border-t border-slate-200/60 dark:border-white/[0.06] grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04]">
                <Zap className="h-3.5 w-3.5 text-blue-500 mx-auto mb-1" />
                <span className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 block font-semibold">
                  Multi-Firma
                </span>
                <span className="text-[9px] text-slate-400 dark:text-zinc-500 block truncate">
                  Apex, Topstep
                </span>
              </div>

              <div className="p-2 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04]">
                <Activity className="h-3.5 w-3.5 text-emerald-500 mx-auto mb-1" />
                <span className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 block font-semibold">
                  Copiador
                </span>
                <span className="text-[9px] text-slate-400 dark:text-zinc-500 block truncate">
                  Tradovate 11ms
                </span>
              </div>

              <div className="p-2 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04]">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-500 mx-auto mb-1" />
                <span className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 block font-semibold">
                  Drawdown
                </span>
                <span className="text-[9px] text-slate-400 dark:text-zinc-500 block truncate">
                  Escudo Activo
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================
          FOOTER: Security & Support Links
          ======================================================== */}
      <footer className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-zinc-500 gap-2 relative z-20 pt-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Infraestructura Segura · Cifrado de Grado Institucional</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <Link href="/support" className="hover:text-slate-600 dark:hover:text-zinc-300 transition-colors">
            Centro de Ayuda
          </Link>
          <span>·</span>
          <span>© {new Date().getFullYear()} PROPFIRM TRACKER</span>
        </div>
      </footer>
    </div>
  );
}
