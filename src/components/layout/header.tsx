"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  TrendingUp,
  User,
  Bell,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { navSections } from "./sidebar";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandLogo } from "@/components/brand-logo";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setUserEmail(user.email);
      }
    });
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const initials = userEmail
    ? userEmail.substring(0, 2).toUpperCase()
    : "PF";

  // Derive breadcrumb section name
  const getPageTitle = () => {
    if (pathname === "/") return "Dashboard";
    if (pathname === "/calendario") return "Calendario PnL";
    if (pathname === "/calendario-economico") return "Calendario Económico";
    if (pathname === "/simulador" || pathname.startsWith("/simulador/")) return "Simulador de Mercado";
    if (pathname === "/strategies") return "Playbook de Estrategias";
    if (pathname === "/tools") return "Calculadoras & Fondeo";
    if (pathname === "/trades") return "Historial de Trades";
    if (pathname === "/analytics") return "Analítica & Equity";
    if (pathname === "/portfolio") return "Radar de Portafolio";
    if (pathname === "/progress-tracker") return "Progreso a Fondeo";
    if (pathname === "/cuentas") return "Cuentas de Fondeo";
    if (pathname === "/gastos") return "Exámenes & Gastos";
    if (pathname === "/retiros") return "Retiros & Cobros";
    if (pathname === "/empresas") return "Empresas & Logos";
    if (pathname === "/copier") return "Copiador de Operaciones";
    if (pathname === "/risk-config") return "Gestión de Riesgo";
    if (pathname === "/settings") return "Ajustes";
    if (pathname === "/support") return "Soporte";
    return "Dashboard";
  };

  return (
    <header className="sticky top-0 z-20 w-full border-b border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#090a0f]/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        {/* Mobile menu trigger & Mobile title */}
        <div className="flex items-center gap-3 md:hidden">
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="h-9 w-9 text-slate-600 dark:text-slate-300" />}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menú</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800">
              <SheetHeader className="p-5 border-b border-slate-200/80 dark:border-slate-800 text-left">
                <SheetTitle>
                  <BrandLogo size="md" />
                </SheetTitle>
              </SheetHeader>
              <div className="px-3 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-5rem)]">
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
                              "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all",
                              isActive
                                ? "bg-blue-50 text-blue-600 font-semibold dark:bg-blue-950/40 dark:text-blue-400"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            {item.name}
                          </Link>
                        );
                      })}
                    </nav>
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <BrandLogo size="sm" showSubtitle={false} />
        </div>

        {/* Desktop Breadcrumbs */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-medium">
          <span>PropFirm Tracker</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" />
          <span className="text-slate-700 dark:text-slate-300 font-semibold">{getPageTitle()}</span>
        </div>

        {/* User Profile & Controls */}
        <div className="flex items-center gap-2">
          {/* Theme Mode Toggle */}
          <ThemeToggle />

          {/* Notifications button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notificaciones</span>
          </Button>

          {/* User Profile Avatar */}
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 ring-2 ring-blue-600/20" />}>
              <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-800">
                <AvatarImage src="" alt="Usuario" />
                <AvatarFallback className="bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none text-slate-900 dark:text-white">Mi Cuenta</p>
                  <p className="text-xs leading-none text-slate-500 dark:text-slate-400 truncate">
                    {userEmail || "trader@propfirm.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />
              <DropdownMenuItem className="cursor-pointer text-xs">
                <User className="mr-2 h-4 w-4 text-slate-500" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-rose-600 dark:text-rose-400 focus:text-rose-600 cursor-pointer text-xs"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
