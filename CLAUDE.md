# claude-tem

Repositório desenvolvido por agentes Claude a partir de issues do GitHub.

## Pipeline de agentes
- Uma issue com a label `agent:todo` dispara o **Agente Dev** (`.github/workflows/dev-agent.yml`).
- O Dev implementa na branch `claude/issue-<n>` e abre um PR; em seguida o **Agente Revisor**
  (`.github/workflows/review-agent.yml`) avalia. Aprovado → merge automático. Reprovado → volta ao Dev (máx. 3 rodadas).
- Estado da demanda = labels `agent:*` + `round:N` na issue. O painel em `dashboard/` exibe esse estado como kanban.

## Convenções do código do produto
- TypeScript (ESM, `strict`) em `src/`; testes com Vitest ao lado do código (`src/**/*.test.ts`).
- Comandos: `npm test`, `npm run typecheck`, `npm run build`.
- Funções pequenas e puras quando possível; sem dependências novas sem necessidade.
- Código em inglês; comentários, mensagens de commit e documentação em português.

## Fora do escopo dos agentes
Não alterar `.github/`, `dashboard/` nem `scripts/` a partir de issues — essa é a infraestrutura do pipeline.
