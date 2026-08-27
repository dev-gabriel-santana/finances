import { eq } from "drizzle-orm";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import {
  createInstallments,
  createRecurringTransaction,
  generateDueRecurringExpenses,
  getNextMonthlyDate,
} from "../automation";
import { recurringExpenseRules, transactions } from "../schema";
import { createTestDb, type TestDb } from "./helpers";

const NOW = new Date().toISOString();

function baseRule(overrides: Partial<typeof recurringExpenseRules.$inferInsert> = {}) {
  return {
    title: "Aluguel",
    amountInCents: 100000,
    category: "Moradia",
    nextOccurrenceDate: "2025-01-15",
    occurrenceDay: 15,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  } satisfies typeof recurringExpenseRules.$inferInsert;
}

// ---------------------------------------------------------------------------
// getNextMonthlyDate — pure function
// ---------------------------------------------------------------------------

describe("getNextMonthlyDate", () => {
  it("avança um mês mantendo o dia", () => {
    expect(getNextMonthlyDate("2025-01-15", 15)).toBe("2025-02-15");
  });

  it("clipa no último dia quando o mês-alvo é mais curto", () => {
    expect(getNextMonthlyDate("2025-01-31", 31)).toBe("2025-02-28");
  });

  it("restaura o dia preferido no próximo mês com dias suficientes", () => {
    expect(getNextMonthlyDate("2025-02-28", 31)).toBe("2025-03-31");
  });

  it("avança do mês 12 para janeiro do ano seguinte", () => {
    expect(getNextMonthlyDate("2025-12-15", 15)).toBe("2026-01-15");
  });

  it("respeita ano bissexto em fevereiro", () => {
    expect(getNextMonthlyDate("2024-01-31", 31)).toBe("2024-02-29");
  });
});

// ---------------------------------------------------------------------------
// createRecurringTransaction
// ---------------------------------------------------------------------------

describe("createRecurringTransaction", () => {
  let testDb: TestDb;

  beforeAll(async () => { testDb = await createTestDb(); });
  afterAll(() => testDb.cleanup());
  afterEach(async () => {
    await testDb.db.delete(transactions);
    await testDb.db.delete(recurringExpenseRules);
  });

  it("cria a transação e a regra vinculada", async () => {
    const tx = await createRecurringTransaction(testDb.db, {
      type: "expense",
      title: "Aluguel",
      amountInCents: 100000,
      category: "Moradia",
      transactionDate: "2025-01-15",
    });

    expect(tx.recurringRuleId).not.toBeNull();
    const [rule] = await testDb.db
      .select()
      .from(recurringExpenseRules)
      .where(eq(recurringExpenseRules.id, tx.recurringRuleId!));

    expect(rule).toBeDefined();
    expect(rule!.occurrenceDay).toBe(15);
    expect(rule!.nextOccurrenceDate).toBe("2025-02-15");
  });

  it("define nextOccurrenceDate corretamente para dia 31", async () => {
    const tx = await createRecurringTransaction(testDb.db, {
      type: "expense",
      title: "Mensalidade",
      amountInCents: 5000,
      category: "Saúde",
      transactionDate: "2025-01-31",
    });

    const [rule] = await testDb.db
      .select()
      .from(recurringExpenseRules)
      .where(eq(recurringExpenseRules.id, tx.recurringRuleId!));

    expect(rule!.occurrenceDay).toBe(31);
    expect(rule!.nextOccurrenceDate).toBe("2025-02-28");
  });

  it("funciona para receitas recorrentes", async () => {
    const tx = await createRecurringTransaction(testDb.db, {
      type: "income",
      title: "Salário",
      amountInCents: 500000,
      category: "Renda",
      transactionDate: "2025-01-05",
    });

    expect(tx.type).toBe("income");
    const [rule] = await testDb.db
      .select()
      .from(recurringExpenseRules)
      .where(eq(recurringExpenseRules.id, tx.recurringRuleId!));

    expect(rule!.type).toBe("income");
  });
});

// ---------------------------------------------------------------------------
// createInstallments
// ---------------------------------------------------------------------------

