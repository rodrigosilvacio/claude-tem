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
| Kanban no GitHub | `scripts/setup-project.sh` + `.github/workflows/project-sync.yml` | GitHub Project cujas colunas (Status) e campo Rodada são atualizados a cada transição. |
| Dashboard no GitHub Pages | `.github/workflows/dashboard-pages.yml` | Gera `board.json` a cada mudança e publica o dashboard em https://rodrigosilvacio.github.io/claude-tem/ |
| Kanban local (opcional) | `dashboard/` | Servidor Node que consulta a API do GitHub (polling de 15 s) e envia o quadro via SSE para o front React. |

Só issues de `OWNER`, `MEMBER` ou `COLLABORATOR` acionam os agentes. O Dev não pode alterar `.github/`,
`dashboard/` nem `scripts/`, e o Revisor não publica código, apenas avalia.

## Configuração (uma vez)

### 1. Criar o `AGENT_PAT` (token pessoal)
Ele é necessário porque ações feitas com o `GITHUB_TOKEN` padrão **não disparam outros workflows**, então o Dev não
acionaria o Revisor. Ele também atualiza o kanban no GitHub Project.

1. Acesse https://github.com/settings/tokens/new?scopes=repo,workflow,project&description=AGENT_PAT
   (token *classic*: tokens fine-grained não acessam Projects de conta pessoal).
2. Confira se os escopos **repo**, **workflow** e **project** estão marcados, escolha a expiração e clique em *Generate token*.
3. Copie o valor (ele só aparece uma vez).

### 2. Cadastrar os secrets no repositório
Acesse https://github.com/rodrigosilvacio/claude-tem/settings/secrets/actions → **New repository secret**:

| Nome | Valor |
|---|---|
| `ANTHROPIC_API_KEY` | chave de https://console.anthropic.com/settings/keys |
| `AGENT_PAT` | o token do passo 1 |

Ou pelo terminal (o `gh` pede o valor sem exibi-lo):
```bash
gh secret set ANTHROPIC_API_KEY --repo rodrigosilvacio/claude-tem
```
```bash
gh secret set AGENT_PAT --repo rodrigosilvacio/claude-tem
```

### 3. Permissões do Actions
Em https://github.com/rodrigosilvacio/claude-tem/settings/actions → *Workflow permissions*: marque
**Read and write permissions** e **Allow GitHub Actions to create and approve pull requests**.

### 4. Labels e kanban no GitHub
```bash
scripts/setup-labels.sh rodrigosilvacio/claude-tem
```
```bash
gh auth refresh -s project
```
```bash
scripts/setup-project.sh rodrigosilvacio/claude-tem
```
O segundo script cria o Project **Kanban dos Agentes**, vincula ao repositório (aba *Projects*) e grava a variável
`PROJECT_NUMBER`. Na primeira vez, abra o Project e troque o layout da view para **Board**.

Se houver *branch protection* na `main`, o dono do `AGENT_PAT` precisa poder fazer merge sem aprovação humana.

## Usando
1. Crie uma issue descrevendo a demanda (critérios de aceite ajudam o Revisor).
2. Aplique a label **`agent:todo`**.
3. Acompanhe no **GitHub Project** (aba *Projects* do repositório ou app do GitHub), no dashboard local ou na
   aba Actions ("Dev #n" / "Revisão #n").
4. Demanda bloqueada: ajuste a issue e aplique `agent:todo` de novo (a contagem de rodadas recomeça).

> Toda troca de label dispara os workflows; as execuções que não se aplicam aparecem como *skipped* na aba Actions.

## Dashboard no GitHub Pages
Endereço: **https://rodrigosilvacio.github.io/claude-tem/**

O workflow `Publicar dashboard` roda a cada mudança de label, no início e no fim de cada execução dos agentes, e
também a cada 15 min. Ele gera um retrato (`board.json`) com os dados do GitHub e publica a página estática, que
recarrega esses dados a cada 30 s. Nenhum token fica exposto na página. Cada atualização leva cerca de 1 min para
aparecer, e a página é pública, como o repositório.

## Dashboard local (opcional)
Mais detalhado que o Project: mostra o status da execução, os tempos por etapa e o passo a passo de cada demanda.
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
