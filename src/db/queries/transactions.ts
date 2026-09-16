import { format, startOfMonth } from "date-fns";
import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";

import type { Database } from "../client";
import {
    cards,
    categories,
    recurringExpenseRules,
    transactions,
    type NewTransaction,
    type Transaction,
    type TransactionType,
} from "../schema";

export type CreateTransactionInput = Omit<
  NewTransaction,
  "id" | "createdAt" | "updatedAt"
>;

export type UpdateTransactionInput = Partial<CreateTransactionInput>;

export type DeleteTransactionMode = "single" | "series";

export interface ListTransactionsOptions {
  type?: TransactionType;
  limit?: number;
}

export interface BalanceSummary {
  incomeInCents: number;
  expenseInCents: number;
  balanceInCents: number;
}

export interface MonthlyBalance extends BalanceSummary {
  period: string;
}

export interface BalanceHistoryOptions {
  startDate?: string;
  endDate?: string;
}

export interface ExpenseTotalsOptions {
  startDate?: string;
  endDate?: string;
}

export interface ExpenseTotalByCategory {
  category: string;
  amountInCents: number;
}

export interface ExpenseTotalByCard {
  cardId: number;
  cardName: string;
  cardBrand: string;
  amountInCents: number;
  transactionCount: number;
}

export interface CurrentAccountPixAdjustment {
  incomeInCents: number;
  expenseInCents: number;
  balanceInCents: number;
}

const incomeTotal = sql<number>`coalesce(sum(case when ${transactions.type} = 'income' then ${transactions.amountInCents} else 0 end), 0)`;
const expenseTotal = sql<number>`coalesce(sum(case when ${transactions.type} = 'expense' then ${transactions.amountInCents} else 0 end), 0)`;
const balanceTotal = sql<number>`coalesce(sum(case when ${transactions.type} = 'income' then ${transactions.amountInCents} else -${transactions.amountInCents} end), 0)`;
const expenseCategoryTotal = sql<number>`coalesce(sum(${transactions.amountInCents}), 0)`;
const expenseCardTotal = sql<number>`coalesce(sum(${transactions.amountInCents}), 0)`;
const cardIdAsText = sql<string>`cast(${cards.id} as text)`;

export async function insertTransaction(
  database: Database,
  input: CreateTransactionInput,
): Promise<Transaction> {
  const now = new Date().toISOString();
  const [created] = await database
    .insert(transactions)
    .values({ ...input, createdAt: now, updatedAt: now })
    .returning();

  if (!created) {
    throw new Error("Transaction could not be created");
  }

  return created;
}

export async function getTransactionById(
  database: Database,
  id: number,
): Promise<Transaction | null> {
  const [transaction] = await database
    .select()
    .from(transactions)
    .where(eq(transactions.id, id))
    .limit(1);

  return transaction ?? null;
}

export async function updateTransaction(
  database: Database,
  id: number,
  input: UpdateTransactionInput,
): Promise<Transaction> {
  const updated = await database.transaction(async (databaseTransaction) => {
    const [current] = await databaseTransaction
      .select()
      .from(transactions)
      .where(eq(transactions.id, id))
      .limit(1);

    if (!current) {
      throw new Error("Transaction not found");
    }

    const now = new Date().toISOString();
    const [saved] = await databaseTransaction
      .update(transactions)
      .set({ ...input, updatedAt: now })
      .where(eq(transactions.id, id))
      .returning();

    if (current.recurringRuleId) {
      await databaseTransaction
        .update(recurringExpenseRules)
        .set({
          title: input.title,
          description: input.description,
          amountInCents: input.amountInCents,
          category: input.category,
          merchant: input.merchant,
          paymentMethod: input.paymentMethod,
          cardId: input.cardId,
          paymentModality: input.paymentModality,
          updatedAt: now,
        })
        .where(eq(recurringExpenseRules.id, current.recurringRuleId));
    }

    return saved;
  });

  if (!updated) {
    throw new Error("Transaction not found");
  }

  return updated;
}

export async function deleteTransaction(
  database: Database,
  id: number,
  mode: DeleteTransactionMode = "series",
): Promise<void> {
  await database.transaction(async (databaseTransaction) => {
    const [current] = await databaseTransaction
      .select({
        id: transactions.id,
        recurringRuleId: transactions.recurringRuleId,
      })
      .from(transactions)
      .where(eq(transactions.id, id))
      .limit(1);

    if (!current) {
      throw new Error("Transaction not found");
    }

    if (current.recurringRuleId && mode === "series") {
      await databaseTransaction
        .delete(transactions)
        .where(eq(transactions.recurringRuleId, current.recurringRuleId));

      await databaseTransaction
        .delete(recurringExpenseRules)
        .where(eq(recurringExpenseRules.id, current.recurringRuleId));

      return;
    }

    await databaseTransaction
      .delete(transactions)
      .where(eq(transactions.id, id));
  });
}

export async function clearAllTransactions(database: Database): Promise<void> {
  await database.transaction(async (databaseTransaction) => {
    await databaseTransaction.delete(transactions);
    await databaseTransaction.delete(recurringExpenseRules);
  });
}

