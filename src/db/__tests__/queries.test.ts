import { eq } from "drizzle-orm";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import {
  clearAllTransactions,
  deleteTransaction,
  getBalanceSummary,
  getMonthlyBalanceHistory,
  getTransactionById,
  insertTransaction,
  listTransactions,
  updateTransaction,
} from "../queries/transactions";
import { recurringExpenseRules, transactions } from "../schema";
import { createTestDb, type TestDb } from "./helpers";

const NOW = new Date().toISOString();

function baseTx(overrides: Partial<typeof transactions.$inferInsert> = {}) {
  return {
    type: "expense" as const,
    title: "Mercado",
    amountInCents: 5000,
    category: "Alimentação",
    transactionDate: "2025-01-15",
    ...overrides,
  } satisfies typeof transactions.$inferInsert;
}

// ---------------------------------------------------------------------------
// insertTransaction
// ---------------------------------------------------------------------------

describe("insertTransaction", () => {
  let testDb: TestDb;
  beforeAll(async () => { testDb = await createTestDb(); });
  afterAll(() => testDb.cleanup());
  afterEach(async () => { await testDb.db.delete(transactions); });

  it("insere e retorna a transação com id e timestamps", async () => {
    const tx = await insertTransaction(testDb.db, baseTx());

    expect(tx.id).toBeGreaterThan(0);
    expect(tx.title).toBe("Mercado");
    expect(tx.createdAt).toBeTruthy();
    expect(tx.updatedAt).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// getTransactionById
// ---------------------------------------------------------------------------

describe("getTransactionById", () => {
  let testDb: TestDb;
  beforeAll(async () => { testDb = await createTestDb(); });
  afterAll(() => testDb.cleanup());
  afterEach(async () => { await testDb.db.delete(transactions); });

  it("retorna a transação existente pelo id", async () => {
    const inserted = await insertTransaction(testDb.db, baseTx());
    const found = await getTransactionById(testDb.db, inserted.id);

    expect(found).not.toBeNull();
    expect(found!.id).toBe(inserted.id);
  });

  it("retorna null para id inexistente", async () => {
    const found = await getTransactionById(testDb.db, 99999);
    expect(found).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// updateTransaction
// ---------------------------------------------------------------------------

describe("updateTransaction", () => {
  let testDb: TestDb;
  beforeAll(async () => { testDb = await createTestDb(); });
  afterAll(() => testDb.cleanup());
  afterEach(async () => {
    await testDb.db.delete(transactions);
    await testDb.db.delete(recurringExpenseRules);
  });

  it("atualiza campos da transação", async () => {
    const tx = await insertTransaction(testDb.db, baseTx({ amountInCents: 1000 }));
    const updated = await updateTransaction(testDb.db, tx.id, { amountInCents: 2000 });

    expect(updated.amountInCents).toBe(2000);
  });

  it("lança erro para id inexistente", async () => {
    await expect(updateTransaction(testDb.db, 99999, { title: "X" })).rejects.toThrow(
      "Transaction not found",
    );
  });

  it("também atualiza a regra recorrente vinculada", async () => {
    const [rule] = await testDb.db
      .insert(recurringExpenseRules)
      .values({
        title: "Aluguel",
        amountInCents: 100000,
        category: "Moradia",
        nextOccurrenceDate: "2025-02-15",
        occurrenceDay: 15,
        createdAt: NOW,
        updatedAt: NOW,
      })
      .returning();

    const tx = await insertTransaction(
      testDb.db,
      baseTx({ recurringRuleId: rule!.id, title: "Aluguel", amountInCents: 100000 }),
    );

    await updateTransaction(testDb.db, tx.id, {
      amountInCents: 120000,
      title: "Aluguel atualizado",
    });

    const [updatedRule] = await testDb.db
      .select()
      .from(recurringExpenseRules)
      .where(eq(recurringExpenseRules.id, rule!.id));

    expect(updatedRule!.amountInCents).toBe(120000);
    expect(updatedRule!.title).toBe("Aluguel atualizado");
  });
});

// ---------------------------------------------------------------------------
// deleteTransaction
// ---------------------------------------------------------------------------

describe("deleteTransaction", () => {
  let testDb: TestDb;
  beforeAll(async () => { testDb = await createTestDb(); });
  afterAll(() => testDb.cleanup());
  afterEach(async () => {
    await testDb.db.delete(transactions);
    await testDb.db.delete(recurringExpenseRules);
  });

  it("lança erro para id inexistente", async () => {
    await expect(deleteTransaction(testDb.db, 99999)).rejects.toThrow(
      "Transaction not found",
    );
  });

  it("modo single exclui só o lançamento sem afetar a regra", async () => {
    const [rule] = await testDb.db
      .insert(recurringExpenseRules)
      .values({
        title: "Água",
        amountInCents: 8000,
        category: "Casa",
        nextOccurrenceDate: "2025-02-10",
        occurrenceDay: 10,
        createdAt: NOW,
        updatedAt: NOW,
      })
      .returning();

    const tx1 = await insertTransaction(
      testDb.db,
      baseTx({ recurringRuleId: rule!.id, transactionDate: "2025-01-10" }),
    );
    await insertTransaction(
      testDb.db,
      baseTx({ recurringRuleId: rule!.id, transactionDate: "2025-02-10" }),
    );

    await deleteTransaction(testDb.db, tx1.id, "single");

    const remaining = await testDb.db.select().from(transactions);
    expect(remaining).toHaveLength(1);

    const rules = await testDb.db.select().from(recurringExpenseRules);
    expect(rules).toHaveLength(1);
  });

  it("modo series exclui todos os lançamentos da série e a regra", async () => {
    const [rule] = await testDb.db
      .insert(recurringExpenseRules)
      .values({
        title: "Luz",
        amountInCents: 15000,
        category: "Casa",
        nextOccurrenceDate: "2025-03-10",
        occurrenceDay: 10,
        createdAt: NOW,
        updatedAt: NOW,
      })
      .returning();

    const tx1 = await insertTransaction(
      testDb.db,
      baseTx({ recurringRuleId: rule!.id, transactionDate: "2025-01-10" }),
    );
    await insertTransaction(
      testDb.db,
      baseTx({ recurringRuleId: rule!.id, transactionDate: "2025-02-10" }),
    );

    await deleteTransaction(testDb.db, tx1.id, "series");

    const remainingTx = await testDb.db.select().from(transactions);
    expect(remainingTx).toHaveLength(0);

    const remainingRules = await testDb.db.select().from(recurringExpenseRules);
    expect(remainingRules).toHaveLength(0);
  });

  it("exclui transação não-recorrente independente do mode", async () => {
    const tx = await insertTransaction(testDb.db, baseTx());
    await deleteTransaction(testDb.db, tx.id, "series");

    const remaining = await testDb.db.select().from(transactions);
    expect(remaining).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// clearAllTransactions
// ---------------------------------------------------------------------------

describe("clearAllTransactions", () => {
  let testDb: TestDb;
  beforeAll(async () => { testDb = await createTestDb(); });
  afterAll(() => testDb.cleanup());

  it("remove todas as transações e regras recorrentes", async () => {
    const [rule] = await testDb.db
      .insert(recurringExpenseRules)
      .values({
        title: "Internet",
        amountInCents: 10000,
        category: "Casa",
        nextOccurrenceDate: "2025-02-01",
        occurrenceDay: 1,
        createdAt: NOW,
        updatedAt: NOW,
      })
      .returning();

    await insertTransaction(testDb.db, baseTx({ recurringRuleId: rule!.id }));
    await insertTransaction(testDb.db, baseTx());

    await clearAllTransactions(testDb.db);

    const txCount = await testDb.db.select().from(transactions);
    const ruleCount = await testDb.db.select().from(recurringExpenseRules);

    expect(txCount).toHaveLength(0);
    expect(ruleCount).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// listTransactions
// ---------------------------------------------------------------------------

describe("listTransactions", () => {
  let testDb: TestDb;
  beforeAll(async () => { testDb = await createTestDb(); });
  afterAll(() => testDb.cleanup());
  afterEach(async () => { await testDb.db.delete(transactions); });

  it("retorna todos os lançamentos ordenados por data desc", async () => {
    await insertTransaction(testDb.db, baseTx({ transactionDate: "2025-01-10" }));
    await insertTransaction(testDb.db, baseTx({ transactionDate: "2025-01-20" }));

    const rows = await listTransactions(testDb.db);
    expect(rows[0]!.transactionDate).toBe("2025-01-20");
    expect(rows[1]!.transactionDate).toBe("2025-01-10");
  });

  it("filtra por tipo", async () => {
    await insertTransaction(testDb.db, baseTx({ type: "expense" }));
    await insertTransaction(testDb.db, baseTx({ type: "income" }));

    const incomeOnly = await listTransactions(testDb.db, { type: "income" });
    expect(incomeOnly).toHaveLength(1);
    expect(incomeOnly[0]!.type).toBe("income");
  });

  it("respeita o limite", async () => {
    for (let i = 0; i < 5; i++) {
      await insertTransaction(testDb.db, baseTx());
    }

    const rows = await listTransactions(testDb.db, { limit: 3 });
    expect(rows).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// getBalanceSummary
// ---------------------------------------------------------------------------

describe("getBalanceSummary", () => {
  let testDb: TestDb;
  beforeAll(async () => { testDb = await createTestDb(); });
  afterAll(() => testDb.cleanup());
  afterEach(async () => { await testDb.db.delete(transactions); });

  it("retorna zeros quando não há lançamentos", async () => {
    const summary = await getBalanceSummary(testDb.db);

    expect(summary.incomeInCents).toBe(0);
    expect(summary.expenseInCents).toBe(0);
    expect(summary.balanceInCents).toBe(0);
  });

  it("calcula income, expense e balance corretamente", async () => {
    await insertTransaction(testDb.db, baseTx({ type: "income", amountInCents: 100000 }));
    await insertTransaction(testDb.db, baseTx({ type: "expense", amountInCents: 30000 }));

    const summary = await getBalanceSummary(testDb.db);

    expect(summary.incomeInCents).toBe(100000);
    expect(summary.expenseInCents).toBe(30000);
    expect(summary.balanceInCents).toBe(70000);
  });
});

// ---------------------------------------------------------------------------
// getMonthlyBalanceHistory
// ---------------------------------------------------------------------------

describe("getMonthlyBalanceHistory", () => {
  let testDb: TestDb;
  beforeAll(async () => { testDb = await createTestDb(); });
  afterAll(() => testDb.cleanup());
  afterEach(async () => { await testDb.db.delete(transactions); });

  it("agrupa por período mensal", async () => {
    await insertTransaction(
      testDb.db,
      baseTx({ type: "income", amountInCents: 50000, transactionDate: "2025-01-10" }),
    );
    await insertTransaction(
      testDb.db,
      baseTx({ type: "expense", amountInCents: 20000, transactionDate: "2025-01-20" }),
    );
    await insertTransaction(
      testDb.db,
      baseTx({ type: "income", amountInCents: 30000, transactionDate: "2025-02-05" }),
    );

    const history = await getMonthlyBalanceHistory(testDb.db);

    expect(history).toHaveLength(2);
    const jan = history.find((m) => m.period === "2025-01")!;
    expect(jan.incomeInCents).toBe(50000);
    expect(jan.expenseInCents).toBe(20000);
    expect(jan.balanceInCents).toBe(30000);

    const feb = history.find((m) => m.period === "2025-02")!;
    expect(feb.incomeInCents).toBe(30000);
  });

  it("filtra por startDate e endDate", async () => {
    await insertTransaction(testDb.db, baseTx({ transactionDate: "2024-12-01" }));
    await insertTransaction(testDb.db, baseTx({ transactionDate: "2025-01-15" }));
    await insertTransaction(testDb.db, baseTx({ transactionDate: "2025-03-01" }));

    const history = await getMonthlyBalanceHistory(testDb.db, {
      startDate: "2025-01-01",
      endDate: "2025-01-31",
    });

    expect(history).toHaveLength(1);
    expect(history[0]!.period).toBe("2025-01");
  });
});
