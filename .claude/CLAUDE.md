# Instruções do projeto

## Contexto

- Este é um aplicativo Expo SDK 57 com React Native 0.86 e expo-router.
- O frontend usa TypeScript, expo-sqlite e Drizzle ORM.
- O backend fica em `backend/` e usa Express, Prisma e PostgreSQL.
- Leia `AGENTS.md` e `CLAUDE.md` na raiz antes de mudanças relevantes.

## Regras gerais

- Consulte a documentação versionada do Expo SDK 57 antes de usar ou alterar APIs do Expo.
- Preserve as convenções existentes e faça alterações pequenas e focadas.
- Valores monetários devem permanecer em centavos (`amountInCents`).
- Datas persistidas devem seguir o formato ISO `yyyy-MM-dd`.
- Não exponha segredos, tokens ou variáveis sensíveis em código, logs ou commits.
- Após editar, execute a validação mais específica disponível para a área alterada.
- Não altere migrations, schema ou arquivos nativos gerados sem entender o impacto.

## Comandos principais

- Frontend: `npm test`, `npx expo start`, `npx expo run:android`, `npx expo run:ios`
- Banco local: `npm run db:generate`
- Backend: `cd backend && npm run dev`
