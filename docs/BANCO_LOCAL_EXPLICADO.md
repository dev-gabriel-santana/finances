# Banco local do app: explicação do código

Este documento explica como o banco local do app funciona no projeto, em linguagem simples, cobrindo a criação do banco, o schema, as migrations, as automações e o fluxo de uso no app.

## Visão geral

O app usa:

- Expo SQLite
- Drizzle ORM
- SQLite local no dispositivo
- arquivo de banco: `finances.db`

A ideia é que o app funcione offline, guardando receitas, despesas, categorias, cartões, recorrências e parcelas diretamente no celular.

O principal ponto de entrada é o arquivo:

- `src/db/provider.tsx`

E os arquivos centrais são:

- `src/db/client.ts`
- `src/db/schema.ts`
- `src/db/automation.ts`

---

## 1) O que é o `DatabaseProvider`

Arquivo: `src/db/provider.tsx`

Esse componente é o responsável por iniciar e expor o banco para o restante do app.

Ele faz isso com `SQLiteProvider` do Expo:

```tsx
<SQLiteProvider
  databaseName={DATABASE_NAME}
  onInit={initializeDatabase}
  options={{ enableChangeListener: true }}
>
  <DrizzleProvider>{children}</DrizzleProvider>
</SQLiteProvider>
```

### O que cada parte faz

- `databaseName={DATABASE_NAME}`
  - define o nome do arquivo do banco local
  - no projeto: `finances.db`

- `onInit={initializeDatabase}`
  - executa uma função assim que o banco abre
  - serve para preparar o banco antes do app começar a usar

- `options={{ enableChangeListener: true }}`
  - ativa listeners para mudanças no banco
  - útil para atualizar UI quando os dados mudam

---

## 2) Inicialização do banco

A função `initializeDatabase` em `src/db/provider.tsx` faz isso:

```ts
async function initializeDatabase(client: SQLiteDatabase) {
  await client.execAsync(
    "PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;",
  );
  const database = createDatabase(client);
  await migrate(database, migrations);
  await generateDueRecurringExpenses(database);
}
```

### Passo a passo

#### a) `PRAGMA journal_mode = WAL`

Ativa o modo WAL do SQLite.

Isso melhora a performance e a concorrência de leitura/escrita, especialmente em apps móveis.

#### b) `PRAGMA foreign_keys = ON`

Ativa as chaves estrangeiras.

Isso faz o SQLite validar dependências entre tabelas e impedir registros inconsistentes.

#### c) `createDatabase(client)`

Cria a instância de banco do Drizzle conectada ao SQLite do Expo.

#### d) `migrate(database, migrations)`

Aplica as migrations pendentes.

Isso garante que o banco local tenha a estrutura correta.

#### e) `generateDueRecurringExpenses(database)`

Executa uma verificação de recorrências vencidas e cria ocorrências que ainda não foram materializadas.

Esse passo é importante porque o app gera recorrências automaticamente quando elas vencem.

---

## 3) Criação do cliente Drizzle

Arquivo: `src/db/client.ts`

```ts
import { drizzle, type ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import type { SQLiteDatabase } from "expo-sqlite";

import * as schema from "./schema";

export const DATABASE_NAME = "finances.db";

export type Database = ExpoSQLiteDatabase<typeof schema>;

export function createDatabase(client: SQLiteDatabase): Database {
  return drizzle(client, { schema });
}
```

### O que isso faz

- `drizzle(client, { schema })`
  - conecta o cliente SQLite ao Drizzle
  - usa o schema para saber quais tabelas existem e como elas são estruturadas

- `Database = ExpoSQLiteDatabase<typeof schema>`
  - define o tipo da instância do banco conforme as tabelas do schema
  - isso dá autocomplete e validação em TypeScript

---

## 4) O schema do banco

Arquivo: `src/db/schema.ts`

Esse arquivo descreve todas as tabelas do banco local.

### Tabelas principais

#### `cards`

```ts
export const cards = sqliteTable("cards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  closingDay: integer("closing_day").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
```

Faz:

- guarda cartões do usuário
- exige nome, bandeira e dia de fechamento
- garante que o dia esteja dentro do intervalo válido

