export function formatCurrency(amount: number, currency = 'EUR'): string {
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : Number(amount) || 0;
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);
}

export function formatPercent(value: number): string {
  const safeValue = typeof value === 'number' && !isNaN(value) ? value : Number(value) || 0;
  return new Intl.NumberFormat('es-ES', {
    style: 'percent',
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeValue / 100);
}

export function formatNumber(amount: number): string {
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : Number(amount) || 0;
  return new Intl.NumberFormat('es-ES', { useGrouping: true }).format(safeAmount);
}


