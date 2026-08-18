import { z } from 'zod';

import {
  paymentMethods,
  paymentModalities,
  transactionTypes,
} from '@/src/db/schema';

export const transactionFormSchema = z
  .object({
    type: z.enum(transactionTypes),
    title: z.string().trim().min(1, 'Informe o título'),
    description: z.string().trim(),
    amount: z
      .string()
      .min(1, 'Informe o valor')
      .refine((value) => Number(value) > 0, 'O valor deve ser maior que zero'),
    category: z.string().min(1, 'Selecione uma categoria'),
    transactionDate: z.date(),
    merchant: z.string().trim(),
    paymentMethod: z.enum(paymentMethods).optional(),
    cardId: z.string().optional(),
    paymentModality: z.enum(paymentModalities).optional(),
    invoiceDueDate: z.date().optional(),
    isRecurring: z.boolean(),
    installmentCount: z
      .string()
      .refine(
        (value) => Number.isInteger(Number(value)) && Number(value) >= 1,
        'Informe uma quantidade válida',
      )
      .refine((value) => Number(value) <= 60, 'O máximo é 60 parcelas'),
  })
  .superRefine((values, context) => {
    if (values.type === 'expense') {
      if (!values.paymentMethod) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Selecione a forma de pagamento',
          path: ['paymentMethod'],
        });
      }

      if (values.paymentMethod === 'card' && !values.cardId) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Selecione o cartão',
          path: ['cardId'],
        });
      }

      if (values.paymentMethod === 'card' && !values.paymentModality) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Selecione a modalidade',
          path: ['paymentModality'],
        });
      }

      if (
        values.paymentMethod === 'card' &&
        values.paymentModality === 'credit' &&
        !values.invoiceDueDate
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Informe o vencimento da fatura',
          path: ['invoiceDueDate'],
        });
      }
    }

    const installmentCount = Number(values.installmentCount);

    if (
      installmentCount > 1 &&
      (values.paymentMethod !== 'card' || values.paymentModality !== 'credit')
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Parcelamento exige cartão de crédito',
        path: ['installmentCount'],
      });
    }

    if (values.isRecurring && installmentCount > 1) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Uma despesa recorrente não pode ser parcelada',
        path: ['installmentCount'],
      });
    }
  });

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;