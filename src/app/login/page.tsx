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
  Target,
  ShieldAlert,
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
          LEFT COLUMN: The Authentication Console (45% - 48%)
          ======================================================== */}
      <div className="w-full lg:w-[48%] xl:w-[42%] min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-14 relative z-10 bg-white dark:bg-[#090b11] border-r border-slate-200/80 dark:border-white/[0.06]">
        {/* Top Bar inside Left Column */}
        <div className="flex items-center justify-between w-full">
          <Link href="/" className="transition-opacity hover:opacity-85">
            <BrandLogo size="md" />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>

        {/* Center: Clean Auth Form Container */}
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
          RIGHT COLUMN: The Live Trading Chart Showcase (52% - 58%)
          Active Order Execution · Candlestick Telemetry · Risk Levels
          ======================================================== */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-8 xl:p-12 bg-gradient-to-br from-[#07090e] via-[#090d18] to-[#05070c] relative overflow-hidden text-white select-none">
        {/* Dynamic Glows */}
        <div className="absolute -top-32 right-10 w-[550px] h-[400px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 left-10 w-[450px] h-[350px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Subtle Tech Grid Texture */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #60a5fa 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />

        {/* Top Header: Live Trading Status Pill */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono font-semibold text-emerald-400 uppercase tracking-wider">
              MERCADOS EN VIVO · CME FUTURES
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              FEED CONECTADO
            </span>
            <span>·</span>
            <span>12ms</span>
          </div>
        </div>

        {/* Center: Realistic Financial Trading Chart Window */}
        <div className="my-auto space-y-4 relative z-10 w-full max-w-2xl mx-auto">
          {/* Main Chart Container */}
          <div className="rounded-3xl border border-white/[0.12] bg-[#0b0e19]/90 backdrop-blur-xl shadow-2xl shadow-black/70 overflow-hidden">
            {/* Chart Top Chrome / Instrument Ticker */}
            <div className="px-5 py-3.5 border-b border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <div className="h-4 w-[1px] bg-white/10 mx-1" />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold tracking-tight text-white font-mono">
                    NQ 100
                  </span>
                  <Badge variant="outline" className="border-blue-500/30 text-blue-400 font-mono text-[10px] px-1.5 py-0">
                    5M
                  </Badge>
                  <span className="text-xs font-mono text-emerald-400 font-bold ml-1">
                    20,482.50
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400/80">
                    +142.25 (+0.70%)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono text-[10px] uppercase font-bold px-2 py-0.5">
                  ● LONG (BUY) · 2 CT
                </Badge>
              </div>
            </div>

            {/* Trading Chart Visual Canvas */}
            <div className="p-5 relative bg-[#090b14]/70">
              {/* SVG Candlestick Chart with Order Overlay */}
              <div className="relative w-full h-[260px] overflow-hidden rounded-2xl bg-[#070910] border border-white/[0.05] p-2">
                {/* Background Grid Lines */}
                <svg className="w-full h-full" viewBox="0 0 540 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="takeProfitGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="orderBlockGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.04" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Price Grid Lines */}
                  <line x1="0" y1="40" x2="540" y2="40" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                  <line x1="0" y1="95" x2="540" y2="95" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                  <line x1="0" y1="150" x2="540" y2="150" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                  <line x1="0" y1="205" x2="540" y2="205" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />

                  {/* Price Scale Text on Right */}
                  <text x="495" y="44" fill="#64748b" fontSize="9" fontFamily="monospace">20,540.0</text>
                  <text x="495" y="99" fill="#64748b" fontSize="9" fontFamily="monospace">20,490.0</text>
                  <text x="495" y="154" fill="#64748b" fontSize="9" fontFamily="monospace">20,440.0</text>
                  <text x="495" y="209" fill="#64748b" fontSize="9" fontFamily="monospace">20,390.0</text>

                  {/* Order Block / Demand Zone */}
                  <rect x="70" y="140" width="130" height="35" fill="url(#orderBlockGrad)" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2 2" rx="4" />
                  <text x="76" y="152" fill="#60a5fa" fontSize="8" fontFamily="monospace" fontWeight="bold">DEMAND OB 5M</text>

                  {/* ========================================================
                      CANDLESTICK SERIES (16 candles)
                      wick: line, body: rect
                      ======================================================== */}
                  {/* C1: Red */}
                  <line x1="30" y1="90" x2="30" y2="135" stroke="#f43f5e" strokeWidth="1.2" />
                  <rect x="25" y="100" width="10" height="25" fill="#f43f5e" rx="1.5" />

                  {/* C2: Red */}
                  <line x1="55" y1="115" x2="55" y2="160" stroke="#f43f5e" strokeWidth="1.2" />
                  <rect x="50" y="122" width="10" height="30" fill="#f43f5e" rx="1.5" />

                  {/* C3: Rejection Green Pinbar at Demand */}
                  <line x1="80" y1="135" x2="80" y2="175" stroke="#10b981" strokeWidth="1.2" />
                  <rect x="75" y="142" width="10" height="15" fill="#10b981" rx="1.5" />

                  {/* C4: Green Accumulation */}
                  <line x1="105" y1="130" x2="105" y2="165" stroke="#10b981" strokeWidth="1.2" />
                  <rect x="100" y="135" width="10" height="20" fill="#10b981" rx="1.5" />

                  {/* C5: Small Red Doji */}
                  <line x1="130" y1="128" x2="130" y2="160" stroke="#f43f5e" strokeWidth="1.2" />
                  <rect x="125" y="136" width="10" height="10" fill="#f43f5e" rx="1.5" />

                  {/* C6: Strong Green Breakout (ENTRY TRIGGER) */}
                  <line x1="155" y1="110" x2="155" y2="155" stroke="#10b981" strokeWidth="1.2" />
                  <rect x="150" y="118" width="10" height="32" fill="#10b981" rx="1.5" />

                  {/* C7: Green Continuation */}
                  <line x1="180" y1="95" x2="180" y2="135" stroke="#10b981" strokeWidth="1.2" />
                  <rect x="175" y="105" width="10" height="25" fill="#10b981" rx="1.5" />

                  {/* C8: Small Red Retest */}
                  <line x1="205" y1="102" x2="205" y2="138" stroke="#f43f5e" strokeWidth="1.2" />
                  <rect x="200" y="108" width="10" height="18" fill="#f43f5e" rx="1.5" />

                  {/* C9: Green Bounce */}
                  <line x1="230" y1="90" x2="230" y2="130" stroke="#10b981" strokeWidth="1.2" />
                  <rect x="225" y="98" width="10" height="24" fill="#10b981" rx="1.5" />

                  {/* C10: Green Extension */}
                  <line x1="255" y1="80" x2="255" y2="120" stroke="#10b981" strokeWidth="1.2" />
                  <rect x="250" y="85" width="10" height="26" fill="#10b981" rx="1.5" />

                  {/* C11: Red consolidation */}
                  <line x1="280" y1="78" x2="280" y2="115" stroke="#f43f5e" strokeWidth="1.2" />
                  <rect x="275" y="82" width="10" height="16" fill="#f43f5e" rx="1.5" />

                  {/* C12: Green Impulse */}
                  <line x1="305" y1="65" x2="305" y2="105" stroke="#10b981" strokeWidth="1.2" />
                  <rect x="300" y="70" width="10" height="25" fill="#10b981" rx="1.5" />

                  {/* C13: Small Green */}
                  <line x1="330" y1="60" x2="330" y2="92" stroke="#10b981" strokeWidth="1.2" />
                  <rect x="325" y="65" width="10" height="18" fill="#10b981" rx="1.5" />

                  {/* C14: Red Pullback */}
                  <line x1="355" y1="62" x2="355" y2="98" stroke="#f43f5e" strokeWidth="1.2" />
                  <rect x="350" y="68" width="10" height="20" fill="#f43f5e" rx="1.5" />

                  {/* C15: Bullish Expansion */}
                  <line x1="380" y1="48" x2="380" y2="88" stroke="#10b981" strokeWidth="1.2" />
                  <rect x="375" y="54" width="10" height="28" fill="#10b981" rx="1.5" />

                  {/* C16: Current Active Candle */}
                  <line x1="405" y1="42" x2="405" y2="78" stroke="#10b981" strokeWidth="1.5" />
                  <rect x="400" y="48" width="10" height="24" fill="#10b981" rx="1.5" />

                  {/* ========================================================
                      ORDER EXECUTION OVERLAYS
                      TP line, Entry Line, SL Line
                      ======================================================== */}
                  {/* Profit Area Shading between Entry and Current Price */}
                  <rect x="150" y="48" width="265" height="102" fill="url(#takeProfitGradient)" />

                  {/* 1. Take Profit Level (Green Dashed) */}
                  <line x1="140" y1="36" x2="480" y2="36" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 4" />
                  <rect x="145" y="26" width="150" height="18" fill="#064e3b" rx="4" />
                  <text x="152" y="38" fill="#34d399" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                    TP: 20,540.00 (+50.0 pts · +$2,000)
                  </text>

                  {/* 2. Floating PnL Marker attached to current candle */}
                  <circle cx="405" cy="48" r="4" fill="#10b981" />
                  <circle cx="405" cy="48" r="8" fill="#10b981" opacity="0.3" />
                  <rect x="420" y="38" width="105" height="20" fill="#047857" rx="5" filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.5))" />
                  <text x="428" y="52" fill="#ffffff" fontSize="9" fontFamily="monospace" fontWeight="bold">
                    +$1,420.00 PnL
                  </text>

                  {/* 3. Entry Price Level (Blue Solid) */}
                  <line x1="140" y1="150" x2="480" y2="150" stroke="#3b82f6" strokeWidth="1.5" />
                  <rect x="145" y="141" width="145" height="18" fill="#1e3a8a" rx="4" />
                  <text x="152" y="153" fill="#93c5fd" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                    ENTRADA: 2x NQ @ 20,440.00
                  </text>

                  {/* 4. Stop Loss Level (Red Dashed) */}
                  <line x1="140" y1="185" x2="480" y2="185" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4 4" />
                  <rect x="145" y="176" width="145" height="18" fill="#881337" rx="4" />
                  <text x="152" y="188" fill="#fda4af" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                    SL: 20,415.00 (-25.0 pts · -$1,000)
                  </text>
                </svg>
              </div>

              {/* Order Telemetry Strip */}
              <div className="grid grid-cols-3 gap-2.5 mt-3 pt-3 border-t border-white/[0.08]">
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] uppercase font-mono text-zinc-400 block tracking-wider">
                    Ratio Beneficio / Riesgo
                  </span>
                  <span className="text-base font-bold font-mono text-emerald-400 mt-0.5 flex items-center gap-1.5">
                    <Target className="h-4 w-4 text-emerald-400" />
                    1 : 2.0 (Objetivo $2K)
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] uppercase font-mono text-zinc-400 block tracking-wider">
                    Regla de Consistencia
                  </span>
                  <span className="text-base font-bold font-mono text-blue-400 mt-0.5 flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-blue-400" />
                    21.4% (Límite 30%)
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] uppercase font-mono text-zinc-400 block tracking-wider">
                    Drawdown Trailing
                  </span>
                  <span className="text-base font-bold font-mono text-amber-400 mt-0.5 flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-amber-400" />
                    Bloqueado $50K
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Institutional Features Row under Chart */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <Activity className="h-4 w-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-white block">Multi-Firma</span>
                <span className="text-[10px] text-zinc-400 block">Sincronización simultánea</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Zap className="h-4 w-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-white block">Tradovate Bridge</span>
                <span className="text-[10px] text-zinc-400 block">Copia a baja latencia</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-white block">Anti-Quiebre</span>
                <span className="text-[10px] text-zinc-400 block">Protección activa de saldo</span>
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
