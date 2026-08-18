import {
  addMonths,
  endOfMonth,
  format,
  isAfter,
  isBefore,
  parseISO,
  startOfMonth,
} from 'date-fns';
import { and, asc, eq, gte, lte } from 'drizzle-orm';

import { generateDueRecurringExpenses, getNextMonthlyDate } from './automation';
import type { Database } from './client';
import { recurringExpenseRules, transactions, type TransactionType } from './schema';

export interface FutureProjection {
  key: string;
  transactionId: number | null;
  recurringRuleId: number | null;
  type: TransactionType;
  title: string;
  category: string;
  amountInCents: number;
  transactionDate: string;
  installmentNumber: number | null;
  installmentCount: number | null;
  isRecurring: boolean;
  isVirtual: boolean;
}

export interface FutureProjectionMonth {
  period: string;
  incomeInCents: number;
  expenseInCents: number;
  balanceInCents: number;
  items: FutureProjection[];
}

export async function getFutureProjections(
  database: Database,
  monthCount = 12,
  referenceDate = new Date(),
  startDateOverride?: Date,
): Promise<FutureProjectionMonth[]> {
  await generateDueRecurringExpenses(database, format(referenceDate, 'yyyy-MM-dd'));

  if (monthCount <= 0) {
    return [];
  }

  const startDate = startOfMonth(
    startDateOverride ?? addMonths(referenceDate, 1),
  );
  const endDate = endOfMonth(addMonths(startDate, monthCount - 1));
  const startDateIso = format(startDate, 'yyyy-MM-dd');
  const endDateIso = format(endDate, 'yyyy-MM-dd');

  const [futureTransactions, rules] = await Promise.all([
    database
      .select()
      .from(transactions)
      .where(
        and(
          gte(transactions.transactionDate, startDateIso),
          lte(transactions.transactionDate, endDateIso),
        ),
      )
      .orderBy(asc(transactions.transactionDate), asc(transactions.id)),
    database
      .select()
      .from(recurringExpenseRules)
      .where(eq(recurringExpenseRules.isActive, true)),
  ]);

  const projections: FutureProjection[] = futureTransactions.map((transaction) => ({
    key: `transaction-${transaction.id}`,
    transactionId: transaction.id,
    recurringRuleId: transaction.recurringRuleId,
    type: transaction.type,
    title: transaction.title,
    category: transaction.category,
    amountInCents: transaction.amountInCents,
    transactionDate: transaction.transactionDate,
    installmentNumber: transaction.installmentNumber,
    installmentCount: transaction.installmentCount,
    isRecurring: Boolean(transaction.recurringRuleId),
    isVirtual: false,
  }));

  const materializedOccurrences = new Set(
    futureTransactions
      .filter((transaction) => transaction.recurringRuleId)
      .map(
        (transaction) =>
          `${transaction.recurringRuleId}-${transaction.transactionDate}`,
      ),
  );

  for (const rule of rules) {
    let occurrenceDate = rule.nextOccurrenceDate;

    while (isBefore(parseISO(occurrenceDate), startDate)) {
      occurrenceDate = getNextMonthlyDate(occurrenceDate, rule.occurrenceDay);
    }

    while (!isAfter(parseISO(occurrenceDate), endDate)) {
      const occurrenceKey = `${rule.id}-${occurrenceDate}`;

      if (!materializedOccurrences.has(occurrenceKey)) {
        projections.push({
          key: `recurring-${occurrenceKey}`,
          transactionId: null,
          recurringRuleId: rule.id,
          type: rule.type,
          title: rule.title,
          category: rule.category,
          amountInCents: rule.amountInCents,
          transactionDate: occurrenceDate,
          installmentNumber: null,
          installmentCount: null,
          isRecurring: true,
          isVirtual: true,
        });
      }

      occurrenceDate = getNextMonthlyDate(occurrenceDate, rule.occurrenceDay);
    }
  }

  projections.sort((first, second) =>
    first.transactionDate.localeCompare(second.transactionDate),
  );

  const grouped = new Map<string, FutureProjectionMonth>();

  for (const projection of projections) {
    const period = projection.transactionDate.slice(0, 7);
    const month = grouped.get(period) ?? {
      period,
      incomeInCents: 0,
      expenseInCents: 0,
      balanceInCents: 0,
      items: [],
    };

    month.items.push(projection);

    if (projection.type === 'income') {
      month.incomeInCents += projection.amountInCents;
      month.balanceInCents += projection.amountInCents;
    } else {
      month.expenseInCents += projection.amountInCents;
      month.balanceInCents -= projection.amountInCents;
    }

    grouped.set(period, month);
  }

  return Array.from(grouped.values());
}