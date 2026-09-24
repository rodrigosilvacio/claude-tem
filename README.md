# claude-tem — pipeline de agentes Claude a partir de issues

Crie uma issue → o **Agente Dev** implementa → o **Agente Revisor** avalia → aprovado: **merge automático**;
reprovado: volta ao Dev (até 3 rodadas). Um **kanban web** mostra em tempo real onde cada demanda está.

```
agent:todo ─▶ agent:dev ─▶ agent:review ─┬─ aprovado ─▶ agent:merged (PR mergeado, issue fechada)
                  ▲                       ├─ reprovado ─▶ agent:changes ─▶ (volta ao Dev, round:N)
                  └───────────────────────┘
                                          └─ 4ª reprovação ou erro ─▶ agent:blocked (humano)
```

## Como funciona
| Peça | Arquivo | Papel |
|---|---|---|
| Agente Dev | `.github/workflows/dev-agent.yml` + `.github/prompts/dev.md` | Dispara com `agent:todo`/`agent:changes`. Trabalha na branch `claude/issue-<n>`, roda testes, faz commit, abre/atualiza o PR e passa para `agent:review`. |
| Agente Revisor | `.github/workflows/review-agent.yml` + `.github/prompts/review.md` | Avalia o diff contra a issue, grava um veredito JSON, comenta no PR e faz merge ou devolve ao Dev. |
| Sweeper | `.github/workflows/sweeper.yml` | Polling a cada 10 min: re-dispara demandas paradas há mais de 20 min sem execução ativa. |
| Estado | `scripts/agent-state.sh` | Labels `agent:*` (etapa) e `round:N` (rodada de ajustes) na issue. O GitHub é a fonte da verdade. |
| Kanban | `dashboard/` | Servidor Node que consulta a API do GitHub (polling de 15 s) e envia o quadro via SSE para o front React. |

Só issues de `OWNER`, `MEMBER` ou `COLLABORATOR` acionam os agentes. O Dev não pode alterar `.github/`,
`dashboard/` nem `scripts/`, e o Revisor não publica código, apenas avalia.

## Configuração (uma vez)
1. **Secrets** do repositório (Settings → Secrets and variables → Actions):
   - `ANTHROPIC_API_KEY`: chave da API da Anthropic.
   - `AGENT_PAT`: token *fine-grained* com acesso a este repositório e permissões **Contents**, **Issues**,
     **Pull requests** e **Actions** em *Read and write*. Ele é necessário porque ações feitas com o `GITHUB_TOKEN`
     padrão não disparam outros workflows, então a troca de label não acionaria o próximo agente.
2. **Actions** (Settings → Actions → General): em *Workflow permissions*, marque *Read and write* e
   *Allow GitHub Actions to create and approve pull requests*.
3. **Labels**:
   ```bash
   scripts/setup-labels.sh rodrigosilvacio/claude-tem
   ```
4. Se houver *branch protection* na `main`, o dono do `AGENT_PAT` precisa poder fazer merge sem aprovação humana.

## Usando
1. Crie uma issue descrevendo a demanda (critérios de aceite ajudam o Revisor).
2. Aplique a label **`agent:todo`**.
3. Acompanhe no kanban, ou na aba Actions ("Dev #n" / "Revisão #n").
4. Demanda bloqueada: ajuste a issue e aplique `agent:todo` de novo (a contagem de rodadas recomeça).

> Toda troca de label dispara os workflows; as execuções que não se aplicam aparecem como *skipped* na aba Actions.

## Kanban
```bash
cd dashboard
cp .env.example .env
npm install
npm run dev
```
Preencha o `GITHUB_TOKEN` no `.env` com um token de leitura. O comando `npm run dev` abre o front em http://localhost:5173
(com a API em :3001). Para produção: `npm run build && npm start`, e tudo passa a ser servido em http://localhost:3001.

Colunas: Backlog · Desenvolvendo · Em revisão · Ajustes · Concluído · Bloqueado. Cada card mostra o agente atual,
o status da execução, a rodada, o tempo na etapa, links para a issue, o PR e a execução, e o passo a passo completo.

## Código do produto
O que os agentes desenvolvem fica na raiz (`src/`, TypeScript + Vitest). As convenções estão no `CLAUDE.md`.
