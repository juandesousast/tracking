"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
} from "lucide-react";
import { loginSchema } from "@/lib/validations/schemas";
import { BrandSymbol, BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#08090d] gap-4">
        <BrandSymbol size={44} className="animate-pulse" />
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
          <span>Verificando sesión segura...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-white relative overflow-hidden transition-colors duration-300">
      {/* Dynamic Ambient Mesh Glows */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-b from-blue-600/15 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-40 right-1/4 w-[500px] h-[350px] bg-gradient-to-t from-blue-700/10 via-indigo-600/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Subtle Geometric Background Grid */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04] pointer-events-none -z-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Top Utility Header */}
      <header className="w-full flex items-center justify-between px-6 py-5 max-w-6xl mx-auto z-10">
        <Link href="/" className="transition-opacity hover:opacity-90">
          <BrandLogo size="md" />
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Form Center Stage */}
      <main className="w-full max-w-md mx-auto px-4 py-8 z-10 my-auto">
        {/* Emblem Hero Badge */}
        <div className="flex flex-col items-center text-center space-y-4 mb-7">
          <div className="relative group">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 opacity-30 blur-md group-hover:opacity-50 transition duration-300" />
            <div className="relative p-1 rounded-2xl bg-white dark:bg-[#0f121b] border border-slate-200/80 dark:border-white/10 shadow-lg">
              <BrandSymbol size={54} />
            </div>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Terminal de Operativa
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Gestión cuantitativa de cuentas de fondeo, reglas de consistencia y ejecución copier.
            </p>
          </div>

          <Badge
            variant="outline"
            className="gap-1.5 py-1 px-3 border-blue-500/30 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-mono text-[11px] rounded-full shadow-2xs"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>Acceso Privado Cifrado AES-256</span>
          </Badge>
        </div>

        {/* Auth Card */}
        <Card className="rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-xl shadow-slate-900/5 dark:shadow-black/40 bg-white/95 dark:bg-[#0c0e15]/95 backdrop-blur-md overflow-hidden">
          <CardContent className="p-6 sm:p-7 space-y-5">
            {/* Alert Messages */}
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

            {/* Login Form */}
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
                    Contraseña de Acceso
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
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
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

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 font-bold text-xs shadow-md shadow-blue-600/20 rounded-xl bg-blue-600 hover:bg-blue-500 text-white gap-2 transition-all cursor-pointer mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verificando Credenciales...</span>
                  </>
                ) : (
                  <>
                    <span>Acceder a la Plataforma</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security & Features Strip */}
        <div className="mt-7 grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl border border-slate-200/60 dark:border-white/[0.05] bg-white/60 dark:bg-white/[0.02]">
            <Activity className="h-3.5 w-3.5 text-blue-500 mx-auto mb-1" />
            <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 block">
              Multi-Firma
            </span>
          </div>

          <div className="p-2.5 rounded-xl border border-slate-200/60 dark:border-white/[0.05] bg-white/60 dark:bg-white/[0.02]">
            <Zap className="h-3.5 w-3.5 text-amber-500 mx-auto mb-1" />
            <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 block">
              Tradovate API
            </span>
          </div>

          <div className="p-2.5 rounded-xl border border-slate-200/60 dark:border-white/[0.05] bg-white/60 dark:bg-white/[0.02]">
            <Layers className="h-3.5 w-3.5 text-emerald-500 mx-auto mb-1" />
            <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 block">
              Drawdown Shield
            </span>
          </div>
        </div>
      </main>

      {/* Institutional Footer */}
      <footer className="w-full text-center py-5 text-[11px] text-slate-400 dark:text-zinc-500 z-10">
        <p>PropFirm Tracker Suite © {new Date().getFullYear()} · Todos los derechos reservados</p>
      </footer>
    </div>
  );
}
