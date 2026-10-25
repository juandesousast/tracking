"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  LayoutDashboard,
  Wallet,
  ArrowDownToLine,
  Receipt,
  Calendar,
  Globe,
  Calculator,
  Play,
  Repeat,
  Target,
  PieChart,
  ShieldAlert,
  History,
  LineChart,
  Building2,
  Settings,
  HelpCircle,
  Sun,
  Moon,
  ArrowRight,
  Sparkles,
  Command,
} from "lucide-react";

interface CommandItem {
  id: string;
  category: "Navegación" | "Acciones Rápidas" | "Tema";
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  keywords?: string[];
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains("dark");
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  const navigateTo = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  const items: CommandItem[] = useMemo(
    () => [
      // Quick Actions
      {
        id: "act-withdrawal",
        category: "Acciones Rápidas",
        title: "Registrar Retiro de Ganancias",
        subtitle: "Añade un cobro recibido o pendiente",
        icon: ArrowDownToLine,
        action: () => navigateTo("/retiros"),
        keywords: ["payout", "cobro", "dinero", "banco", "ganancia"],
      },
      {
        id: "act-expense",
        category: "Acciones Rápidas",
        title: "Registrar Gasto o Escanear Recibo",
        subtitle: "Añadir examen, reset o tarifa con IA",
        icon: Receipt,
        action: () => navigateTo("/gastos"),
        keywords: ["factura", "recibo", "examen", "reset", "compra", "ia"],
      },
      {
        id: "act-account",
        category: "Acciones Rápidas",
        title: "Añadir Cuenta de Fondeo",
        subtitle: "Registra una cuenta de 25k, 50k, 100k, etc.",
        icon: Wallet,
        action: () => navigateTo("/cuentas"),
        keywords: ["nueva cuenta", "evaluacion", "funded", "master"],
      },
      {
        id: "act-sim",
        category: "Acciones Rápidas",
        title: "Nueva Sesión en el Simulador",
        subtitle: "Practica backtesting y replay de mercado",
        icon: Play,
        action: () => navigateTo("/simulador"),
        keywords: ["backtest", "simulador", "replay", "practica"],
      },
      // Navigation
      {
        id: "nav-dash",
        category: "Navegación",
        title: "Dashboard General",
        subtitle: "Pulso del día y métricas principales",
        icon: LayoutDashboard,
        action: () => navigateTo("/"),
        keywords: ["inicio", "home", "resumen"],
      },
      {
        id: "nav-cuentas",
        category: "Navegación",
        title: "Cuentas de Trading",
        subtitle: "Gestión de evaluaciones y cuentas fondeadas",
        icon: Wallet,
        action: () => navigateTo("/cuentas"),
        keywords: ["cuentas", "apex", "topstep", "myfundedfutures"],
      },
      {
        id: "nav-retiros",
        category: "Navegación",
        title: "Retiros & Cobros",
        subtitle: "Historial de payouts y comisiones",
        icon: ArrowDownToLine,
        action: () => navigateTo("/retiros"),
        keywords: ["payouts", "retiros", "ganancias"],
      },
      {
        id: "nav-gastos",
        category: "Navegación",
        title: "Exámenes & Gastos",
        subtitle: "Costes operativos y escáner de facturas",
        icon: Receipt,
        action: () => navigateTo("/gastos"),
        keywords: ["gastos", "evaluaciones", "recibos"],
      },
      {
        id: "nav-cal",
        category: "Navegación",
        title: "Calendario PnL",
        subtitle: "Vista mensual de días ganadores y perdedores",
        icon: Calendar,
        action: () => navigateTo("/calendario"),
        keywords: ["calendario", "dias", "mes", "journal"],
      },
      {
        id: "nav-econ",
        category: "Navegación",
        title: "Calendario Económico",
        subtitle: "Noticias macro de alto impacto (FOMC, CPI, NFP)",
        icon: Globe,
        action: () => navigateTo("/calendario-economico"),
        keywords: ["noticias", "cpi", "fomc", "nfp", "macro"],
      },
      {
        id: "nav-progress",
        category: "Navegación",
        title: "Progreso a Fondeo",
        subtitle: "Termómetro de target y simulador what-if",
        icon: Target,
        action: () => navigateTo("/progress-tracker"),
        keywords: ["objetivo", "fase", "evaluacion", "progreso"],
      },
      {
        id: "nav-copier",
        category: "Navegación",
        title: "Copiador de Operaciones",
        subtitle: "Tradovate Copier multi-cuenta y kill switch",
        icon: Repeat,
        action: () => navigateTo("/copier"),
        keywords: ["copiador", "copier", "tradovate", "esclavas"],
      },
      {
        id: "nav-risk",
        category: "Navegación",
        title: "Gestión de Riesgo",
        subtitle: "Límites de pérdida diaria y reglas por firma",
        icon: ShieldAlert,
        action: () => navigateTo("/risk-config"),
        keywords: ["riesgo", "stop", "drawdown", "reglas"],
      },
      {
        id: "nav-tools",
        category: "Navegación",
        title: "Calculadoras & Fondeo",
        subtitle: "Tamaño de contratos, drawdown y regla del 30%",
        icon: Calculator,
        action: () => navigateTo("/tools"),
        keywords: ["calculadora", "ticks", "lotes", "contratos"],
      },
      {
        id: "nav-radar",
        category: "Navegación",
        title: "Radar de Portafolio",
        subtitle: "Concentración de capital y riesgo agregado",
        icon: PieChart,
        action: () => navigateTo("/portfolio"),
        keywords: ["radar", "portafolio", "diversificacion"],
      },
      {
        id: "nav-analytics",
        category: "Navegación",
        title: "Analítica & Equity",
        subtitle: "Curvas de rendimiento y drawdown cuantitativo",
        icon: LineChart,
        action: () => navigateTo("/analytics"),
        keywords: ["analitica", "graficos", "equity", "drawdown"],
      },
      {
        id: "nav-trades",
        category: "Navegación",
        title: "Historial de Trades & Movimientos",
        subtitle: "Libro mayor y exportación a CSV",
        icon: History,
        action: () => navigateTo("/trades"),
        keywords: ["trades", "operaciones", "libro", "csv"],
      },
      {
        id: "nav-firms",
        category: "Navegación",
        title: "Empresas & Logos",
        subtitle: "Directorio de firmas de fondeo",
        icon: Building2,
        action: () => navigateTo("/empresas"),
        keywords: ["firmas", "prop firms", "logos"],
      },
      // Theme
      {
        id: "theme-toggle",
        category: "Tema",
        title: "Alternar Modo Claro / Oscuro",
        subtitle: "Cambia el tema visual de la plataforma",
        icon: Sun,
        action: () => {
          toggleTheme();
          setIsOpen(false);
        },
        keywords: ["tema", "dark", "light", "oscuro", "claro", "color"],
      },
    ],
    []
  );

