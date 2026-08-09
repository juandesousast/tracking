import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export { formatCurrency, formatPercent } from "./formatters"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

