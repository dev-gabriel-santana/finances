---
name: backend-api
description: "Use when modifying the Express backend, authentication, JWT, Prisma, PostgreSQL, API routes, environment validation, CORS, rate limiting, or encrypted fields."
argument-hint: "Describe the backend or API change"
user-invocable: true
---

# Desenvolvimento do backend

## Quando usar

- Alterar arquivos em `backend/src/` ou `backend/prisma/`.
- Criar ou modificar rotas, serviços, schemas de validação e middleware.
- Alterar autenticação, tokens, criptografia, CORS ou rate limiting.

## Procedimento

1. Leia o fluxo existente da rota, serviço, schema e middleware antes de editar.
2. Valide entradas com Zod e mantenha respostas de erro consistentes com `backend/src/errors.ts`.
3. Nunca registre tokens, chaves, senhas ou dados sensíveis.
4. Preserve o fluxo JWT de access token e refresh token.
5. Para mudanças no Prisma, avalie migration, compatibilidade e impacto em dados existentes.
6. Execute os testes disponíveis e valide o TypeScript do backend antes de concluir.

## Segurança

- Mantenha Helmet, CORS restrito e rate limit nas rotas de autenticação.
- Use as chaves e variáveis definidas em `backend/src/env.ts`.
- Não aceite identificadores ou permissões vindos do cliente sem autorização no servidor.
- Prefira mensagens de erro que não revelem se um usuário ou recurso existe.
