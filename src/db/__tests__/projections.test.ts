import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { getFutureProjections } from "../projections";
import { recurringExpenseRules, transactions } from "../schema";
import { createTestDb, type TestDb } from "./helpers";

const NOW = new Date().toISOString();
const REFERENCE = new Date("2025-01-15T12:00:00Z");

function baseRule(overrides: Partial<typeof recurringExpenseRules.$inferInsert> = {}) {
  return {
    title: "Aluguel",
    amountInCents: 100000,
    category: "Moradia",
    nextOccurrenceDate: "2025-02-15",
    occurrenceDay: 15,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  } satisfies typeof recurringExpenseRules.$inferInsert;
}

function baseTx(overrides: Partial<typeof transactions.$inferInsert> = {}) {
  return {
    type: "expense" as const,
    title: "Despesa",
    amountInCents: 5000,
    category: "Geral",
    transactionDate: "2025-02-10",
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  } satisfies typeof transactions.$inferInsert;
}

// ---------------------------------------------------------------------------
// getFutureProjections
// ---------------------------------------------------------------------------

describe("getFutureProjections", () => {
  let testDb: TestDb;

  beforeAll(async () => { testDb = await createTestDb(); });
  afterAll(() => testDb.cleanup());
  afterEach(async () => {
    await testDb.db.delete(transactions);
    await testDb.db.delete(recurringExpenseRules);
  });

  it("retorna array vazio para monthCount <= 0", async () => {
    await expect(getFutureProjections(testDb.db, 0, REFERENCE)).resolves.toEqual([]);
    await expect(getFutureProjections(testDb.db, -1, REFERENCE)).resolves.toEqual([]);
  });

  it("retorna os períodos corretos para monthCount = 2", async () => {
    await testDb.db.insert(transactions).values([
      baseTx({ transactionDate: "2025-02-10" }),
      baseTx({ transactionDate: "2025-03-10" }),
    ]);

    const months = await getFutureProjections(testDb.db, 2, REFERENCE);
    const periods = months.map((m) => m.period);
    expect(periods).toEqual(["2025-02", "2025-03"]);
  });

  it("inclui transações futuras já materializadas como não-virtuais", async () => {
    await testDb.db.insert(transactions).values(
      baseTx({ transactionDate: "2025-02-10", title: "Supermercado" }),
    );

    const months = await getFutureProjections(testDb.db, 2, REFERENCE);
    const feb = months.find((m) => m.period === "2025-02")!;

    expect(feb.items).toHaveLength(1);
    expect(feb.items[0]!.isVirtual).toBe(false);
    expect(feb.items[0]!.title).toBe("Supermercado");
  });

  it("gera itens virtuais para regras recorrentes ainda não materializadas", async () => {
    await testDb.db
      .insert(recurringExpenseRules)
      .values(baseRule({ nextOccurrenceDate: "2025-02-15" }));

    const months = await getFutureProjections(testDb.db, 2, REFERENCE);
    const feb = months.find((m) => m.period === "2025-02")!;

    expect(feb.items).toHaveLength(1);
    expect(feb.items[0]!.isVirtual).toBe(true);
    expect(feb.items[0]!.isRecurring).toBe(true);
  });

  it("não duplica ocorrências já materializadas na projeção", async () => {
    const [rule] = await testDb.db
      .insert(recurringExpenseRules)
      .values(baseRule({ nextOccurrenceDate: "2025-02-15" }))
      .returning();

    await testDb.db.insert(transactions).values(
      baseTx({
        recurringRuleId: rule!.id,
        transactionDate: "2025-02-15",
        title: "Aluguel",
      }),
    );

    const months = await getFutureProjections(testDb.db, 2, REFERENCE);
    const feb = months.find((m) => m.period === "2025-02")!;

    const ruleItems = feb.items.filter(
      (i) => i.recurringRuleId === rule!.id && i.transactionDate === "2025-02-15",
    );
    expect(ruleItems).toHaveLength(1);
  });

  it("projeta múltiplas ocorrências de uma regra em meses distintos", async () => {
    await testDb.db
      .insert(recurringExpenseRules)
      .values(baseRule({ nextOccurrenceDate: "2025-02-15", occurrenceDay: 15 }));

    const months = await getFutureProjections(testDb.db, 3, REFERENCE);
    for (const period of ["2025-02", "2025-03", "2025-04"]) {
      const month = months.find((m) => m.period === period)!;
      const items = month.items.filter((i) => i.isVirtual);
      expect(items).toHaveLength(1);
    }
  });

  it("calcula incomeInCents, expenseInCents e balanceInCents por mês", async () => {
    await testDb.db.insert(transactions).values([
      baseTx({ type: "income", amountInCents: 300000, transactionDate: "2025-02-05" }),
      baseTx({ type: "expense", amountInCents: 80000, transactionDate: "2025-02-10" }),
    ]);

    const months = await getFutureProjections(testDb.db, 2, REFERENCE);
    const feb = months.find((m) => m.period === "2025-02")!;

    expect(feb.incomeInCents).toBe(300000);
    expect(feb.expenseInCents).toBe(80000);
    expect(feb.balanceInCents).toBe(220000);
  });

  it("não retorna meses sem lançamentos nem regras", async () => {
    await testDb.db.insert(transactions).values(baseTx({ transactionDate: "2025-02-10" }));

    const months = await getFutureProjections(testDb.db, 2, REFERENCE);
    const periods = months.map((m) => m.period);

    expect(periods).toContain("2025-02");
    expect(periods).not.toContain("2025-03");
  });

  it("omite regras inativas da projeção", async () => {
    await testDb.db.insert(recurringExpenseRules).values(
      baseRule({ nextOccurrenceDate: "2025-02-15", isActive: false }),
    );

    const months = await getFutureProjections(testDb.db, 2, REFERENCE);
    expect(months).toHaveLength(0);
  });
});
