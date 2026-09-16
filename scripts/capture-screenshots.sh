#!/usr/bin/env bash
# Captura screenshots do emulador Android para uso na Google Play.
# Uso: bash scripts/capture-screenshots.sh
#
# Requisitos:
#   - Emulador Android já rodando (npm run android)
#   - adb disponível no PATH (Android SDK Platform Tools)
#
# Fluxo:
#   O script pede que voce navegue ate cada tela e pressione ENTER
#   para capturar. Salva PNGs em store-assets/screenshots/.

set -euo pipefail

OUTPUT_DIR="store-assets/screenshots"
mkdir -p "$OUTPUT_DIR"

if ! command -v adb >/dev/null 2>&1; then
  echo "Erro: adb nao encontrado no PATH. Instale o Android SDK Platform Tools." >&2
  exit 1
fi

DEVICE_COUNT=$(adb devices | awk 'NR>1 && $2=="device"' | wc -l | tr -d ' ')
if [ "$DEVICE_COUNT" -eq 0 ]; then
  echo "Erro: nenhum emulador/dispositivo Android conectado. Rode 'npm run android' primeiro." >&2
  exit 1
fi

# Screens: filename|descricao mostrada ao usuario
SCREENS=(
  "01-dashboard|Dashboard (tab Inicio) com saldo e resumo"
  "02-transactions|Lista de Lancamentos (tab Lancamentos)"
  "03-new-expense|Formulario Nova despesa preenchido"
  "04-new-income|Formulario Nova receita preenchido"
  "05-projections|Projecoes (tab Projecoes) com barras do mes"
  "06-settings|Cadastros (tab Cadastros)"
  "07-categories|Lista de categorias em Cadastros"
  "08-cards|Lista de cartoes em Cadastros"
)

echo "Salvando em: $OUTPUT_DIR"
echo "Total de telas: ${#SCREENS[@]}"
echo

for entry in "${SCREENS[@]}"; do
  name="${entry%%|*}"
  description="${entry##*|}"
  target="$OUTPUT_DIR/${name}.png"

  echo "-> $description"
  read -r -p "   Navegue ate a tela e pressione ENTER para capturar (s = pular): " answer
  if [ "$answer" = "s" ] || [ "$answer" = "S" ]; then
    echo "   pulado."
    continue
  fi

  adb exec-out screencap -p > "$target"
  echo "   salvo: $target"
  echo
done

echo "Concluido. Arquivos em $OUTPUT_DIR:"
ls -1 "$OUTPUT_DIR"

cat <<'NOTE'

Proximos passos:
  - Revise cada PNG e refaca os que ficaram com dados de teste ruins.
  - Play Store exige minimo 2 screenshots de phone (recomendo 4-8).
  - Dimensoes aceitas: 320 a 3840 px no lado maior, proporcao 16:9 ou 9:16.
    O emulador em resolucao padrao (1080x1920 ou 1080x2340) ja atende.
  - Se precisar redimensionar em massa para 1080x1920 no macOS:
      for f in store-assets/screenshots/*.png; do
        sips -Z 1920 "$f" >/dev/null
      done
NOTE