export async function clearAllData(database: Database): Promise<void> {
  await database.transaction(async (databaseTransaction) => {
    await databaseTransaction.delete(transactions);
    await databaseTransaction.delete(recurringExpenseRules);
    await databaseTransaction.delete(cards);
    await databaseTransaction.delete(categories);
  });
}

export async function listTransactions(
  database: Database,
  options: ListTransactionsOptions = {},
): Promise<Transaction[]> {
  const limit = Math.max(1, options.limit ?? 100);

  if (options.type) {
    return database
      .select()
      .from(transactions)
      .where(eq(transactions.type, options.type))
      .orderBy(desc(transactions.transactionDate), desc(transactions.id))
      .limit(limit);
  }

  return database
    .select()
    .from(transactions)
    .orderBy(desc(transactions.transactionDate), desc(transactions.id))
    .limit(limit);
}

export async function listExpenseTransactionsByCard(
  database: Database,
  cardId: number,
): Promise<Transaction[]> {
  return database
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.type, "expense"),
        eq(transactions.paymentMethod, "card"),
        eq(transactions.cardId, String(cardId)),
      ),
    )
    .orderBy(desc(transactions.transactionDate), desc(transactions.id));
}

export async function getBalanceSummary(
  database: Database,
): Promise<BalanceSummary> {
  const [summary] = await database
    .select({
      incomeInCents: incomeTotal,
      expenseInCents: expenseTotal,
      balanceInCents: balanceTotal,
    })
    .from(transactions);

  return (
    summary ?? {
      incomeInCents: 0,
      expenseInCents: 0,
      balanceInCents: 0,
    }
  );
}

export async function getCurrentAccountPixAdjustment(
  database: Database,
  referenceDate = new Date(),
): Promise<CurrentAccountPixAdjustment> {
  const today = format(referenceDate, "yyyy-MM-dd");
  const monthStart = format(startOfMonth(referenceDate), "yyyy-MM-dd");
  const pixTransactions = await database
    .select({
      type: transactions.type,
      amountInCents: transactions.amountInCents,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.paymentMethod, "pix"),
        gte(transactions.transactionDate, monthStart),
        lte(transactions.transactionDate, today),
      ),
    );

  return pixTransactions.reduce<CurrentAccountPixAdjustment>(
    (adjustment, transaction) => {
      if (transaction.type === "income") {
        adjustment.incomeInCents += transaction.amountInCents;
        adjustment.balanceInCents += transaction.amountInCents;
      } else {
        adjustment.expenseInCents += transaction.amountInCents;
        adjustment.balanceInCents -= transaction.amountInCents;
      }

      return adjustment;
    },
    { incomeInCents: 0, expenseInCents: 0, balanceInCents: 0 },
  );
}

export async function getMonthlyBalanceHistory(
  database: Database,
  options: BalanceHistoryOptions = {},
): Promise<MonthlyBalance[]> {
  const period = sql<string>`substr(${transactions.transactionDate}, 1, 7)`;
  const filters = [
    options.startDate
      ? gte(transactions.transactionDate, options.startDate)
      : undefined,
    options.endDate
      ? lte(transactions.transactionDate, options.endDate)
      : undefined,
  ].filter((filter) => filter !== undefined);

  return database
    .select({
      period,
      incomeInCents: incomeTotal,
      expenseInCents: expenseTotal,
      balanceInCents: balanceTotal,
    })
    .from(transactions)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .groupBy(period)
    .orderBy(period);
}

export async function getExpenseTotalsByCategory(
  database: Database,
  options: ExpenseTotalsOptions = {},
): Promise<ExpenseTotalByCategory[]> {
  const filters = [
    eq(transactions.type, "expense"),
    options.startDate
      ? gte(transactions.transactionDate, options.startDate)
      : undefined,
    options.endDate
      ? lte(transactions.transactionDate, options.endDate)
      : undefined,
  ].filter((filter) => filter !== undefined);

  return database
    .select({
      category: transactions.category,
      amountInCents: expenseCategoryTotal,
    })
    .from(transactions)
    .where(and(...filters))
    .groupBy(transactions.category)
    .orderBy(desc(expenseCategoryTotal));
}

export async function getExpenseTotalsByCard(
  database: Database,
  options: ExpenseTotalsOptions = {},
): Promise<ExpenseTotalByCard[]> {
  const dateFilters = [
    options.startDate
      ? gte(transactions.transactionDate, options.startDate)
      : undefined,
    options.endDate
      ? lte(transactions.transactionDate, options.endDate)
      : undefined,
  ].filter((filter) => filter !== undefined);

  return database
    .select({
      cardId: cards.id,
      cardName: cards.name,
      cardBrand: cards.brand,
      amountInCents: expenseCardTotal,
      transactionCount: count(transactions.id),
    })
    .from(cards)
    .leftJoin(
      transactions,
      and(
        eq(transactions.cardId, cardIdAsText),
        eq(transactions.type, "expense"),
        eq(transactions.paymentMethod, "card"),
        ...dateFilters,
      ),
    )
    .groupBy(cards.id, cards.name, cards.brand)
    .orderBy(desc(expenseCardTotal), cards.name);
}
