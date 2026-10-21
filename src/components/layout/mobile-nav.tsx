"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Wallet,
  Activity,
  Calculator,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Calendario", href: "/calendario", icon: Calendar },
  { name: "Cuentas", href: "/cuentas", icon: Wallet },
  { name: "Simulador", href: "/simulador", icon: Activity },
  { name: "Herramientas", href: "/tools", icon: Calculator },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-md border-t border-border/60 pb-safe">
      <div className="flex items-center justify-around h-16 px-1">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-blue-600 dark:text-blue-400 font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4 mb-1", isActive ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground")} />
              <span className="truncate max-w-[64px] text-center">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
