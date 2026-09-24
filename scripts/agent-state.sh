#!/usr/bin/env bash
# Helpers da máquina de estados (labels agent:* e round:*) usados pelos workflows.
# Requer: gh, GH_TOKEN e GITHUB_REPOSITORY no ambiente.
#
# IMPORTANTE: mudanças feitas com o GITHUB_TOKEN padrão NÃO disparam outros workflows.
# Use GH_TOKEN=$AGENT_PAT apenas nas transições que devem acionar um agente
# (agent:review → Revisor, agent:changes → Dev).
#
# Kanban no GitHub: se PROJECT_NUMBER e PROJECT_TOKEN estiverem definidos, cada transição
# também atualiza a coluna (Status) e a Rodada da issue no GitHub Project.
set -euo pipefail

STATES=(agent:todo agent:dev agent:review agent:changes agent:merged agent:blocked)
MAX_ROUNDS=3

# set_state <issue> <novo-estado>
set_state() {
  local issue="$1" target="$2" remove=()
  for s in "${STATES[@]}"; do
    [[ "$s" != "$target" ]] && remove+=("$s")
  done
  gh issue edit "$issue" --repo "$GITHUB_REPOSITORY" \
    --add-label "$target" --remove-label "$(IFS=,; echo "${remove[*]}")" >/dev/null
  sync_project "$issue" "$target"
}

# Nome da coluna do GitHub Project para cada estado
status_name() {
  case "$1" in
    agent:todo) echo "Backlog" ;;
    agent:dev) echo "Desenvolvendo" ;;
    agent:review) echo "Em revisão" ;;
    agent:changes) echo "Ajustes" ;;
    agent:merged) echo "Concluído" ;;
    agent:blocked) echo "Bloqueado" ;;
  esac
}

# sync_project <issue> <estado>  → melhor esforço: nunca interrompe o pipeline
sync_project() {
  [[ -n "${PROJECT_NUMBER:-}" && -n "${PROJECT_TOKEN:-}" ]] || return 0
  local issue="$1" state="$2" rc
  # O subshell não pode estar numa lista com || — senão o set -e dentro dele é ignorado
  set +e
  (
    set -e
    export GH_TOKEN="$PROJECT_TOKEN"
    owner="${GITHUB_REPOSITORY%%/*}"
    status=$(status_name "$state")
    pid=$(gh project view "$PROJECT_NUMBER" --owner "$owner" --format json -q .id)
    item=$(gh project item-add "$PROJECT_NUMBER" --owner "$owner" \
      --url "https://github.com/$GITHUB_REPOSITORY/issues/$issue" --format json -q .id)
    fields=$(gh project field-list "$PROJECT_NUMBER" --owner "$owner" --format json)
    fid=$(jq -r '.fields[] | select(.name == "Status") | .id' <<<"$fields")
    oid=$(jq -r --arg s "$status" '.fields[] | select(.name == "Status") | .options[] | select(.name == $s) | .id' <<<"$fields")
    gh project item-edit --id "$item" --project-id "$pid" --field-id "$fid" --single-select-option-id "$oid" >/dev/null
    rid=$(jq -r '.fields[] | select(.name == "Rodada") | .id' <<<"$fields")
    if [[ -n "$rid" ]]; then
      gh project item-edit --id "$item" --project-id "$pid" --field-id "$rid" --number "$(get_round "$issue")" >/dev/null
    fi
  )
  rc=$?
  set -e
  [[ $rc -eq 0 ]] || echo "::warning::Não foi possível atualizar o GitHub Project da issue #$issue"
}

# get_round <issue>  → imprime o número da rodada atual (0 se não houver label round:N)
get_round() {
  gh issue view "$1" --repo "$GITHUB_REPOSITORY" --json labels \
    -q '[.labels[].name | select(startswith("round:")) | ltrimstr("round:") | tonumber] | max // 0'
}

# set_round <issue> <n>  → n=0 remove todas as labels round:*
set_round() {
  local issue="$1" n="$2" remove=()
  for i in $(seq 1 "$MAX_ROUNDS"); do
    [[ "$i" != "$n" ]] && remove+=("round:$i")
  done
  if [[ "$n" -gt 0 ]]; then
    gh issue edit "$issue" --repo "$GITHUB_REPOSITORY" \
      --add-label "round:$n" --remove-label "$(IFS=,; echo "${remove[*]}")" >/dev/null
  else
    gh issue edit "$issue" --repo "$GITHUB_REPOSITORY" \
      --remove-label "$(IFS=,; echo "${remove[*]}")" >/dev/null
  fi
}

# check_author <issue>  → falha se o autor da issue não for OWNER/MEMBER/COLLABORATOR
check_author() {
  local assoc
  assoc=$(gh api "repos/$GITHUB_REPOSITORY/issues/$1" -q .author_association)
  case "$assoc" in
    OWNER|MEMBER|COLLABORATOR) return 0 ;;
    *) echo "Autor da issue #$1 não autorizado ($assoc)"; return 1 ;;
  esac
}

# block <issue> <mensagem>  → move para agent:blocked e comenta o motivo
block() {
  local issue="$1" msg="$2"
  set_state "$issue" agent:blocked
  gh issue comment "$issue" --repo "$GITHUB_REPOSITORY" --body "🛑 **Demanda bloqueada** — $msg

Para reiniciar, ajuste a issue e aplique novamente a label \`agent:todo\`." >/dev/null
}
