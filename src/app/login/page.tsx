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
  ArrowUpRight,
  Check,
  DollarSign,
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

  // Live Trading Simulation State
  const [livePrice, setLivePrice] = useState(20486.25);
  const [livePnl, setLivePnl] = useState(1460);
  const [priceChange, setPriceChange] = useState("+146.00 (+0.72%)");

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

  // Gentle live market price oscillations (0.25 pt ticks)
  useEffect(() => {
    const entryPrice = 20440.0;
    const interval = setInterval(() => {
      setLivePrice((prev) => {
        const delta = (Math.random() - 0.45) * 1.5;
        const nextPrice = Number((prev + delta).toFixed(2));
        const pts = nextPrice - entryPrice;
        const currentPnl = Math.round(pts * 40); // 2 contracts NQ ($40/pt)
        setLivePnl(currentPnl);
        const changePts = (nextPrice - 20340.0).toFixed(2);
        const changePct = ((Number(changePts) / 20340.0) * 100).toFixed(2);
        setPriceChange(`+${changePts} (+${changePct}%)`);
        return nextPrice;
      });
    }, 1300);

    return () => clearInterval(interval);
  }, []);

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
          LEFT COLUMN: Authentication Form (40% - 44%)
          Clean, distraction-free, fully responsive in Light & Dark
          ======================================================== */}
      <div className="w-full lg:w-[46%] xl:w-[40%] min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-14 relative z-20 bg-white dark:bg-[#090b11] border-r border-slate-200/80 dark:border-white/[0.06] transition-colors duration-300">
        {/* Top Header */}
        <div className="flex items-center justify-between w-full">
          <Link href="/" className="transition-opacity hover:opacity-85">
            <BrandLogo size="md" />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>

        {/* Center: Auth Form */}
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
          RIGHT COLUMN: Dynamic Fluid Trading Showcase (54% - 60%)
          Seamless, borderless, organic trading animation with
          distributed floating metric cards in Light & Dark Mode
          ======================================================== */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-8 xl:p-12 relative overflow-hidden select-none bg-gradient-to-br from-slate-100/90 via-slate-50 to-blue-50/40 dark:from-[#06080e] dark:via-[#090c16] dark:to-[#04060a] text-slate-900 dark:text-white transition-colors duration-300">
        {/* Ambient Glows adapting to Dark & Light */}
        <div className="absolute top-1/4 -right-20 w-[600px] h-[500px] bg-blue-500/[0.08] dark:bg-blue-600/[0.12] rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute -bottom-20 left-10 w-[500px] h-[400px] bg-cyan-400/[0.08] dark:bg-cyan-500/[0.08] rounded-full blur-[110px] pointer-events-none" />

        {/* Subtle Geometric Matrix */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1.5px 1.5px, currentColor 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />

        {/* Top Ticker Bar */}
        <div className="flex items-center justify-between w-full relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/10 shadow-sm backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                MERCADOS EN VIVO
              </span>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.08] text-xs font-mono shadow-2xs backdrop-blur-sm">
              <span className="font-bold text-slate-900 dark:text-white">NQ FUTURES 5M</span>
              <span className="text-slate-300 dark:text-zinc-600">·</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
                ${livePrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-emerald-600/90 dark:text-emerald-400/90 tabular-nums font-semibold">
                {priceChange}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>LATENCIA: 11ms</span>
          </div>
        </div>

        {/* Center: Open Fluid Trading Space with Distributed Floating Cards */}
        <div className="my-auto relative z-10 w-full max-w-2xl mx-auto py-6">
          {/* Top Distributed Row: 2 Floating Cards */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Floating Card 1: Live Trade Execution */}
            <div className="p-4 rounded-2xl bg-white/85 dark:bg-[#0c101c]/85 border border-slate-200/90 dark:border-white/[0.08] shadow-lg shadow-slate-900/5 dark:shadow-black/50 backdrop-blur-xl transition-transform hover:-translate-y-0.5 duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-bold">
                  Operación en Curso
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  LONG 2 CT
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                    +{livePnl >= 0 ? `$${livePnl.toLocaleString()}` : `-$${Math.abs(livePnl).toLocaleString()}`}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500 block font-mono mt-0.5">
                    Entrada: 20,440.00 · Target: 20,540.00
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                    R:R 1:2.0
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-semibold">
                    73% al TP
                  </span>
                </div>
              </div>
            </div>

            {/* Floating Card 2: Payout & Retiro Aprobado */}
            <div className="p-4 rounded-2xl bg-white/85 dark:bg-[#0c101c]/85 border border-slate-200/90 dark:border-white/[0.08] shadow-lg shadow-slate-900/5 dark:shadow-black/50 backdrop-blur-xl transition-transform hover:-translate-y-0.5 duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-bold">
                  Último Retiro Aprobado
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30 flex items-center gap-1">
                  <Check className="h-3 w-3" /> Payout
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
                    $3,450.00
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500 block truncate mt-0.5 font-medium">
                    Apex 50K #8410 · Transferencia OK
                  </span>
                </div>
                <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Wallet className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Chart Graphic: Fluid borderless wave with live order overlays */}
          <div className="relative rounded-3xl p-5 bg-white/70 dark:bg-[#080b14]/75 border border-slate-200/80 dark:border-white/[0.08] shadow-xl shadow-slate-900/5 dark:shadow-black/60 backdrop-blur-xl overflow-hidden">
            {/* Chart Canvas */}
            <div className="relative w-full h-[220px]">
              <svg className="w-full h-full" viewBox="0 0 540 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  {/* Fluid Area Gradient under the wave */}
                  <linearGradient id="fluidWaveArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
                    <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>

                  <linearGradient id="waveStroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="45%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>

                  <linearGradient id="demandZone" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.16" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.03" />
                  </linearGradient>
                </defs>

                {/* Horizontal Level Guides */}
                <line x1="0" y1="30" x2="540" y2="30" stroke="currentColor" strokeOpacity="0.07" strokeDasharray="4 4" />
                <line x1="0" y1="80" x2="540" y2="80" stroke="currentColor" strokeOpacity="0.07" strokeDasharray="4 4" />
                <line x1="0" y1="130" x2="540" y2="130" stroke="currentColor" strokeOpacity="0.07" strokeDasharray="4 4" />
                <line x1="0" y1="180" x2="540" y2="180" stroke="currentColor" strokeOpacity="0.07" strokeDasharray="4 4" />

                {/* Right Scale */}
                <text x="495" y="34" fill="#94a3b8" fontSize="9" fontFamily="monospace">20,540</text>
                <text x="495" y="84" fill="#94a3b8" fontSize="9" fontFamily="monospace">20,490</text>
                <text x="495" y="134" fill="#94a3b8" fontSize="9" fontFamily="monospace">20,440</text>
                <text x="495" y="184" fill="#94a3b8" fontSize="9" fontFamily="monospace">20,390</text>

                {/* Demand Support Zone */}
                <rect x="70" y="125" width="125" height="32" fill="url(#demandZone)" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 3" rx="5" />
                <text x="76" y="138" fill="#3b82f6" fontSize="8" fontFamily="monospace" fontWeight="bold">DEMAND ZONE (5M)</text>

                {/* Volume Profile Bars at Bottom */}
                <rect x="25" y="200" width="7" height="12" fill="rgba(244,63,94,0.3)" rx="1.5" />
                <rect x="55" y="194" width="7" height="18" fill="rgba(244,63,94,0.4)" rx="1.5" />
                <rect x="85" y="188" width="7" height="24" fill="rgba(16,185,129,0.5)" rx="1.5" />
                <rect x="115" y="192" width="7" height="20" fill="rgba(16,185,129,0.4)" rx="1.5" />
                <rect x="145" y="184" width="7" height="28" fill="rgba(16,185,129,0.7)" rx="1.5" />
                <rect x="175" y="190" width="7" height="22" fill="rgba(16,185,129,0.5)" rx="1.5" />
                <rect x="205" y="196" width="7" height="16" fill="rgba(244,63,94,0.3)" rx="1.5" />
                <rect x="235" y="186" width="7" height="26" fill="rgba(16,185,129,0.6)" rx="1.5" />
                <rect x="265" y="182" width="7" height="30" fill="rgba(16,185,129,0.7)" rx="1.5" />
                <rect x="295" y="194" width="7" height="18" fill="rgba(244,63,94,0.3)" rx="1.5" />
                <rect x="325" y="180" width="7" height="32" fill="rgba(16,185,129,0.7)" rx="1.5" />
                <rect x="355" y="174" width="7" height="38" fill="rgba(16,185,129,0.8)" rx="1.5" />
                <rect x="385" y="170" width="7" height="42" fill="rgba(16,185,129,0.9)" rx="1.5" />
                <rect x="415" y="178" width="7" height="34" fill="rgba(16,185,129,0.6)" rx="1.5" />

                {/* Candlestick Bars (Natural trading rhythm) */}
                {/* 1 */}
                <line x1="28" y1="85" x2="28" y2="125" stroke="#f43f5e" strokeWidth="1" />
                <rect x="23" y="93" width="10" height="22" fill="#f43f5e" rx="1.5" />
                {/* 2 */}
                <line x1="58" y1="105" x2="58" y2="148" stroke="#f43f5e" strokeWidth="1" />
                <rect x="53" y="112" width="10" height="26" fill="#f43f5e" rx="1.5" />
                {/* 3: Pinbar at demand */}
                <line x1="88" y1="125" x2="88" y2="162" stroke="#10b981" strokeWidth="1" />
                <rect x="83" y="132" width="10" height="15" fill="#10b981" rx="1.5" />
                {/* 4 */}
                <line x1="118" y1="120" x2="118" y2="152" stroke="#10b981" strokeWidth="1" />
                <rect x="113" y="125" width="10" height="19" fill="#10b981" rx="1.5" />
                {/* 5: Breakout impulse */}
                <line x1="148" y1="102" x2="148" y2="145" stroke="#10b981" strokeWidth="1.2" />
                <rect x="143" y="108" width="10" height="30" fill="#10b981" rx="1.5" />
                {/* 6 */}
                <line x1="178" y1="90" x2="178" y2="125" stroke="#10b981" strokeWidth="1" />
                <rect x="173" y="96" width="10" height="22" fill="#10b981" rx="1.5" />
                {/* 7 */}
                <line x1="208" y1="95" x2="208" y2="128" stroke="#f43f5e" strokeWidth="1" />
                <rect x="203" y="100" width="10" height="16" fill="#f43f5e" rx="1.5" />
                {/* 8 */}
                <line x1="238" y1="84" x2="238" y2="118" stroke="#10b981" strokeWidth="1" />
                <rect x="233" y="89" width="10" height="22" fill="#10b981" rx="1.5" />
                {/* 9 */}
                <line x1="268" y1="74" x2="268" y2="108" stroke="#10b981" strokeWidth="1" />
                <rect x="263" y="78" width="10" height="24" fill="#10b981" rx="1.5" />
                {/* 10 */}
                <line x1="298" y1="72" x2="298" y2="104" stroke="#f43f5e" strokeWidth="1" />
                <rect x="293" y="76" width="10" height="15" fill="#f43f5e" rx="1.5" />
                {/* 11 */}
                <line x1="328" y1="58" x2="328" y2="95" stroke="#10b981" strokeWidth="1.2" />
                <rect x="323" y="64" width="10" height="24" fill="#10b981" rx="1.5" />
                {/* 12 */}
                <line x1="358" y1="54" x2="358" y2="88" stroke="#10b981" strokeWidth="1" />
                <rect x="353" y="58" width="10" height="20" fill="#10b981" rx="1.5" />
                {/* 13 */}
                <line x1="388" y1="44" x2="388" y2="78" stroke="#10b981" strokeWidth="1.2" />
                <rect x="383" y="48" width="10" height="24" fill="#10b981" rx="1.5" />
                {/* 14: ACTIVE PULSING CANDLE */}
                <line x1="418" y1="36" x2="418" y2="68" stroke="#10b981" strokeWidth="1.5" />
                <rect x="413" y="42" width="10" height="20" fill="#10b981" rx="1.5" className="animate-pulse" />

                {/* Fluid Spline Path over candles with gradient area */}
                <path
                  d="M 28 104 C 88 140, 118 135, 148 115 C 178 95, 238 90, 268 80 C 298 75, 358 60, 418 48"
                  fill="none"
                  stroke="url(#waveStroke)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                <path
                  d="M 28 104 C 88 140, 118 135, 148 115 C 178 95, 238 90, 268 80 C 298 75, 358 60, 418 48 L 418 200 L 28 200 Z"
                  fill="url(#fluidWaveArea)"
                />

                {/* Take Profit Target Line (Green Dashed) */}
                <line x1="140" y1="28" x2="480" y2="28" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 4" />
                <rect x="145" y="19" width="155" height="18" fill="#064e3b" rx="4" />
                <text x="152" y="31" fill="#34d399" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                  TP: 20,540.00 (+50.0 pts · +$2,000)
                </text>

                {/* Entry Price Line (Blue Solid) */}
                <line x1="140" y1="130" x2="480" y2="130" stroke="#3b82f6" strokeWidth="1.5" />
                <rect x="145" y="121" width="145" height="18" fill="#1e3a8a" rx="4" />
                <text x="152" y="133" fill="#93c5fd" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                  ENTRADA: 2x NQ @ 20,440.00
                </text>

                {/* Stop Loss Line (Red Dashed) */}
                <line x1="140" y1="168" x2="480" y2="168" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4 4" />
                <rect x="145" y="159" width="145" height="18" fill="#881337" rx="4" />
                <text x="152" y="171" fill="#fda4af" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                  SL: 20,415.00 (-25.0 pts · -$1,000)
                </text>

                {/* Live Floating Price Beacon */}
                <circle cx="418" cy="48" r="4" fill="#10b981" />
                <circle cx="418" cy="48" r="8" fill="#10b981" opacity="0.3" className="animate-ping" />
                <rect x="432" y="38" width="95" height="20" fill="#047857" rx="5" filter="drop-shadow(0px 3px 6px rgba(0,0,0,0.4))" />
                <text x="440" y="52" fill="#ffffff" fontSize="9" fontFamily="monospace" fontWeight="bold">
                  ${livePrice.toFixed(2)}
                </text>
              </svg>
            </div>
          </div>

          {/* Bottom Distributed Row: 2 Floating Cards */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            {/* Floating Card 3: Tradovate Copier */}
            <div className="p-4 rounded-2xl bg-white/85 dark:bg-[#0c101c]/85 border border-slate-200/90 dark:border-white/[0.08] shadow-lg shadow-slate-900/5 dark:shadow-black/50 backdrop-blur-xl transition-transform hover:-translate-y-0.5 duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-bold">
                  Copiador Tradovate API
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 font-mono">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  11ms Sync
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
                    4 Cuentas
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500 block truncate mt-0.5 font-medium">
                    Apex · Topstep · MFF (0 deslices)
                  </span>
                </div>
                <div className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Zap className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Floating Card 4: Drawdown & Consistencia */}
            <div className="p-4 rounded-2xl bg-white/85 dark:bg-[#0c101c]/85 border border-slate-200/90 dark:border-white/[0.08] shadow-lg shadow-slate-900/5 dark:shadow-black/50 backdrop-blur-xl transition-transform hover:-translate-y-0.5 duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-bold">
                  Control de Reglas Prop Firm
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30">
                  Elegible
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xl sm:text-2xl font-black font-mono text-blue-600 dark:text-blue-400 tabular-nums">
                    21.4%
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500 block truncate mt-0.5 font-medium">
                    Mejor día (Límite 30% Apex/Topstep)
                  </span>
                </div>
                <div className="h-8 w-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
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
