import {
  check,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const transactionTypes = ['income', 'expense'] as const;
export const paymentMethods = ['card', 'cash', 'pix'] as const;
export const paymentModalities = ['debit', 'credit'] as const;

export const cards = sqliteTable(
  'cards',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    brand: text('brand').notNull(),
    closingDay: integer('closing_day').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    check('cards_closing_day_valid', sql`${table.closingDay} between 1 and 31`),
    uniqueIndex('cards_name_idx').on(table.name),
  ],
);

export const categories = sqliteTable(
  'categories',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    color: text('color'),
    icon: text('icon'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [uniqueIndex('categories_name_idx').on(table.name)],
);

export const transactions = sqliteTable(
  'transactions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    type: text('type', { enum: transactionTypes }).notNull(),
    title: text('title').notNull(),
    description: text('description'),
    amountInCents: integer('amount_in_cents').notNull(),
    category: text('category').notNull(),
    transactionDate: text('transaction_date').notNull(),
    merchant: text('merchant'),
    paymentMethod: text('payment_method', { enum: paymentMethods }),
    cardId: text('card_id'),
    paymentModality: text('payment_modality', { enum: paymentModalities }),
    invoiceDueDate: text('invoice_due_date'),
    recurringRuleId: integer('recurring_rule_id'),
    installmentGroupId: text('installment_group_id'),
    installmentNumber: integer('installment_number'),
    installmentCount: integer('installment_count'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    check('transactions_amount_positive', sql`${table.amountInCents} > 0`),
    check(
      'transactions_type_valid',
      sql`${table.type} in ('income', 'expense')`,
    ),
    check(
      'transactions_payment_method_valid',
      sql`${table.paymentMethod} is null or ${table.paymentMethod} in ('card', 'cash', 'pix')`,
    ),
    check(
      'transactions_payment_modality_valid',
      sql`${table.paymentModality} is null or ${table.paymentModality} in ('debit', 'credit')`,
    ),
    index('transactions_date_idx').on(table.transactionDate),
    index('transactions_type_date_idx').on(table.type, table.transactionDate),
    index('transactions_category_idx').on(table.category),
    index('transactions_recurring_rule_idx').on(table.recurringRuleId),
    index('transactions_installment_group_idx').on(table.installmentGroupId),
    uniqueIndex('transactions_recurring_occurrence_idx').on(
      table.recurringRuleId,
      table.transactionDate,
    ),
  ],
);

export const recurringExpenseRules = sqliteTable(
  'recurring_expense_rules',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    type: text('type', { enum: transactionTypes }).notNull().default('expense'),
    title: text('title').notNull(),
    description: text('description'),
    amountInCents: integer('amount_in_cents').notNull(),
    category: text('category').notNull(),
    merchant: text('merchant'),
    paymentMethod: text('payment_method', { enum: paymentMethods }),
    cardId: text('card_id'),
    paymentModality: text('payment_modality', { enum: paymentModalities }),
    nextOccurrenceDate: text('next_occurrence_date').notNull(),
    occurrenceDay: integer('occurrence_day').notNull().default(1),
    nextInvoiceDueDate: text('next_invoice_due_date'),
    invoiceDueDay: integer('invoice_due_day'),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    check(
      'recurring_expenses_type_valid',
      sql`${table.type} in ('income', 'expense')`,
    ),
    check('recurring_expenses_amount_positive', sql`${table.amountInCents} > 0`),
    index('recurring_expenses_due_idx').on(table.isActive, table.nextOccurrenceDate),
  ],
);

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type RecurringExpenseRule = typeof recurringExpenseRules.$inferSelect;
export type NewRecurringExpenseRule = typeof recurringExpenseRules.$inferInsert;
export type Card = typeof cards.$inferSelect;
export type NewCard = typeof cards.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type TransactionType = (typeof transactionTypes)[number];
export type PaymentMethod = (typeof paymentMethods)[number];
export type PaymentModality = (typeof paymentModalities)[number];