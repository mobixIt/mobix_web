export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatPercentOfTotal(value: number): string {
  return `${value.toFixed(1)}% del total`;
}
