#!/usr/bin/env bash
# Cria o kanban "Kanban dos Agentes" como GitHub Project, vincula ao repositório
# e grava a variável PROJECT_NUMBER usada pelos workflows.
#
# Pré-requisito (uma vez):  gh auth refresh -s project
# Uso: scripts/setup-project.sh [owner/repo]
set -euo pipefail

REPO="${1:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}"
OWNER="${REPO%%/*}"
TITLE="Kanban dos Agentes"

num=$(gh project list --owner "$OWNER" --format json -q ".projects[] | select(.title == \"$TITLE\") | .number" | head -1)
if [[ -z "$num" ]]; then
  num=$(gh project create --owner "$OWNER" --title "$TITLE" --format json -q .number)
  echo "✓ Project criado (#$num)"
else
  echo "✓ Project já existe (#$num)"
fi
gh project link "$num" --owner "$OWNER" --repo "$REPO" 2>/dev/null || true
echo "✓ Vinculado a $REPO"

# Colunas do quadro = opções do campo Status
fid=$(gh project field-list "$num" --owner "$OWNER" --format json -q '.fields[] | select(.name == "Status") | .id')
gh api graphql -f fid="$fid" -f query='
mutation($fid: ID!) {
  updateProjectV2Field(input: {fieldId: $fid, singleSelectOptions: [
    {name: "Backlog",       color: GRAY,   description: "Aguardando o Agente Dev"},
    {name: "Desenvolvendo", color: GREEN,  description: "Agente Dev trabalhando"},
    {name: "Em revisão",    color: BLUE,   description: "Agente Revisor avaliando"},
    {name: "Ajustes",       color: ORANGE, description: "Revisor pediu ajustes; volta ao Dev"},
    {name: "Concluído",     color: PURPLE, description: "Aprovado e mergeado"},
    {name: "Bloqueado",     color: RED,    description: "Requer intervenção humana"}
  ]}) { projectV2Field { ... on ProjectV2SingleSelectField { id } } }
}' >/dev/null
echo "✓ Colunas configuradas"

if ! gh project field-list "$num" --owner "$OWNER" --format json -q '.fields[].name' | grep -qx "Rodada"; then
  gh project field-create "$num" --owner "$OWNER" --name "Rodada" --data-type NUMBER >/dev/null
  echo "✓ Campo Rodada criado"
fi

gh variable set PROJECT_NUMBER --repo "$REPO" --body "$num"
echo "✓ Variável PROJECT_NUMBER=$num gravada no repositório"

url=$(gh project view "$num" --owner "$OWNER" --format json -q .url)
echo
echo "Kanban: $url"
echo "Na primeira vez, abra o link e mude a visualização para Board (menu da view → Layout → Board)."