#### `categories`

```ts
export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  color: text("color"),
  icon: text("icon"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
```

Faz:

- guarda categorias de receita/despesa
- armazena cor e ícone para construir a UI

#### `transactions`

Essa é a tabela central do app.

```ts
export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type", { enum: transactionTypes }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  amountInCents: integer("amount_in_cents").notNull(),
  category: text("category").notNull(),
  transactionDate: text("transaction_date").notNull(),
  merchant: text("merchant"),
  paymentMethod: text("payment_method", { enum: paymentMethods }),
  cardId: text("card_id"),
  paymentModality: text("payment_modality", { enum: paymentModalities }),
  invoiceDueDate: text("invoice_due_date"),
  recurringRuleId: integer("recurring_rule_id"),
  installmentGroupId: text("installment_group_id"),
  installmentNumber: integer("installment_number"),
  installmentCount: integer("installment_count"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
```

### O que cada campo representa

- `type`: receita ou despesa
- `title`: título da transação
- `amountInCents`: valor em centavos, sempre positivo
- `category`: categoria vinculada
- `transactionDate`: data da movimentação, salva em ISO
- `merchant`: estabelecimento/opcional
- `paymentMethod`: cartão, dinheiro ou pix
- `cardId`: cartão relacionado, se houver
- `paymentModality`: débito ou crédito
- `invoiceDueDate`: data de vencimento da fatura
- `recurringRuleId`: ligação com regra recorrente
- `installmentGroupId`: grupo de parcelas
- `installmentNumber` e `installmentCount`: número da parcela e total

#### Validações importantes

- valor deve ser maior que zero
- type deve ser income ou expense
- paymentMethod deve ser card, cash ou pix
- paymentModality deve ser debit ou credit

Isso garante consistência.

#### `recurringExpenseRules`

Essa tabela guarda as regras de recorrência.

```ts
export const recurringExpenseRules = sqliteTable("recurring_expense_rules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type", { enum: transactionTypes }).notNull().default("expense"),
  title: text("title").notNull(),
  description: text("description"),
  amountInCents: integer("amount_in_cents").notNull(),
  category: text("category").notNull(),
  merchant: text("merchant"),
  paymentMethod: text("payment_method", { enum: paymentMethods }),
  cardId: text("card_id"),
  paymentModality: text("payment_modality", { enum: paymentModalities }),
  nextOccurrenceDate: text("next_occurrence_date").notNull(),
  occurrenceDay: integer("occurrence_day").notNull().default(1),
  nextInvoiceDueDate: text("next_invoice_due_date"),
  invoiceDueDay: integer("invoice_due_day"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
```

### O que essa tabela controla

- qual transação é recorrente
- quando deve acontecer a próxima ocorrência
- se a regra está ativa ou inativa
- quando a próxima data de vencimento da fatura será

Essa tabela é a “base da recorrência”.

---

## 5) O que é `generateDueRecurringExpenses`

Arquivo: `src/db/automation.ts`

Essa função é um motor de recorrência.

```ts
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
```

### O que ela faz

- busca regras repetidas ativas
- seleciona apenas aquelas cuja `nextOccurrenceDate` já chegou
- dispara a criação das transações pendentes

Depois, dentro do loop:

```ts
while (!isAfter(parseISO(occurrenceDate), parseISO(referenceDate))) {
```

Ele gera ocorrências até a data atual.

Pra cada regra, faz:

- insere uma transação em `transactions`
- usa os dados da regra como base
- define `recurringRuleId`
- avança a data da próxima ocorrência

No fim:

```ts
await database.update(recurringExpenseRules).set({
  nextOccurrenceDate: occurrenceDate,
  nextInvoiceDueDate: invoiceDueDate,
  updatedAt: new Date().toISOString(),
});
```

Isso atualiza a próxima recorrência para o mês seguinte.

---

## 6) Criação de recorrência

Função: `createRecurringTransaction`

```ts
export async function createRecurringTransaction(
  database: Database,
  input: CreateRecurringTransactionInput,
): Promise<Transaction> {
  return database.transaction(async (transaction) => {
```