describe("createInstallments", () => {
  let testDb: TestDb;

  beforeAll(async () => { testDb = await createTestDb(); });
  afterAll(() => testDb.cleanup());
  afterEach(async () => {
    await testDb.db.delete(transactions);
  });

  it("cria o número correto de parcelas", async () => {
    await createInstallments(testDb.db, {
      type: "expense",
      title: "TV",
      amountInCents: 300000,
      category: "Eletrônicos",
      transactionDate: "2025-01-15",
      installmentCount: 3,
      invoiceDueDate: "2025-02-10",
    });

    const rows = await testDb.db.select().from(transactions);
    expect(rows).toHaveLength(3);
  });

  it("distribui as parcelas em meses consecutivos a partir de invoiceDueDate", async () => {
    await createInstallments(testDb.db, {
      type: "expense",
      title: "Sofá",
      amountInCents: 240000,
      category: "Casa",
      transactionDate: "2025-01-15",
      installmentCount: 3,
      invoiceDueDate: "2025-02-05",
    });

    const rows = await testDb.db
      .select({ date: transactions.transactionDate })
      .from(transactions)
      .orderBy(transactions.transactionDate);

    expect(rows[0]!.date).toBe("2025-02-05");
    expect(rows[1]!.date).toBe("2025-03-05");
    expect(rows[2]!.date).toBe("2025-04-05");
  });

  it("distribui o resto centavo a centavo nas primeiras parcelas", async () => {
    await createInstallments(testDb.db, {
      type: "expense",
      title: "Notebook",
      amountInCents: 1000,
      category: "Tech",
      transactionDate: "2025-01-15",
      installmentCount: 3,
      invoiceDueDate: "2025-02-10",
    });

    const rows = await testDb.db
      .select({ amount: transactions.amountInCents })
      .from(transactions)
      .orderBy(transactions.installmentNumber);

    // floor(1000/3)=333, resto=1 → parcela 1 recebe +1 centavo
    expect(rows[0]!.amount).toBe(334);
    expect(rows[1]!.amount).toBe(333);
    expect(rows[2]!.amount).toBe(333);
  });

  it("a soma das parcelas é sempre igual ao valor original", async () => {
    await createInstallments(testDb.db, {
      type: "expense",
      title: "Geladeira",
      amountInCents: 5001,
      category: "Eletrodomésticos",
      transactionDate: "2025-01-10",
      installmentCount: 4,
      invoiceDueDate: "2025-02-10",
    });

    const rows = await testDb.db
      .select({ amount: transactions.amountInCents })
      .from(transactions);

    const total = rows.reduce((acc, r) => acc + r.amount, 0);
    expect(total).toBe(5001);
  });

  it("todas as parcelas compartilham o mesmo installmentGroupId", async () => {
    await createInstallments(testDb.db, {
      type: "expense",
      title: "Ar-condicionado",
      amountInCents: 600000,
      category: "Casa",
      transactionDate: "2025-01-15",
      installmentCount: 6,
      invoiceDueDate: "2025-02-05",
    });

    const rows = await testDb.db
      .select({ groupId: transactions.installmentGroupId })
      .from(transactions);

    const groupIds = new Set(rows.map((r) => r.groupId));
    expect(groupIds.size).toBe(1);
  });

  it("inclui (N/Total) no título de cada parcela", async () => {
    await createInstallments(testDb.db, {
      type: "expense",
      title: "Câmera",
      amountInCents: 200000,
      category: "Tech",
      transactionDate: "2025-01-15",
      installmentCount: 2,
      invoiceDueDate: "2025-02-10",
    });

    const rows = await testDb.db
      .select({ title: transactions.title, num: transactions.installmentNumber })
      .from(transactions)
      .orderBy(transactions.installmentNumber);

    expect(rows[0]!.title).toBe("Câmera (1/2)");
    expect(rows[1]!.title).toBe("Câmera (2/2)");
  });
});

// ---------------------------------------------------------------------------
// generateDueRecurringExpenses
// ---------------------------------------------------------------------------

describe("generateDueRecurringExpenses", () => {
  let testDb: TestDb;

  beforeAll(async () => { testDb = await createTestDb(); });
  afterAll(() => testDb.cleanup());
  afterEach(async () => {
    await testDb.db.delete(transactions);
    await testDb.db.delete(recurringExpenseRules);
  });

  it("não cria nada quando não há regras vencidas", async () => {
    await testDb.db.insert(recurringExpenseRules).values(
      baseRule({ nextOccurrenceDate: "2025-03-01" }),
    );

    await generateDueRecurringExpenses(testDb.db, "2025-01-15");

    const rows = await testDb.db.select().from(transactions);
    expect(rows).toHaveLength(0);
  });

  it("gera a ocorrência para uma regra vencida hoje", async () => {
    await testDb.db.insert(recurringExpenseRules).values(
      baseRule({ nextOccurrenceDate: "2025-01-15" }),
    );

    await generateDueRecurringExpenses(testDb.db, "2025-01-15");

    const rows = await testDb.db.select().from(transactions);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.transactionDate).toBe("2025-01-15");
  });

  it("avança nextOccurrenceDate após gerar a ocorrência", async () => {
    const [rule] = await testDb.db
      .insert(recurringExpenseRules)
      .values(baseRule({ nextOccurrenceDate: "2025-01-15", occurrenceDay: 15 }))
      .returning();

    await generateDueRecurringExpenses(testDb.db, "2025-01-15");

    const [updated] = await testDb.db
      .select()
      .from(recurringExpenseRules)
      .where(eq(recurringExpenseRules.id, rule!.id));

    expect(updated!.nextOccurrenceDate).toBe("2025-02-15");
  });

  it("gera múltiplas ocorrências quando a regra está meses atrasada", async () => {
    await testDb.db.insert(recurringExpenseRules).values(
      baseRule({ nextOccurrenceDate: "2025-01-15", occurrenceDay: 15 }),
    );

    await generateDueRecurringExpenses(testDb.db, "2025-03-15");

    const rows = await testDb.db.select().from(transactions);
    const dates = rows.map((r) => r.transactionDate).sort();

    expect(dates).toEqual(["2025-01-15", "2025-02-15", "2025-03-15"]);
  });

  it("é idempotente — chamar duas vezes não duplica registros", async () => {
    await testDb.db.insert(recurringExpenseRules).values(
      baseRule({ nextOccurrenceDate: "2025-01-15", occurrenceDay: 15 }),
    );

    await generateDueRecurringExpenses(testDb.db, "2025-01-15");
    await generateDueRecurringExpenses(testDb.db, "2025-01-15");

    const rows = await testDb.db.select().from(transactions);
    expect(rows).toHaveLength(1);
  });

  it("ignora regras inativas", async () => {
    await testDb.db.insert(recurringExpenseRules).values(
      baseRule({ nextOccurrenceDate: "2025-01-15", isActive: false }),
    );

    await generateDueRecurringExpenses(testDb.db, "2025-01-15");

    const rows = await testDb.db.select().from(transactions);
    expect(rows).toHaveLength(0);
  });
});
