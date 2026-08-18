import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatTransactionDate(date: string): string {
  return format(parseISO(date), "dd 'de' MMM", { locale: ptBR });
}

export function formatMonthPeriod(period: string): string {
  return format(parseISO(`${period}-01`), 'MMM', { locale: ptBR }).replace('.', '');
}