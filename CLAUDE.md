@AGENTS.md

# Finanças — Documentação do Projeto

## Visão Geral

Aplicativo mobile de controle financeiro pessoal construído com **Expo (React Native)**. Permite registrar receitas e despesas, gerenciar cartões e categorias, visualizar projeções futuras e sincronizar dados com um backend Node.js.

- **Frontend:** Expo ~57 · React Native 0.86 · expo-router (file-based routing) · TypeScript 6
- **Banco de dados local:** expo-sqlite + Drizzle ORM (SQLite on-device)
- **Backend:** Express + Prisma + PostgreSQL (pasta `backend/`)
- **Validação de formulários:** react-hook-form + Zod
- **Testes:** Vitest

---

## Estrutura de Pastas

```
app/                    # Rotas (expo-router)
  _layout.tsx           # Root layout: providers, auth guard, biometria
  (tabs)/               # Tab bar principal
    index.tsx           # Dashboard
    transactions.tsx    # Lista de transações
    cards.tsx           # Cartões
    categories.tsx      # Categorias
    projections.tsx     # Projeções futuras
    settings/           # Configurações (cartões, categorias)
  auth/                 # Login / Cadastro
  transactions/         # Formulários de transação ([id].tsx, expense.tsx, income.tsx)

src/
  api/                  # Funções fetch para o backend (auth.ts)
  auth/                 # AuthContext (JWT + SecureStore)
  components/
    dashboard/          # BalanceChart, BalanceSummary, TransactionList
    forms/              # CurrencyInput, DateField, SelectField, TextField, TransactionForm
    settings/           # Componentes de configurações
    ui/                 # ThemeToggle
  constants/
    api.ts              # API_BASE_URL via EXPO_PUBLIC_API_URL
    storageKeys.ts      # Chaves do KV Store
    transactions.ts     # Listas de categorias e opções de select
  db/
    schema.ts           # Tabelas Drizzle (cards, categories, transactions, recurringExpenseRules)
    client.ts           # createDatabase()
    provider.tsx        # DatabaseProvider + useDatabase()
    automation.ts       # createRecurringTransaction, createInstallments, generateDueRecurringExpenses
    projections.ts      # getFutureProjections()
    queries/            # transactions.ts, cards-categories.ts
  hooks/                # useDashboard, useTransaction
  schemas/              # Schemas Zod para formulários (transaction-form.ts)
  security/             # BiometricGate.tsx
  theme/                # AppThemeProvider, useAppTheme
  utils/                # currency, etc.

backend/
  src/
    app.ts              # Express app (helmet, cors, rate-limit)
    auth/               # routes, service, middleware, schemas
    users/              # routes do usuário
    env.ts              # Validação de variáveis de ambiente com Zod
  prisma/
    schema.prisma       # Modelos: User, tokens (PostgreSQL)

drizzle/                # Migrations SQLite geradas pelo drizzle-kit
```

---

## Schema do Banco de Dados Local (SQLite / Drizzle)

### `transactions`

| Campo                                    | Tipo                        | Descrição                           |
| ---------------------------------------- | --------------------------- | ----------------------------------- |
| `id`                                     | integer PK                  | Auto-increment                      |
| `type`                                   | `'income' \| 'expense'`     | Tipo da transação                   |
| `title`                                  | text                        | Nome/descrição curta                |
| `amountInCents`                          | integer                     | Valor em centavos (sempre positivo) |
| `category`                               | text                        | Categoria da transação              |
| `transactionDate`                        | text (ISO)                  | Data da transação                   |
| `paymentMethod`                          | `'card' \| 'cash' \| 'pix'` | Método de pagamento                 |
| `paymentModality`                        | `'debit' \| 'credit'`       | Modalidade                          |
| `cardId`                                 | text                        | FK para card (quando method=card)   |
| `recurringRuleId`                        | integer                     | FK para `recurring_expense_rules`   |
| `installmentGroupId`                     | text                        | UUID do grupo de parcelamento       |
| `installmentNumber` / `installmentCount` | integer                     | Parcela atual / total               |

### `recurring_expense_rules`

Regras para despesas/receitas recorrentes mensais. Ao chamar `generateDueRecurringExpenses`, o sistema cria automaticamente as transações vencidas com base em `nextOccurrenceDate`.

### `cards`

| Campo        | Descrição                          |
| ------------ | ---------------------------------- |
| `name`       | Nome único do cartão               |
| `brand`      | Bandeira                           |
| `closingDay` | Dia de fechamento da fatura (1-31) |

### `categories`

Categorias customizáveis com `name`, `color` e `icon`.

---

## Autenticação

- Fluxo: **JWT (access + refresh token)**
- O `accessToken` é guardado em memória (`useState`)
- O `refreshToken` é persistido no `expo-secure-store`
- O `AuthContext` tenta restaurar a sessão na inicialização via `apiRefresh`
- Proteção biométrica extra via `BiometricGate` (Face ID / impressão digital)

---

## Categorias de Transação (constantes fixas)

**Despesas:** Alimentação, Moradia, Transporte, Saúde, Educação, Lazer, Outros  
**Receitas:** Salário, Freelance, Investimentos, Presente, Outros

---

## Projeções Futuras

`getFutureProjections(database, monthCount)` retorna os próximos N meses com:

- Transações já registradas no período
- Ocorrências virtuais de regras recorrentes ainda não materializadas
- Totais de `incomeInCents`, `expenseInCents` e `balanceInCents` por mês

---

## Backend (Express + Prisma + PostgreSQL)

- **Porta padrão:** 3000
- **Rotas:**
  - `POST /auth/register` — cadastro
  - `POST /auth/login` — login, retorna `{accessToken, refreshToken}`
  - `POST /auth/refresh` — renova tokens
  - `POST /auth/logout` — invalida refresh token
  - `GET /health` — health check
- **Segurança:** helmet, CORS restrito, rate-limit em `/auth`, JWT RS256, criptografia de campos sensíveis

### Variáveis de ambiente do backend

```
DATABASE_URL
JWT_PRIVATE_KEY_BASE64
JWT_PUBLIC_KEY_BASE64
FIELD_ENCRYPTION_KEY   # 64 chars hex (32 bytes)
FIELD_HMAC_KEY         # 64 chars hex (32 bytes)
CORS_ORIGIN
REFRESH_TOKEN_EXPIRY_DAYS
```

---

## Variáveis de Ambiente do App

```
EXPO_PUBLIC_API_URL    # URL base do backend (padrão: http://localhost:3000)
```

---

## Comandos Principais

```bash
# App
npm start                  # Expo dev server
npm run android            # Build e run no Android
npm run ios                # Build e run no iOS
npm run db:generate        # Gera migrations SQLite (drizzle-kit)
npm test                   # Roda testes (Vitest)

# Backend
cd backend && npm run dev  # Servidor de desenvolvimento
```

---

## Convenções do Projeto

- **Valores monetários** são sempre em centavos (`amountInCents`) — usar `formatCurrency` de `src/utils/currency` para exibição
- **Datas** são strings ISO `yyyy-MM-dd` no banco; usar `date-fns` para manipulação
- **Alias de importação:** `@/` aponta para a raiz do workspace (ver `tsconfig.json`)
- **Tema:** suporte a light/dark automático via `AppThemeProvider`; hooks via `useAppTheme`
- Expo SDK **57** — sempre consultar https://docs.expo.dev/versions/v57.0.0/ antes de usar APIs do Expo
