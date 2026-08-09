"use client";

import { useState, useRef } from "react";
import { Camera, Loader2, Sparkles, Upload, FileText, AlertCircle } from "lucide-react";
import { scanReceiptAction, ScannedReceiptResult } from "@/lib/actions/scan-receipt";

interface ReceiptScannerProps {
  onScanComplete: (data: ScannedReceiptResult) => void;
}

export function ReceiptScanner({ onScanComplete }: ReceiptScannerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setError(null);
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "application/pdf"];

    if (!validTypes.includes(file.type)) {
      setError("Formato no soportado. Por favor sube PNG, JPG, WEBP o PDF.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("El archivo excede los 10MB máximos permitidos.");
      return;
    }

    setIsAnalyzing(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const fullBase64 = reader.result as string;
        // Strip data URL header (e.g. data:image/png;base64,) to send pure base64 string
        const base64Data = fullBase64.includes(",") ? fullBase64.split(",")[1] : fullBase64;
        const result = await scanReceiptAction({ base64Data, mimeType: file.type });

        if (result.success && result.data) {
          onScanComplete(result.data);
        } else {
          setError(result.error || "No se pudo procesar el comprobante.");
        }
        setIsAnalyzing(false);
      };

      reader.onerror = () => {
        setError("Error al leer el archivo seleccionado.");
        setIsAnalyzing(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err?.message || "Ocurrió un error al procesar el archivo.");
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <div className="w-full mb-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
        className="hidden"
      />

      <div
        onClick={() => !isAnalyzing && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
          isDragOver
            ? "border-primary bg-primary/10 scale-[1.01]"
            : "border-border hover:border-primary/50 hover:bg-muted/40"
        } ${isAnalyzing ? "pointer-events-none opacity-80" : ""}`}
      >
        {isAnalyzing ? (
          <div className="flex flex-col items-center py-2 space-y-2">
            <div className="relative">
              <Loader2 className="h-7 w-7 text-primary animate-spin" />
              <Sparkles className="h-3.5 w-3.5 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <p className="text-xs font-medium text-muted-foreground animate-pulse text-center">
              Analizando comprobante con IA Gemini...
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Camera className="h-5 w-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                📷 Auto-completar con IA
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  Gemini
                </span>
              </span>
              <span className="text-[11px] text-muted-foreground">
                Sube o arrastra PNG, JPG, WEBP o PDF para extraer datos automáticamente
              </span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2 font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
