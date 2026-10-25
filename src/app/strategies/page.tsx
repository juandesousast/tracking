"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StrategiesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/simulador");
  }, [router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center text-xs text-muted-foreground font-mono">
      Redirigiendo al Simulador de Mercado...
    </div>
  );
}