### O que essa função faz

1. gera `now = new Date().toISOString()`
2. insere a regra em `recurringExpenseRules`
3. calcula:
   - `nextOccurrenceDate`
   - `occurrenceDay`
   - `nextInvoiceDueDate`
   - `invoiceDueDay`
4. salva a transação inicial em `transactions`
5. vincula com `recurringRuleId`
6. retorna a transação criada

### Por que usa `database.transaction`?

Porque precisa garantir que duas operações aconteçam juntas:

- criar a regra recorrente
- criar a transação inicial

Se uma falhar, a outra não deve ficar “meio salva”.

Isso mantém o banco consistente.

---

## 7) Parcelamento

Função: `createInstallments`

```ts
export async function createInstallments(
  database: Database,
  input: CreateInstallmentsInput,
): Promise<Transaction> {
```

### O que ela faz

- recebe o valor total da compra
- calcula a divisão por quantidade de parcelas
- cria um `groupId` único para todas as parcelas
- gera várias transações, uma para cada parcela

Cada parcela recebe:

- `title`: "Compra (1/6)"
- `amountInCents`: valor ajustado
- `transactionDate`: data da parcela
- `invoiceDueDate`: vencimento da parcela
- `installmentGroupId`: mesmo grupo para todas
- `installmentNumber`
- `installmentCount`

Isso permite que o app mostre claramente cada parcela e também o conjunto total.

---

## 8) `getNextMonthlyDate`

```ts
export function getNextMonthlyDate(date: string, preferredDay: number): string {
  const nextMonth = addMonths(parseISO(date), 1);
  return format(
    setDate(nextMonth, Math.min(preferredDay, getDaysInMonth(nextMonth))),
    "yyyy-MM-dd",
  );
}
```

### O que faz

- pega uma data atual
- adiciona 1 mês
- mantém o mesmo dia do mês se possível
- se o mês seguinte não tiver esse dia, ajusta para o último dia válido

Exemplo:

- 31/01 -> próximo mês vira 28/02 ou 29/02 dependendo do mês

Isso evita erro de data inválida.

---

## 9) Fluxo prático de uso no app

### Caso 1: receita ou despesa normal

1. usuário cria uma transação na tela
2. app monta o objeto de transação
3. chama `database.insert(transactions).values(...)`
4. registro vai para `transactions`
5. dashboard/sumário lê o banco e recalcula saldo

### Caso 2: recorrência

1. usuário marca a opção de recorrência
2. app chama `createRecurringTransaction`
3. a função salva a regra em `recurringExpenseRules`
4. salva a transação inicial em `transactions`
5. na próxima vez que o app abrir ou quando a regra vencer, `generateDueRecurringExpenses` gera a próxima ocorrência automaticamente

### Caso 3: parcela

1. o usuário informa valor total e quantidade de parcelas
2. app chama `createInstallments`
3. Drizzle insere várias linhas em `transactions`
4. todas ficam ligadas ao mesmo `installmentGroupId`
5. telas de projeção e histórico sabem que são parcelas do mesmo pagamento

---

## 10) Por que esse desenho funciona bem

Esse design tem algumas vantagens importantes:

- banco local no celular
- sem depender de backend para operação básica
- leitura e escrita rápidas
- regras de negócio centralizadas
- persistência automática
- suporte a recorrência e parcelas sem duplicar lógica do app

---

## 11) Resumo final

As partes principais do banco local são:

- `provider.tsx` → inicia e expõe o banco
- `client.ts` → cria a conexão Drizzle
- `schema.ts` → define tabelas e regras
- `automation.ts` → cria recorrências e parcelas automaticamente

Em conjunto, isso permite que o app funcione como um controle financeiro local e offline, com regras automatizadas e dados persistidos no dispositivo.

---

## Arquivos mais importantes para consultar

- `src/db/provider.tsx`
- `src/db/client.ts`
- `src/db/schema.ts`
- `src/db/automation.ts`

Se quiser, no próximo passo eu posso criar um segundo documento mais técnico ainda, mostrando o fluxo completo de uma transação real desde a tela até o SQL executado no SQLite.
