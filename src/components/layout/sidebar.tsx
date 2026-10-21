"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  Wallet,
  Receipt,
  ArrowDownToLine,
  Settings,
  TrendingUp,
  HelpCircle,
  ShieldCheck,
  Building2,
  Repeat,
  BarChart3,
  ListOrdered,
  Activity,
  Calculator,
  ShieldAlert,
  Target,
  PieChart,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const navSections = [
  {
    title: "TRADING & RENDIMIENTO",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Calendario PnL", href: "/calendario", icon: Calendar },
      { name: "Calendario Económico", href: "/calendario-economico", icon: CalendarDays },
      { name: "Simulador de Mercado", href: "/simulador", icon: Activity },
      { name: "Playbook & Estrategias", href: "/strategies", icon: BookOpen },
      { name: "Calculadoras & Fondeo", href: "/tools", icon: Calculator },
      { name: "Historial de Trades", href: "/trades", icon: ListOrdered },
      { name: "Analítica & Equity", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "PROP FIRMS & CAPITAL",
    items: [
      { name: "Radar de Portafolio", href: "/portfolio", icon: PieChart },
      { name: "Progreso a Fondeo", href: "/progress-tracker", icon: Target },
      { name: "Cuentas de Fondeo", href: "/cuentas", icon: Wallet },
      { name: "Exámenes & Gastos", href: "/gastos", icon: Receipt },
      { name: "Retiros & Cobros", href: "/retiros", icon: ArrowDownToLine },
      { name: "Empresas & Logos", href: "/empresas", icon: Building2 },
    ],
  },
  {
    title: "AUTOMATIZACIÓN & RIESGO",
    items: [
      { name: "Copiador de Futuros", href: "/copier", icon: Repeat },
      { name: "Gestión de Riesgo", href: "/risk-config", icon: ShieldAlert },
    ],
  },
  {
    title: "SISTEMA",
    items: [
      { name: "Ajustes", href: "/settings", icon: Settings },
      { name: "Soporte", href: "/support", icon: HelpCircle },
    ],
  },
];

// Flat export for compatibility with header and mobile-nav
export const navigationItems = navSections.flatMap((s) => s.items);
export const menuItems = navSections[0].items.concat(navSections[1].items, navSections[2].items);
export const supportItems = navSections[3].items;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 h-screen sticky top-0 z-30 shadow-xs">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-16 shrink-0 border-b border-slate-200/80 dark:border-slate-800">
        <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold tracking-tight text-sm text-slate-900 dark:text-white">
            PropFirm Tracker
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
            Suite Institucional Pro
          </span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 px-3 py-5 space-y-6 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.title}>
            <h3 className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-2">
              {section.title}
            </h3>
            <nav className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer",
                      isActive
                        ? "bg-blue-600/10 text-blue-600 font-semibold dark:bg-blue-500/15 dark:text-blue-400 ring-1 ring-blue-600/20 dark:ring-blue-400/20 shadow-2xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-slate-400 dark:text-slate-500"
                      )}
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer Status Badge */}
      <div className="p-3.5 m-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white mb-0.5">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-[11px]">Sistema Sincronizado</span>
        </div>
        <p className="text-[10px] leading-tight text-slate-400 dark:text-slate-500">
          Cuentas y flujo protegidos con RLS.
        </p>
      </div>
    </aside>
  );
}
