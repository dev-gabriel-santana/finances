---
name: database-testing
description: "Use when changing Drizzle SQLite schemas, queries, migrations, recurring transactions, projections, Prisma models, or Vitest tests."
argument-hint: "Describe the schema, query, migration, or test change"
user-invocable: true
---

# Banco de dados e testes

## Quando usar

- Alterar `src/db/`, `drizzle/`, `backend/prisma/` ou testes Vitest.
- Modificar transações recorrentes, parcelamentos, projeções ou consultas.
- Criar migrations ou corrigir regressões de persistência.

## Procedimento

1. Leia o schema e as queries relacionadas antes de editar.
2. Preserve `amountInCents` como inteiro positivo e os tipos de transação existentes.
3. Preserve datas ISO `yyyy-MM-dd` no SQLite.
4. Para migrations, gere o arquivo com `npm run db:generate`; não edite snapshots gerados sem necessidade.
5. Cubra casos de borda: lista vazia, duplicidade, datas de vencimento, parcelas e recorrências já materializadas.
6. Execute o teste mais específico e depois `npm test` quando a mudança afetar comportamento compartilhado.

## Testes

- Prefira testes determinísticos e independentes de rede.
- Use banco temporário ou fixture isolada.
- Verifique totais de receitas, despesas e saldo em centavos.
- Ao corrigir uma regressão, adicione primeiro um teste que falhe com o comportamento anterior.
