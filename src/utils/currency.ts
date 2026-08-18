const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const compactCurrencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function formatCurrency(amountInCents: number): string {
  return currencyFormatter.format(amountInCents / 100);
}

export function formatCompactCurrency(amountInCents: number): string {
  return compactCurrencyFormatter.format(amountInCents / 100);
}