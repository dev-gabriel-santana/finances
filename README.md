# Finances

MVP de finanças pessoais offline desenvolvido com React Native, Expo, Expo Router, TypeScript, SQLite e Drizzle ORM.

O aplicativo permite registrar receitas e despesas, acompanhar o saldo, visualizar o histórico, editar e excluir lançamentos, criar despesas recorrentes, projetar parcelamentos e consultar os meses seguintes.

## Stack

- React Native `0.86`
- Expo SDK `57`
- Expo Router
- TypeScript
- `expo-sqlite`
- Drizzle ORM e Drizzle Kit
- React Hook Form + Zod
- `react-native-gifted-charts`
- `date-fns`

## Pré-requisitos

- Node.js compatível com o Expo SDK 57
- npm
- Expo Go no dispositivo físico, ou
- Xcode para executar no iOS Simulator, ou
- Android Studio para executar no emulador Android

## Instalação

```bash
npm install
```

## Executar o projeto

Inicie o servidor do Expo:

```bash
npm start
```

Para limpar o cache do Metro quando houver alterações de configuração:

```bash
npx expo start --clear
```

Depois, use o QR Code no Expo Go ou escolha uma das opções:

```bash
npm run ios       # iOS Simulator ou dispositivo conectado
npm run android   # Android Emulator ou dispositivo conectado
npm run web       # navegador
```

Caso a porta padrão esteja ocupada, escolha outra porta:

```bash
npx expo start --port 8083
```

> Os recursos nativos usados pelo app, como SQLite e DateTimePicker, devem ser testados em Expo Go compatível ou em uma build nativa. O navegador é útil para validar a navegação e a interface, mas o suporte web do SQLite é experimental.

## Banco de dados

O banco local é `finances.db`, criado pelo `expo-sqlite`. Os dados ficam no dispositivo e continuam disponíveis depois que o aplicativo é fechado.

O Drizzle fornece:

- Schema tipado em `src/db/schema.ts`.
- Queries tipadas em `src/db/queries/transactions.ts`.
- Migrations SQL no diretório `drizzle/`.
- Integração com o Expo por meio de `drizzle-orm/expo-sqlite`.

As migrations são empacotadas no bundle pelo Babel e executadas na inicialização do app. O banco também utiliza WAL para melhorar o desempenho das escritas.

### Gerar uma migration

Depois de alterar `src/db/schema.ts`:

```bash
npm run db:generate
```

A migration gerada deve ser revisada e mantida no repositório. Não remova migrations já aplicadas em dispositivos existentes.

## Funcionalidades

### Dashboard

A tela inicial mostra:

- Saldo atual.
- Total de receitas.
- Total de despesas.
- Gráfico mensal do balanço.
- Últimos lançamentos.
- Atualização automática ao voltar para a tela.

### Receitas e despesas

Na tab **Lançamentos**, é possível criar:

- Receita.
- Despesa.
- Título obrigatório.
- Descrição opcional.
- Valor em reais, armazenado internamente em centavos.
- Categoria.
- Data do lançamento.
- Estabelecimento para despesas.
- Forma de pagamento.
- Cartão utilizado.
- Modalidade de débito ou crédito.
- Vencimento da fatura para cartão de crédito.

A validação condicional é feita com Zod. Campos que não se aplicam ao tipo de lançamento são ignorados antes da gravação.

### Detalhes, edição e exclusão

Cada lançamento da lista é clicável. A tela de detalhes permite:

- Consultar todos os dados do lançamento.
- Identificar uma despesa recorrente.
- Identificar a parcela atual de um parcelamento.
- Editar o lançamento.
- Excluir o lançamento após confirmação.

### Despesas recorrentes

Uma despesa pode ser marcada como recorrente mensal.

Quando isso acontece:

1. O lançamento inicial é salvo.
2. Uma regra é criada em `recurring_expense_rules`.
3. O app gera ocorrências vencidas automaticamente na inicialização e ao atualizar o dashboard.
4. A geração é idempotente e não duplica a mesma ocorrência.
5. O dia escolhido é preservado entre meses, inclusive depois de meses com menos dias.

As próximas projeções de uma recorrência são calculadas virtualmente. Assim, alterações feitas na regra podem aparecer imediatamente sem criar registros antecipados desatualizados.

### Parcelamentos

Parcelamentos estão disponíveis somente para despesas pagas com cartão de crédito.

- É possível informar de 1 a 60 parcelas.
- O app mostra uma prévia do valor da parcela.
- Cada parcela é criada com sua própria data e vencimento.
- O total é dividido em centavos sem perda de arredondamento.
- As parcelas recebem um grupo comum e identificadores como `1/10`, `2/10` e `3/10`.
- Uma despesa recorrente não pode ser parcelada.

### Projeções

A tab **Projeções** mostra os lançamentos dos meses seguintes em grupos mensais.

É possível selecionar:

- Próximos 6 meses.
- Próximos 12 meses.
- Próximos 24 meses.

A tela combina parcelas já materializadas com ocorrências virtuais das regras recorrentes e apresenta:

- Saldo projetado do período.
- Receitas e despesas futuras.
- Total de despesas por mês.
- Identificação de parcelas e recorrências.
- Acesso aos detalhes dos lançamentos que já existem no banco.

## Tema

O app possui tema claro e escuro.

- A preferência inicial acompanha o sistema operacional.
- A escolha pode ser alternada pelo botão de lua/sol.
- A preferência é persistida localmente usando `expo-sqlite/kv-store`.
- Dashboard, formulários, gráficos, tabs, detalhes e projeções acompanham o tema selecionado.

## Estrutura principal

```text
app/
├── (tabs)/
│   ├── index.tsx                 # Dashboard
│   ├── transactions.tsx         # Histórico e ações de criação
│   ├── projections.tsx          # Meses futuros
│   └── _layout.tsx
└── transactions/
    ├── expense.tsx              # Nova despesa
    ├── income.tsx               # Nova receita
    ├── [id].tsx                 # Detalhes
    └── [id]/edit.tsx             # Edição

src/
├── components/
│   ├── dashboard/
│   ├── forms/
│   └── ui/
├── db/
│   ├── automation.ts            # Recorrências e parcelas
│   ├── projections.ts           # Consultas dos meses futuros
│   ├── queries/
│   ├── schema.ts
│   └── provider.tsx
├── hooks/
├── schemas/
├── theme/
└── utils/

drizzle/                         # Migrations SQL versionadas
```

## Validação local

Verifique os tipos do projeto:

```bash
npx tsc --noEmit
```

Gere um bundle iOS para validar o Metro, as rotas e as migrations empacotadas:

```bash
npx expo export --platform ios --output-dir "$TMPDIR/finances-export"
```

## Observações

- Valores monetários são armazenados como inteiros em centavos para evitar erros de ponto flutuante.
- O MVP não possui sincronização com servidor ou autenticação.
- Os cartões disponíveis atualmente são mockados em `src/constants/transactions.ts`.
- O banco local é ignorado pelo `.gitignore`; as migrations continuam versionadas.
