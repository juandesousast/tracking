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
import { menuItems, supportItems } from "./sidebar";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

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
    if (pathname === "/empresas") return "Empresas de Fondeo";
    if (pathname === "/cuentas") return "Cuentas";
    if (pathname === "/gastos") return "Gastos";
    if (pathname === "/retiros") return "Retiros";
    if (pathname === "/copier") return "Copiador de Operaciones";
    if (pathname === "/settings") return "Ajustes";
    if (pathname === "/support") return "Soporte";
    return "Dashboard";
  };

  return (
    <header className="sticky top-0 z-20 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
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
                <SheetTitle className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-base text-slate-900 dark:text-white">PropFirm Tracker</span>
                </SheetTitle>
              </SheetHeader>
              <div className="px-3 py-4 space-y-6 overflow-y-auto">
                <div>
                  <h3 className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-2">
                    MENU
                  </h3>
                  <nav className="space-y-1">
                    {menuItems.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
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
                <div>
                  <h3 className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-2">
                    SUPPORT
                  </h3>
                  <nav className="space-y-1">
                    {supportItems.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
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
              </div>
            </SheetContent>
          </Sheet>

          <span className="font-semibold text-base tracking-tight flex items-center gap-2 text-slate-900 dark:text-white">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            PropFirm Tracker
          </span>
        </div>

        {/* Desktop Breadcrumbs */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-medium">
          <span>PropFirm Tracker</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" />
          <span className="text-slate-700 dark:text-slate-300 font-semibold">{getPageTitle()}</span>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3">

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
