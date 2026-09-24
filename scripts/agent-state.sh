#!/usr/bin/env bash
# Helpers da máquina de estados (labels agent:* e round:*) usados pelos workflows.
# Requer: gh, GH_TOKEN e GITHUB_REPOSITORY no ambiente.
#
# IMPORTANTE: mudanças feitas com o GITHUB_TOKEN padrão NÃO disparam outros workflows.
# Use GH_TOKEN=$AGENT_PAT apenas nas transições que devem acionar um agente
# (agent:review → Revisor, agent:changes → Dev).
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
