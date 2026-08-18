import {
  addMonths,
  format,
  getDate,
  getDaysInMonth,
  isAfter,
  parseISO,
  setDate,
} from 'date-fns';
import { and, eq, lte } from 'drizzle-orm';

import type { Database } from './client';
import type { CreateTransactionInput } from './queries/transactions';
import { recurringExpenseRules, transactions, type Transaction } from './schema';

export interface CreateRecurringExpenseInput extends CreateTransactionInput {
  transactionDate: string;
}

export interface CreateInstallmentsInput extends CreateTransactionInput {
  installmentCount: number;
  invoiceDueDate: string;
}

function createGroupId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function addMonthsToIsoDate(date: string, months: number): string {
  return format(addMonths(parseISO(date), months), 'yyyy-MM-dd');
}

export function getNextMonthlyDate(date: string, preferredDay: number): string {
  const nextMonth = addMonths(parseISO(date), 1);
  return format(
    setDate(nextMonth, Math.min(preferredDay, getDaysInMonth(nextMonth))),
    'yyyy-MM-dd',
  );
}

export async function createRecurringExpense(
  database: Database,
  input: CreateRecurringExpenseInput,
): Promise<Transaction> {
  return database.transaction(async (transaction) => {
    const now = new Date().toISOString();
    const [rule] = await transaction
      .insert(recurringExpenseRules)
      .values({
        title: input.title,
        description: input.description,
        amountInCents: input.amountInCents,
        category: input.category,
        merchant: input.merchant,
        paymentMethod: input.paymentMethod,
        cardId: input.cardId,
        paymentModality: input.paymentModality,
        nextOccurrenceDate: getNextMonthlyDate(
          input.transactionDate,
          getDate(parseISO(input.transactionDate)),
        ),
        occurrenceDay: getDate(parseISO(input.transactionDate)),
        nextInvoiceDueDate: input.invoiceDueDate
          ? getNextMonthlyDate(
              input.invoiceDueDate,
              getDate(parseISO(input.invoiceDueDate)),
            )
          : null,
        invoiceDueDay: input.invoiceDueDate
          ? getDate(parseISO(input.invoiceDueDate))
          : null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    if (!rule) {
      throw new Error('Recurring rule could not be created');
    }

    const [created] = await transaction
      .insert(transactions)
      .values({
        ...input,
        recurringRuleId: rule.id,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    if (!created) {
      throw new Error('Recurring transaction could not be created');
    }

    return created;
  });
}

export async function createInstallments(
  database: Database,
  input: CreateInstallmentsInput,
): Promise<Transaction> {
  const { installmentCount, ...transactionInput } = input;
  const baseAmount = Math.floor(input.amountInCents / installmentCount);
  const remainder = input.amountInCents % installmentCount;
  const groupId = createGroupId();
  const now = new Date().toISOString();

  const installmentValues = Array.from({ length: installmentCount }, (_, index) => {
    const installmentNumber = index + 1;
    const dueDate = addMonthsToIsoDate(input.invoiceDueDate, index);

    return {
      ...transactionInput,
      title: `${input.title} (${installmentNumber}/${installmentCount})`,
      amountInCents: baseAmount + (index < remainder ? 1 : 0),
      transactionDate: dueDate,
      invoiceDueDate: dueDate,
      installmentGroupId: groupId,
      installmentNumber,
      installmentCount,
      createdAt: now,
      updatedAt: now,
    };
  });

  const created = await database
    .insert(transactions)
    .values(installmentValues)
    .returning();

  if (!created[0]) {
    throw new Error('Installments could not be created');
  }

  return created[0];
}

export async function generateDueRecurringExpenses(
  database: Database,
  referenceDate = format(new Date(), 'yyyy-MM-dd'),
): Promise<void> {
  const rules = await database
    .select()
    .from(recurringExpenseRules)
    .where(
      and(
        eq(recurringExpenseRules.isActive, true),
        lte(recurringExpenseRules.nextOccurrenceDate, referenceDate),
      ),
    );

  for (const rule of rules) {
    let occurrenceDate = rule.nextOccurrenceDate;
    let invoiceDueDate = rule.nextInvoiceDueDate;

    while (!isAfter(parseISO(occurrenceDate), parseISO(referenceDate))) {
      const now = new Date().toISOString();

      await database
        .insert(transactions)
        .values({
          type: 'expense',
          title: rule.title,
          description: rule.description,
          amountInCents: rule.amountInCents,
          category: rule.category,
          transactionDate: occurrenceDate,
          merchant: rule.merchant,
          paymentMethod: rule.paymentMethod,
          cardId: rule.cardId,
          paymentModality: rule.paymentModality,
          invoiceDueDate,
          recurringRuleId: rule.id,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoNothing();

      occurrenceDate = getNextMonthlyDate(occurrenceDate, rule.occurrenceDay);
      invoiceDueDate = invoiceDueDate
        ? getNextMonthlyDate(invoiceDueDate, rule.invoiceDueDay ?? 1)
        : null;
    }

    await database
      .update(recurringExpenseRules)
      .set({
        nextOccurrenceDate: occurrenceDate,
        nextInvoiceDueDate: invoiceDueDate,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(recurringExpenseRules.id, rule.id));
  }
}