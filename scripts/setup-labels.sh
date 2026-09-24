#!/usr/bin/env bash
# Cria (ou atualiza) as labels usadas pela máquina de estados dos agentes.
# Uso: scripts/setup-labels.sh [owner/repo]
set -euo pipefail

REPO="${1:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}"

label() {
  gh label create "$1" --repo "$REPO" --color "$2" --description "$3" --force >/dev/null
  echo "✓ $1"
}

label "agent:todo"    "d4c5f9" "Demanda na fila para o agente Dev"
label "agent:dev"     "0e8a16" "Agente Dev desenvolvendo"
label "agent:review"  "1d76db" "Agente Revisor avaliando"
label "agent:changes" "fbca04" "Revisor solicitou ajustes; volta para o Dev"
label "agent:merged"  "5319e7" "Aprovado e mergeado automaticamente"
label "agent:blocked" "b60205" "Precisa de intervenção humana"
label "round:1"       "ededed" "1ª rodada de ajustes"
label "round:2"       "ededed" "2ª rodada de ajustes"
label "round:3"       "ededed" "3ª rodada de ajustes"
