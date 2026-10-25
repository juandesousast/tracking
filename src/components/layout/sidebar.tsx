"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
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
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#090a0f] h-screen sticky top-0 z-30 shadow-xs">
      {/* Brand Header */}
      <div className="flex items-center px-6 h-16 shrink-0 border-b border-slate-200/80 dark:border-white/[0.08]">
        <BrandLogo size="md" />
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
                        ? "bg-blue-50/90 text-blue-700 font-semibold border border-blue-200/60 dark:border-transparent dark:bg-white/[0.08] dark:text-white shadow-2xs dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                        : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive
                          ? "text-blue-600 dark:text-white"
                          : "text-slate-400 dark:text-zinc-500"
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
      <div className="p-3 m-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] text-xs">
        <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-zinc-200">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-semibold">Sistema Conectado</span>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
          Cuentas y flujos protegidos por RLS
        </p>
      </div>
    </aside>
  );
}