  // Filtered items based on query
  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase().trim();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle?.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.keywords?.some((k) => k.toLowerCase().includes(q))
    );
  }, [items, query]);

  // Keyboard navigation inside the palette
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(filteredItems.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(filteredItems.length, 1));
    } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
      e.preventDefault();
      filteredItems[selectedIndex].action();
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-xs"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
              className="relative w-full max-w-xl rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-[#0c0d12]/95 backdrop-blur-xl shadow-2xl overflow-hidden z-10"
            >
              {/* Search Bar */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-white/[0.08]">
                <Search className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Escribe un comando o busca una herramienta (ej. retiros, sim, pnl)..."
                  className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                />
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-[10px] font-mono text-slate-400">
                  ESC
                </kbd>
              </div>

              {/* Items List */}
              <div className="max-h-80 overflow-y-auto p-2 space-y-1">
                {filteredItems.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 space-y-1">
                    <p className="font-semibold text-slate-600 dark:text-slate-300">
                      No se encontraron resultados
                    </p>
                    <p>Prueba buscando "cuentas", "retiros", "simulador" o "tema".</p>
                  </div>
                ) : (
                  filteredItems.map((item, idx) => {
                    const isSelected = selectedIndex === idx;
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.id}
                        role="button"
                        tabIndex={0}
                        onClick={item.action}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors text-xs select-none ${
                          isSelected
                            ? "bg-blue-50 dark:bg-white/[0.08] text-blue-700 dark:text-white font-semibold"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`p-1.5 rounded-lg shrink-0 ${
                              isSelected
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="truncate">
                            <p className="leading-tight truncate">{item.title}</p>
                            {item.subtitle && (
                              <p className="text-[10px] text-slate-400 truncate mt-0.5 font-normal">
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-[10px] text-slate-400 font-normal">
                            {item.category}
                          </span>
                          {isSelected && (
                            <ArrowRight className="h-3.5 w-3.5 text-blue-600 dark:text-white" />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded bg-slate-200/60 dark:bg-white/10 text-[9px] font-mono">
                      ↑↓
                    </kbd>{" "}
                    Navegar
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded bg-slate-200/60 dark:bg-white/10 text-[9px] font-mono">
                      ↵
                    </kbd>{" "}
                    Abrir
                  </span>
                </div>
                <span className="font-medium text-slate-500 dark:text-slate-400">
                  Paleta de Comandos
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
