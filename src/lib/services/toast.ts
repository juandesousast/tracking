"use client";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

// Simple pub/sub listeners for zero-dependency toast emitter
type ToastListener = (toasts: ToastItem[]) => void;

let toastsList: ToastItem[] = [];
const listeners = new Set<ToastListener>();

function notify() {
  listeners.forEach((l) => l([...toastsList]));
}

export function subscribeToasts(listener: ToastListener): () => void {
  listeners.add(listener);
  listener([...toastsList]);
  return () => {
    listeners.delete(listener);
  };
}

export const toast = {
  show: (type: ToastType, title: string, description?: string, duration: number = 3800) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newToast: ToastItem = { id, type, title, description, duration };
    toastsList = [...toastsList, newToast];
    notify();

    if (duration > 0) {
      setTimeout(() => {
        toast.dismiss(id);
      }, duration);
    }
    return id;
  },
  success: (title: string, description?: string, duration?: number) =>
    toast.show("success", title, description, duration),
  error: (title: string, description?: string, duration?: number) =>
    toast.show("error", title, description, duration),
  info: (title: string, description?: string, duration?: number) =>
    toast.show("info", title, description, duration),
  warning: (title: string, description?: string, duration?: number) =>
    toast.show("warning", title, description, duration),
  dismiss: (id: string) => {
    toastsList = toastsList.filter((t) => t.id !== id);
    notify();
  },
};
