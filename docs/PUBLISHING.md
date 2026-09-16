# Passo a passo — Publicar o GFin na Google Play

Guia prático para levar a v1.0.0 do GFin do repositório até o Internal Testing da Google Play usando EAS Build + EAS Submit. Marque os itens conforme for completando.

---

## 0. Pré-requisitos

- [ ] Conta Google Play Console ativa (taxa única de US$ 25 paga)
- [ ] Conta Google Cloud (mesma conta Google já dá acesso)
- [ ] Conta Expo (`eas login`)
- [ ] Node + npm instalados
- [ ] Android SDK Platform Tools (`adb` no PATH) — só para os screenshots
- [ ] Um device Android físico para smoke test (opcional, mas recomendado)

---

## 1. Preparação do código (uma vez)

- [ ] Confirmar `version` em [app.json](../app.json) = `1.0.0`
- [ ] Confirmar `package`/`bundleIdentifier` = `com.gsantana.financas`
- [ ] Rodar `npm install`
- [ ] Rodar `npx tsc --noEmit` (sem erros)
- [ ] Rodar `npm test` (tudo verde)
- [ ] `npx expo prebuild --clean` para regenerar `android/` e `ios/` com o novo nome/package

Se quiser um repo mais limpo, pode **deletar as pastas `android/` e `ios/`** — o EAS Build regenera no cloud a partir do `app.json`.

---

## 2. Criar app no Google Play Console

1. Acesse https://play.google.com/console e clique em **Criar app**.
2. Preencha:
   - Nome do app: **GFin**
   - Idioma padrão: Português (Brasil)
   - App ou jogo: App
   - Gratuito ou pago: Gratuito
   - Declarações obrigatórias: aceitar
3. Confirme. O app aparece no dashboard com status "Rascunho".
4. Anote o **applicationId** que o Console mostra — deve ser `com.gsantana.financas`. Se você errar aqui, não dá para mudar depois.

---

## 3. Criar Service Account para o EAS Submit

Isso permite o `eas submit` enviar builds sem intervenção manual.

