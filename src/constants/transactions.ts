import type {
  PaymentMethod,
  PaymentModality,
  TransactionType,
} from '@/src/db/schema';

export interface SelectOption<T extends string = string> {
  label: string;
  value: T;
}

export const categories: Record<TransactionType, SelectOption[]> = {
  expense: [
    { label: 'Alimentação', value: 'food' },
    { label: 'Moradia', value: 'housing' },
    { label: 'Transporte', value: 'transport' },
    { label: 'Saúde', value: 'health' },
    { label: 'Educação', value: 'education' },
    { label: 'Lazer', value: 'leisure' },
    { label: 'Outros', value: 'other-expense' },
  ],
  income: [
    { label: 'Salário', value: 'salary' },
    { label: 'Freelance', value: 'freelance' },
    { label: 'Investimentos', value: 'investments' },
    { label: 'Presente', value: 'gift' },
    { label: 'Outros', value: 'other-income' },
  ],
};

export const paymentMethods: SelectOption<PaymentMethod>[] = [
  { label: 'Cartão', value: 'card' },
  { label: 'Dinheiro', value: 'cash' },
  { label: 'Pix', value: 'pix' },
];

export const paymentModalities: SelectOption<PaymentModality>[] = [
  { label: 'Débito', value: 'debit' },
  { label: 'Crédito', value: 'credit' },
];

export const cards: SelectOption[] = [
  { label: 'Nubank •••• 4821', value: 'nubank-4821' },
  { label: 'Itaú •••• 7310', value: 'itau-7310' },
  { label: 'Inter •••• 2056', value: 'inter-2056' },
];

export function getCategoryLabel(type: TransactionType, value: string): string {
  return categories[type].find((category) => category.value === value)?.label ?? value;
}

export function getCategoryValue(type: TransactionType, label: string): string {
  return categories[type].find((category) => category.label === label)?.value ?? label;
}

export function getOptionLabel(options: SelectOption[], value?: string | null): string {
  if (!value) {
    return 'Não informado';
  }

  return options.find((option) => option.value === value)?.label ?? value;
}