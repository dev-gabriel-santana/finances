---
name: expo-mobile
description: "Use when modifying Expo, React Native, expo-router, app.json, native Android/iOS configuration, icons, splash screens, permissions, or platform builds."
argument-hint: "Describe the Expo or native mobile change"
user-invocable: true
---

# Desenvolvimento mobile Expo

## Quando usar

- Alterar telas em `app/` ou componentes React Native.
- Alterar `app.json`, plugins Expo, ícones, splash screen ou permissões.
- Gerar ou testar projetos Android/iOS nativos.
- Investigar erros de Metro, Gradle, CocoaPods ou autolinking.

## Procedimento

1. Confirme a versão do Expo em `package.json` e consulte a documentação de `https://docs.expo.dev/versions/v57.0.0/` antes de usar APIs do Expo.
2. Preserve o roteamento baseado em arquivos do `expo-router`.
3. Para mudanças de configuração, valide com `npx expo config --json`.
4. Para recursos nativos gerados, use `npx expo prebuild --platform android --no-install` ou o equivalente da plataforma somente quando necessário.
5. Teste a fatia alterada com `npm test`, `npx expo run:android` ou `npx expo run:ios`.
6. Se o erro for de Gradle ou CocoaPods, diferencie falha de código de falha de ambiente, espaço em disco ou cache.

## Convenções

- Use `useAppTheme` e os componentes existentes antes de criar novos padrões visuais.
- Mantenha valores monetários em centavos e formate apenas na apresentação.
- Use `date-fns` para manipulação de datas.
- Não edite recursos nativos gerados manualmente se a origem correta for `app.json` ou um config plugin.
