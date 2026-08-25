# Finances

MVP de finanças pessoais offline desenvolvido com React Native, Expo, Expo Router, TypeScript, SQLite e Drizzle ORM.

O aplicativo permite registrar receitas e despesas, acompanhar o saldo, visualizar o histórico, editar e excluir lançamentos, criar despesas recorrentes, projetar parcelamentos e consultar os meses seguintes.

## Sumário

- [Stack](#stack)
- [Identidade do app](#identidade-do-app)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Executar o projeto](#executar-o-projeto)
- [Como usar o app](#como-usar-o-app)
- [Backend](#backend)
  - [Configuração inicial](#configuração-inicial-executar-uma-vez)
  - [Erro de acesso ao banco](#erro-de-acesso-ao-banco-p1010)
  - [Executar em desenvolvimento](#executar-em-desenvolvimento)
  - [Abrir o banco com Prisma Studio](#abrir-o-banco-com-prisma-studio)
  - [Variáveis de ambiente](#variáveis-de-ambiente-relevantes)
  - [Rotas disponíveis](#rotas-disponíveis)
  - [Conectar o app ao backend](#conectar-o-app-ao-backend)
- [Banco de dados](#banco-de-dados)
- [Bloqueio biométrico](#bloqueio-biométrico)
- [Tema](#tema)
- [Estrutura principal](#estrutura-principal)
- [Validação local](#validação-local)
- [Observações](#observações)

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

## Identidade do app

- Nome exibido: **Finanças**.
- Ícone principal: `assets/images/icon.png`.
- Ícones adaptativos do Android: `assets/images/android-icon-*.png`.
- Splash screen: `assets/images/splash-icon.png`.
- Fundo da splash em modo claro: `#16211D`.
- Fundo da splash em modo escuro: `#0A0F0D`.

Alterações no nome, ícone ou splash são nativas. Para visualizá-las no aplicativo instalado, gere uma nova build:

```bash
npx expo prebuild --clean
npx expo run:ios
npx expo run:android
```

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

## Como usar o app

### 1. Abrir o aplicativo

1. Inicie o projeto com `npm start`.
2. Abra o app pelo Expo Go, Simulator ou em uma development build.
3. Se a biometria estiver disponível e cadastrada no dispositivo, confirme com Face ID, Touch ID ou impressão digital.
4. Caso o app volte do background, a autenticação será solicitada novamente.

No Web ou em um dispositivo sem biometria disponível, o bloqueio biométrico é ignorado para permitir o uso do MVP.

### 2. Cadastrar categorias

1. Abra a tab **Cadastros**.
2. Toque em **Categorias**.
3. Informe o nome da categoria.
4. Selecione uma cor predefinida.
5. Selecione um ícone ou informe um ícone personalizado.
6. Toque em **Adicionar categoria**.
7. Para consultar somente os registros cadastrados, toque em **Ver todas as categorias**.

Na tela de listagem é possível remover uma categoria após confirmação.

### 3. Cadastrar cartões

1. Abra a tab **Cadastros**.
2. Toque em **Cartões**.
3. Informe o nome do cartão.
4. Informe a bandeira, como Visa ou Mastercard.
5. Informe o dia de fechamento da fatura, entre 1 e 31.
6. Toque em **Adicionar cartão**.
7. Para consultar somente os registros cadastrados, toque em **Ver todos os cartões**.

Na tela de listagem é possível remover um cartão após confirmação.

### 4. Criar uma despesa

1. Abra a tab **Lançamentos**.
2. Toque em **Despesa**.
3. Preencha título, valor, categoria e data.
4. Opcionalmente, informe o estabelecimento.
5. Selecione a forma de pagamento.
6. Se for cartão, selecione o cartão cadastrado e a modalidade.
7. Se for crédito, informe o vencimento da primeira fatura.
8. Toque em **Salvar lançamento**.

As categorias e os cartões exibidos no formulário vêm diretamente do SQLite.

### 5. Criar uma receita

1. Abra a tab **Lançamentos**.
2. Toque em **Receita**.
3. Preencha título, valor, categoria e data.
4. Toque em **Salvar lançamento**.

Para um salário ou outra entrada mensal, ative **Receita recorrente** antes de salvar.

### 6. Criar recorrências e parcelas

Para uma despesa mensal, ative **Despesa recorrente**. Para uma receita mensal, ative **Receita recorrente**. O app gera as ocorrências mensais automaticamente.

Para parcelar uma compra:

1. Crie uma despesa.
2. Selecione **Cartão** e a modalidade **Crédito**.
3. Informe o vencimento da primeira fatura.
4. Informe o número de parcelas.
5. Confira a prévia do valor de cada parcela.
6. Salve o lançamento.

O parcelamento só está disponível para cartão de crédito e não pode ser combinado com recorrência.

### 7. Consultar, editar e excluir

1. Na tab **Lançamentos**, toque em qualquer lançamento.
2. A tela de detalhes mostra os dados, recorrência ou parcela.
3. Toque em **Editar lançamento** para alterar os dados.
4. Toque em **Excluir lançamento** para remover um registro após confirmação.

### 8. Consultar projeções mensais

1. Abra a tab **Projeções**.
2. O mês atual será exibido inicialmente.
3. Use as setas para navegar pelos meses restantes do ano atual.
4. Consulte as barras de receitas e despesas do mês.
5. Veja abaixo os lançamentos previstos, parcelas e recorrências.

### 9. Limpar lançamentos

Para apagar todos os dados de movimentação:

1. Abra **Cadastros**.
2. Role até **Dados de lançamentos**.
3. Toque em **Limpar todos os lançamentos**.
4. Confirme a operação.

Essa ação remove receitas, despesas, parcelas e regras recorrentes. Cartões e categorias são preservados.

## Backend

O backend fica em `backend/` e expõe uma API REST construída com Express, Prisma e PostgreSQL.

### Pré-requisitos

- PostgreSQL rodando localmente ou em um serviço gerenciado.
- Node.js compatível com o backend (veja `backend/.nvmrc` se existir).

### Configuração inicial (executar uma vez)

```bash
cd backend
npm install
```

Copie o arquivo de variáveis de ambiente e preencha os valores:

```bash
cp .env.example .env
```

Gere o par de chaves RSA-4096 e as chaves simétricas de criptografia:

```bash
npm run keys:generate
```

Cole as quatro linhas geradas no `.env`. Em seguida, preencha a `DATABASE_URL` com as credenciais do seu PostgreSQL:

```
DATABASE_URL="<STRING_DE_CONEXAO_DO_POSTGRES>"
```

Nunca commite o arquivo `.env` nem publique chaves, senhas ou tokens. Use o `.env.example` apenas como modelo.

Crie as tabelas no banco via Prisma Migrate:

```bash
npm run db:migrate
```

#### Erro de acesso ao banco (`P1010`)

Se aparecer `User ... was denied access on the database finances_db.public`, verifique se o PostgreSQL está rodando:

```bash
pg_isready -h localhost -p 5432
```

Confirme também que o `DATABASE_URL` em `backend/.env` está preenchido com os dados do seu ambiente local. Não coloque credenciais reais no README:

```env
DATABASE_URL="<STRING_DE_CONEXAO_DO_POSTGRES>"
```

Se o usuário ou o banco ainda não existirem, crie-os conectado a um usuário administrador do PostgreSQL:

```bash
psql -d postgres
```

```sql
CREATE ROLE finances_user WITH LOGIN PASSWORD 'SUA_SENHA';
CREATE DATABASE finances_db OWNER finances_user;
\q
```

Depois, atualize o `DATABASE_URL` local com esses valores e execute novamente:

```bash
cd backend
npm run db:migrate
```

Se o banco já existir, conceda a permissão ao usuário configurado no `DATABASE_URL`:

```sql
GRANT ALL PRIVILEGES ON DATABASE <NOME_DO_BANCO> TO <USUARIO_POSTGRES>;
```

### Executar em desenvolvimento

```bash
npm run dev
```

O servidor sobe na porta definida em `PORT` (padrão `3000`).

### Abrir o banco com Prisma Studio

Para consultar os dados do PostgreSQL do backend em uma interface visual:

```bash
cd backend
npm run db:studio
```

Abra [http://localhost:5555](http://localhost:5555) no navegador. Mantenha o comando em execução enquanto usa o Prisma Studio e pressione `Ctrl+C` para encerrá-lo.

O Prisma Studio mostra os dados do PostgreSQL, como usuários. Os lançamentos financeiros do app ficam no SQLite local (`finances.db`) e não aparecem nessa ferramenta.

### Variáveis de ambiente relevantes

| Variável                 | Descrição                                                 |
| ------------------------ | --------------------------------------------------------- |
| `DATABASE_URL`           | Connection string do PostgreSQL                           |
| `JWT_PRIVATE_KEY_BASE64` | Chave privada RSA-4096 em Base64 (gerada pelo script)     |
| `JWT_PUBLIC_KEY_BASE64`  | Chave pública RSA-4096 em Base64 (gerada pelo script)     |
| `FIELD_ENCRYPTION_KEY`   | 64 hex chars (32 bytes) para AES-256-GCM                  |
| `FIELD_HMAC_KEY`         | 64 hex chars (32 bytes) para índices HMAC                 |
| `CORS_ORIGIN`            | Origem permitida pelo CORS (ex.: `http://localhost:8081`) |
| `PORT`                   | Porta do servidor (padrão `3000`)                         |

### Rotas disponíveis

| Método | Rota             | Descrição                    |
| ------ | ---------------- | ---------------------------- |
| `POST` | `/auth/register` | Cria uma conta               |
| `POST` | `/auth/login`    | Autentica e retorna tokens   |
| `POST` | `/auth/refresh`  | Renova o access token        |
| `POST` | `/auth/logout`   | Revoga o refresh token       |
| `GET`  | `/users/me`      | Dados do usuário autenticado |
| `GET`  | `/health`        | Liveness probe               |

### Conectar o app ao backend

Crie um arquivo `.env` na raiz do app (junto ao `package.json`) e defina:

```
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:3000
```

Use o IP da máquina na rede local (não `localhost`) para que o dispositivo físico consiga alcançar o servidor.

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

## Bloqueio biométrico

O app usa `expo-local-authentication` para proteger o acesso aos dados financeiros.

- A autenticação acontece antes da renderização das rotas financeiras.
- O app pode usar impressão digital, Touch ID ou Face ID, conforme o dispositivo.
- O código de desbloqueio do dispositivo é oferecido como fallback pelo sistema.
- O app volta a exigir autenticação quando retorna do background.
- No Web e em dispositivos sem hardware ou biometria cadastrada, o gate é ignorado para não bloquear o uso do MVP.

Para testar Face ID no iOS, use uma development build ou o iOS Simulator configurado com Face ID. O Face ID não é suportado no Expo Go.

Depois de alterar a configuração nativa em `app.json`, gere uma nova build:

```bash
npx expo run:ios
npx expo run:android
```

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
│   ├── settings/
│   │   ├── index.tsx            # Entrada da tab Cadastros
│   │   ├── cards.tsx            # Tela interna de cartões
│   │   ├── categories.tsx       # Tela interna de categorias
│   │   ├── cards-list.tsx       # Lista completa de cartões
│   │   ├── categories-list.tsx  # Lista completa de categorias
│   │   └── _layout.tsx          # Stack de Cadastros
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
- O MVP não possui sincronização com servidor.
- Cartões e categorias são cadastrados e armazenados no SQLite pelas telas internas da tab **Cadastros**.
- O banco local é ignorado pelo `.gitignore`; as migrations continuam versionadas.
