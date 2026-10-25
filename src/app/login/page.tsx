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

  // Live Trading Simulation State for the Chart
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
        const delta = (Math.random() - 0.45) * 1.25; // slight upward drift
        const nextPrice = Number((prev + delta).toFixed(2));
        // Calculate PnL for 2 contracts of NQ ($20/pt per contract = $40/pt total)
        const pts = nextPrice - entryPrice;
        const currentPnl = Math.round(pts * 40);
        setLivePnl(currentPnl);
        const changePts = (nextPrice - 20340.0).toFixed(2);
        const changePct = ((Number(changePts) / 20340.0) * 100).toFixed(2);
        setPriceChange(`+${changePts} (+${changePct}%)`);
        return nextPrice;
      });
    }, 1400);

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
          LEFT COLUMN: The Authentication Console (42% - 46%)
          Clean, modern, distraction-free
          ======================================================== */}
      <div className="w-full lg:w-[48%] xl:w-[42%] min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-14 relative z-10 bg-white dark:bg-[#090b11] border-r border-slate-200/80 dark:border-white/[0.06]">
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
          RIGHT COLUMN: Immersive Fluid Trading Chart (54% - 58%)
          Live Candlestick Stream, Trade Execution Overlay & Telemetry
          ======================================================== */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-8 xl:p-12 bg-gradient-to-br from-[#06080e] via-[#080b15] to-[#04060a] relative overflow-hidden text-white select-none">
        {/* Ambient Organic Atmosphere Glows */}
        <div className="absolute top-1/4 -right-20 w-[600px] h-[500px] bg-blue-600/[0.12] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-20 left-10 w-[500px] h-[400px] bg-cyan-500/[0.08] rounded-full blur-[100px] pointer-events-none" />

        {/* Modern Dot Matrix Texture */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1.5px 1.5px, #60a5fa 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />

        {/* Top Floating Telemetry Strip */}
        <div className="flex items-center justify-between w-full relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 backdrop-blur-md shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-mono font-semibold text-emerald-400 uppercase tracking-wider">
                MERCADOS EN VIVO
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-zinc-300">
              <span className="font-bold text-white">NQ FUTURES</span>
              <span className="text-zinc-500">·</span>
              <span className="text-emerald-400 font-bold tabular-nums">${livePrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              <span className="text-[10px] text-emerald-400/90 tabular-nums">{priceChange}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-zinc-300">LATENCIA: 11ms</span>
          </div>
        </div>

        {/* Center: Fluid Trading View with Live Order Execution */}
        <div className="my-auto space-y-5 relative z-10 w-full max-w-2xl mx-auto">
          {/* Main Chart Canvas Glass Container */}
          <div className="rounded-3xl border border-white/[0.10] bg-[#090d19]/80 backdrop-blur-2xl shadow-2xl shadow-black/80 overflow-hidden">
            {/* Chart Sub-header */}
            <div className="px-6 py-4 border-b border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold tracking-tight text-white font-mono">
                      NQ 100 E-MINI
                    </span>
                    <Badge variant="outline" className="border-blue-500/30 text-blue-400 font-mono text-[10px] px-1.5 py-0">
                      5 MIN
                    </Badge>
                  </div>
                  <span className="text-[10px] text-zinc-400 block font-mono">
                    Orden Ejecutada via Tradovate Bridge
                  </span>
                </div>
              </div>

              {/* Live Position Execution Badge */}
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-xs font-bold text-emerald-400 uppercase">
                    LONG 2 CT
                  </span>
                  <span className="text-[11px] font-mono font-bold text-white tabular-nums">
                    +{livePnl >= 0 ? `$${livePnl.toLocaleString()}` : `-$${Math.abs(livePnl).toLocaleString()}`}
                  </span>
                </div>
              </div>
            </div>

            {/* SVG Live Candlestick & Trade Structure */}
            <div className="p-6 relative bg-gradient-to-b from-[#070912]/80 to-[#06080f]/95">
              <div className="relative w-full h-[270px] overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 560 250" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    {/* Glowing profit gradient between entry and current price */}
                    <linearGradient id="profitZoneGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>

                    {/* Support & Demand Zone */}
                    <linearGradient id="demandZoneGlow" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.14" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.03" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid & Price Ticks */}
                  <line x1="0" y1="35" x2="560" y2="35" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                  <line x1="0" y1="90" x2="560" y2="90" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                  <line x1="0" y1="145" x2="560" y2="145" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                  <line x1="0" y1="200" x2="560" y2="200" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />

                  {/* Price Scale Text on Right */}
                  <text x="512" y="38" fill="#64748b" fontSize="9" fontFamily="monospace">20,540</text>
                  <text x="512" y="93" fill="#64748b" fontSize="9" fontFamily="monospace">20,490</text>
                  <text x="512" y="148" fill="#64748b" fontSize="9" fontFamily="monospace">20,440</text>
                  <text x="512" y="203" fill="#64748b" fontSize="9" fontFamily="monospace">20,390</text>

                  {/* Demand Order Block Zone */}
                  <rect x="75" y="135" width="135" height="38" fill="url(#demandZoneGlow)" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 3" rx="6" />
                  <text x="82" y="148" fill="#60a5fa" fontSize="8" fontFamily="monospace" fontWeight="bold">DEMAND OB 5M</text>

                  {/* Profit Area Shading between Entry and Current Level */}
                  <rect x="155" y="55" width="280" height="90" fill="url(#profitZoneGlow)" rx="4" />

                  {/* Volume Profile Bars at Bottom */}
                  <rect x="25" y="228" width="6" height="12" fill="rgba(244,63,94,0.3)" rx="1" />
                  <rect x="50" y="222" width="6" height="18" fill="rgba(244,63,94,0.4)" rx="1" />
                  <rect x="75" y="215" width="6" height="25" fill="rgba(16,185,129,0.5)" rx="1" />
                  <rect x="100" y="220" width="6" height="20" fill="rgba(16,185,129,0.4)" rx="1" />
                  <rect x="125" y="226" width="6" height="14" fill="rgba(244,63,94,0.3)" rx="1" />
                  <rect x="150" y="210" width="6" height="30" fill="rgba(16,185,129,0.7)" rx="1" />
                  <rect x="175" y="216" width="6" height="24" fill="rgba(16,185,129,0.5)" rx="1" />
                  <rect x="200" y="224" width="6" height="16" fill="rgba(244,63,94,0.3)" rx="1" />
                  <rect x="225" y="218" width="6" height="22" fill="rgba(16,185,129,0.5)" rx="1" />
                  <rect x="250" y="214" width="6" height="26" fill="rgba(16,185,129,0.6)" rx="1" />
                  <rect x="275" y="226" width="6" height="14" fill="rgba(244,63,94,0.3)" rx="1" />
                  <rect x="300" y="208" width="6" height="32" fill="rgba(16,185,129,0.7)" rx="1" />
                  <rect x="325" y="218" width="6" height="22" fill="rgba(16,185,129,0.5)" rx="1" />
                  <rect x="350" y="224" width="6" height="16" fill="rgba(244,63,94,0.3)" rx="1" />
                  <rect x="375" y="205" width="6" height="35" fill="rgba(16,185,129,0.8)" rx="1" />
                  <rect x="400" y="200" width="6" height="40" fill="rgba(16,185,129,0.9)" rx="1" />
                  <rect x="425" y="212" width="6" height="28" fill="rgba(16,185,129,0.6)" rx="1" />

                  {/* Candlestick Wave (Smooth modern candles with thin precise wicks) */}
                  {/* C1: Red */}
                  <line x1="28" y1="85" x2="28" y2="130" stroke="#f43f5e" strokeWidth="1" />
                  <rect x="23" y="95" width="10" height="24" fill="#f43f5e" rx="1.5" />

                  {/* C2: Red */}
                  <line x1="53" y1="110" x2="53" y2="155" stroke="#f43f5e" strokeWidth="1" />
                  <rect x="48" y="118" width="10" height="28" fill="#f43f5e" rx="1.5" />

                  {/* C3: Rejection Pinbar at Demand */}
                  <line x1="78" y1="130" x2="78" y2="170" stroke="#10b981" strokeWidth="1" />
                  <rect x="73" y="138" width="10" height="14" fill="#10b981" rx="1.5" />

                  {/* C4: Green Accumulation */}
                  <line x1="103" y1="125" x2="103" y2="160" stroke="#10b981" strokeWidth="1" />
                  <rect x="98" y="130" width="10" height="20" fill="#10b981" rx="1.5" />

                  {/* C5: Small Red Doji */}
                  <line x1="128" y1="122" x2="128" y2="155" stroke="#f43f5e" strokeWidth="1" />
                  <rect x="123" y="130" width="10" height="12" fill="#f43f5e" rx="1.5" />

                  {/* C6: Strong Green Breakout (ENTRY) */}
                  <line x1="153" y1="105" x2="153" y2="150" stroke="#10b981" strokeWidth="1.2" />
                  <rect x="148" y="112" width="10" height="32" fill="#10b981" rx="1.5" />

                  {/* C7: Green Continuation */}
                  <line x1="178" y1="92" x2="178" y2="130" stroke="#10b981" strokeWidth="1" />
                  <rect x="173" y="100" width="10" height="24" fill="#10b981" rx="1.5" />

                  {/* C8: Pullback Doji */}
                  <line x1="203" y1="98" x2="203" y2="135" stroke="#f43f5e" strokeWidth="1" />
                  <rect x="198" y="104" width="10" height="18" fill="#f43f5e" rx="1.5" />

                  {/* C9: Green Bounce */}
                  <line x1="228" y1="88" x2="228" y2="125" stroke="#10b981" strokeWidth="1" />
                  <rect x="223" y="94" width="10" height="22" fill="#10b981" rx="1.5" />

                  {/* C10: Green Extension */}
                  <line x1="253" y1="78" x2="253" y2="115" stroke="#10b981" strokeWidth="1" />
                  <rect x="248" y="82" width="10" height="26" fill="#10b981" rx="1.5" />

                  {/* C11: Small Red pause */}
                  <line x1="278" y1="75" x2="278" y2="110" stroke="#f43f5e" strokeWidth="1" />
                  <rect x="273" y="80" width="10" height="16" fill="#f43f5e" rx="1.5" />

                  {/* C12: Strong Expansion Candle */}
                  <line x1="303" y1="62" x2="303" y2="100" stroke="#10b981" strokeWidth="1.2" />
                  <rect x="298" y="68" width="10" height="26" fill="#10b981" rx="1.5" />

                  {/* C13: Continuation Green */}
                  <line x1="328" y1="58" x2="328" y2="88" stroke="#10b981" strokeWidth="1" />
                  <rect x="323" y="62" width="10" height="18" fill="#10b981" rx="1.5" />

                  {/* C14: Small Pullback */}
                  <line x1="353" y1="60" x2="353" y2="94" stroke="#f43f5e" strokeWidth="1" />
                  <rect x="348" y="65" width="10" height="18" fill="#f43f5e" rx="1.5" />

                  {/* C15: Bullish Impulse */}
                  <line x1="378" y1="46" x2="378" y2="84" stroke="#10b981" strokeWidth="1.2" />
                  <rect x="373" y="52" width="10" height="26" fill="#10b981" rx="1.5" />

                  {/* C16: Pre-current Candle */}
                  <line x1="403" y1="42" x2="403" y2="76" stroke="#10b981" strokeWidth="1.2" />
                  <rect x="398" y="48" width="10" height="22" fill="#10b981" rx="1.5" />

                  {/* C17: LIVE ACTIVE PULSING CANDLE */}
                  <line x1="428" y1="38" x2="428" y2="72" stroke="#10b981" strokeWidth="1.5" />
                  <rect x="423" y="44" width="10" height="22" fill="#10b981" rx="1.5" className="animate-pulse" />

                  {/* ========================================================
                      ORDER LEVEL OVERLAYS (TP, CURRENT, ENTRY, SL)
                      ======================================================== */}

                  {/* 1. Take Profit Level (Green Dashed) */}
                  <line x1="145" y1="32" x2="500" y2="32" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 4" />
                  <rect x="150" y="23" width="155" height="18" fill="#064e3b" rx="4" />
                  <text x="158" y="35" fill="#34d399" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                    TP: 20,540.00 (+50.0 pts · +$2,000)
                  </text>

                  {/* 2. Live Price Line extending to right axis */}
                  <line x1="145" y1="52" x2="500" y2="52" stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" opacity="0.8" />
                  <rect x="445" y="42" width="95" height="20" fill="#047857" rx="5" filter="drop-shadow(0px 3px 6px rgba(0,0,0,0.6))" />
                  <text x="453" y="56" fill="#ffffff" fontSize="9" fontFamily="monospace" fontWeight="bold">
                    ${livePrice.toFixed(2)}
                  </text>

                  {/* 3. Entry Price Level (Blue Solid) */}
                  <line x1="145" y1="145" x2="500" y2="145" stroke="#3b82f6" strokeWidth="1.5" />
                  <rect x="150" y="136" width="150" height="18" fill="#1e3a8a" rx="4" />
                  <text x="158" y="148" fill="#93c5fd" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                    ENTRADA: 2x NQ @ 20,440.00
                  </text>

                  {/* 4. Stop Loss Level (Red Dashed) */}
                  <line x1="145" y1="180" x2="500" y2="180" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4 4" />
                  <rect x="150" y="171" width="150" height="18" fill="#881337" rx="4" />
                  <text x="158" y="183" fill="#fda4af" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                    SL: 20,415.00 (-25.0 pts · -$1,000)
                  </text>
                </svg>
              </div>

              {/* Live Metric Strip Under Chart */}
              <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-white/[0.08]">
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] uppercase font-mono text-zinc-400 block tracking-wider">
                    Ratio Riesgo / Beneficio
                  </span>
                  <span className="text-sm font-bold font-mono text-emerald-400 mt-1 flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-emerald-400" />
                    1 : 2.0 (Objetivo $2K)
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] uppercase font-mono text-zinc-400 block tracking-wider">
                    Regla de Consistencia
                  </span>
                  <span className="text-sm font-bold font-mono text-blue-400 mt-1 flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
                    21.4% (Límite &lt;30%)
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] uppercase font-mono text-zinc-400 block tracking-wider">
                    Colchón Drawdown
                  </span>
                  <span className="text-sm font-bold font-mono text-amber-400 mt-1 flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                    Bloqueado $50,000
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Value Prop Indicators Under Chart */}
          <div className="grid grid-cols-3 gap-4 pt-1">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <Activity className="h-4 w-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-white block">Multi-Firma</span>
                <span className="text-[10px] text-zinc-400 block">Apex, Topstep, MFF</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Zap className="h-4 w-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-white block">Copiador Tradovate</span>
                <span className="text-[10px] text-zinc-400 block">Copia a 11ms de latencia</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-white block">Anti-Quiebre</span>
                <span className="text-[10px] text-zinc-400 block">Vigilancia activa de saldo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Institutional Quote */}
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400 border-t border-white/[0.06] pt-5 relative z-10">
          <span>SUITE PROFESIONAL DE TRADING</span>
          <span>© {new Date().getFullYear()} PROPFIRM TRACKER</span>
        </div>
      </div>
    </div>
  );
}