1. No **Google Cloud Console** (https://console.cloud.google.com):
   - Crie ou selecione um projeto (ex.: `gfin-play`).
   - **APIs & Services → Library** → habilite **Google Play Android Developer API**.
   - **IAM & Admin → Service Accounts → Create service account**:
     - Nome: `gfin-play-submit`
     - Role: em branco (a permissão real vem do Play Console)
   - Depois de criar, abra a service account → **Keys → Add key → JSON** → salve como `play-service-account.json` na **raiz do projeto**.
   - O arquivo já está ignorado no [.gitignore](../.gitignore).
2. No **Play Console** → **Users and permissions → Invite new users**:
   - E-mail: o endereço da service account (algo tipo `gfin-play-submit@gfin-play.iam.gserviceaccount.com`).
   - Marcar apenas o app **GFin**.
   - Permissões: **Release manager** (ou **Admin** apenas para o app).
   - Salvar e aguardar alguns minutos para propagar.

---

## 4. Política de privacidade (obrigatória)

1. Substituir o placeholder `[SEU_EMAIL_DE_CONTATO]` em [docs/PRIVACY_POLICY.md](PRIVACY_POLICY.md) pelo seu e-mail real.
2. Publicar numa URL pública. Caminho mais rápido: **GitHub Pages**.
   - No repo GitHub → **Settings → Pages** → Source: `main` / `/docs`.
   - Aguardar alguns minutos.
   - URL fica em `https://<seu-user>.github.io/finances/PRIVACY_POLICY`.
3. Guardar a URL — vai no Play Console.

---

## 5. Ativos gráficos

Todos vão no Play Console em **Main store listing**.

- [ ] Ícone alta res. **512×512 PNG** — pode gerar de `assets/images/icon.png`:
  ```bash
  sips -Z 512 -s format png assets/images/icon.png --out store-assets/icon-512.png
  ```
- [ ] Feature graphic **1024×500 PNG** — precisa criar (Figma/Canva).
  - Sugestão: fundo escuro `#0A0F0D`, "GFin" grande + tagline "Controle financeiro 100% offline".
- [ ] Screenshots de phone (mínimo 2, ideal 4–8):
  1. Rode `npm run android` e deixe o app aberto com dados de exemplo.
  2. Rode `npm run screenshots` e siga o roteiro.
  3. Arquivos salvos em `store-assets/screenshots/`.

---

## 6. Build de produção com EAS

1. Uma vez: `npm install -g eas-cli` e `eas login`.
2. Confirmar projeto vinculado: `eas whoami` e `eas project:info`.
3. Buildar o AAB:
   ```bash
   eas build --platform android --profile production
   ```
4. Aguardar (10–20 min). Ao final o EAS retorna:
   - URL para baixar o `.aab`
   - versionCode auto-incrementado (armazenado remotamente no EAS)

---

## 7. Smoke test antes de submeter

- [ ] Baixe o AAB do link do EAS.
- [ ] Instale no device físico via `bundletool` **ou** faça um build APK só para teste: `eas build --platform android --profile preview` (usa APK).
- [ ] Fluxos a validar:
  - [ ] Onboarding de saldo inicial
  - [ ] Criar despesa em dinheiro
  - [ ] Criar despesa no cartão de crédito parcelada
  - [ ] Criar receita recorrente
  - [ ] Ver Projeções
  - [ ] Alternar tema claro/escuro
  - [ ] Limpar todos os lançamentos
  - [ ] Fechar e reabrir o app (migrations rodam sem crash)

---

## 8. Enviar para Internal Testing

```bash
eas submit --platform android --profile production
```

Isso pega o último build de produção e sobe para o track **Internal Testing**. Se der erro de autenticação, verifique se:

- `play-service-account.json` está na raiz
- A service account tem permissão no Play Console para o app GFin
- A Google Play Android Developer API está habilitada

---

## 9. Configurar o app no Play Console

Enquanto o build é processado (pode levar de minutos a algumas horas), preencha as seções obrigatórias:

### Main store listing

- Nome: **GFin**
- Descrição curta: (copiar de [STORE_LISTING.md](STORE_LISTING.md))
- Descrição completa: (copiar de [STORE_LISTING.md](STORE_LISTING.md))
- Ícone 512×512, feature graphic 1024×500
- Screenshots
- Categoria: **Finanças**
- Tags: até 5 sugeridas em [STORE_LISTING.md](STORE_LISTING.md)
- E-mail de contato + URL da política de privacidade

### App content

- **Privacy policy**: URL do GitHub Pages
- **App access**: sem login, todo conteúdo acessível
- **Ads**: não contém anúncios
- **Content rating**: responder IARC → "livre para todos"
- **Target audience**: 18+ (ou o que preferir)
- **News app**: não
- **Data safety**: nenhum dado coletado ou compartilhado
- **Government app**: não
- **Financial features**: sem transações reais / sem crypto / sem empréstimo

### Internal testing

- Criar release usando o build enviado pelo EAS
- Adicionar até 100 e-mails de testers
- Publicar release para Internal Testing

O **opt-in URL** aparece após publicar. Compartilhe com os testers.

---

## 10. Validação

- [ ] Instalar via link de Internal Testing no seu device
- [ ] Rodar por alguns dias sem crash / bug crítico
- [ ] Coletar feedback dos testers

---

## 11. Promover para produção

Quando estiver confiante:

1. Play Console → **Production → Create new release**
2. Escolher o mesmo build (ou um novo `eas build` + `eas submit --track production`)
3. Notas da release
4. Enviar para revisão (o Google leva de algumas horas a alguns dias)

---

## Referência rápida de comandos

```bash
# Preparo
npm install
npx tsc --noEmit
npm test
npx expo prebuild --clean

# Screenshots
npm run android          # em um terminal
npm run screenshots      # em outro

# Build
eas login
eas build --platform android --profile production

# Publicar
eas submit --platform android --profile production
```

---

## Checklist final antes de clicar "publicar"

- [ ] Política de privacidade acessível na URL informada
- [ ] E-mail de contato preenchido (não é gmail pessoal se não quiser expor)
- [ ] Data Safety respondida
- [ ] Content rating gerado
- [ ] Target audience definido
- [ ] Screenshots e ícone 512×512 subidos
- [ ] Feature graphic 1024×500 subida
- [ ] Descrições curta e completa preenchidas
- [ ] Build de produção sem crash em device físico
- [ ] Testers convidados
