import { Octokit } from "@octokit/rest";
import type { Board, Card, Column, RunInfo, TimelineStep } from "./types.js";

const MAX_ROUNDS = 3;
const COLUMN_BY_LABEL: Record<string, Column> = {
  "agent:todo": "todo",
  "agent:dev": "dev",
  "agent:review": "review",
  "agent:changes": "changes",
  "agent:merged": "merged",
  "agent:blocked": "blocked",
};
const STEP_TEXT: Record<Column, string> = {
  todo: "Demanda na fila",
  dev: "Agente Dev iniciou o desenvolvimento",
  review: "Enviado ao Agente Revisor",
  changes: "Revisor solicitou ajustes",
  merged: "Aprovado e mergeado",
  blocked: "Bloqueado — requer intervenção humana",
};

type TimelineCache = Map<number, { updatedAt: string; steps: TimelineStep[] }>;

export class GitHubSource {
  private octokit: Octokit;
  private owner: string;
  private repo: string;
  private timelines: TimelineCache = new Map();

  constructor(token: string | undefined, readonly fullName: string) {
    this.octokit = new Octokit({ auth: token });
    [this.owner, this.repo] = fullName.split("/");
  }

  async fetchBoard(): Promise<Board> {
    const { owner, repo } = this;
    const [issues, pulls, runs] = await Promise.all([
      this.octokit.issues.listForRepo({ owner, repo, state: "all", sort: "updated", per_page: 100 }),
      this.octokit.pulls.list({ owner, repo, state: "all", sort: "updated", direction: "desc", per_page: 100 }),
      this.octokit.actions.listWorkflowRunsForRepo({ owner, repo, per_page: 100 }),
    ]);

    const cards: Card[] = [];
    for (const issue of issues.data) {
      if (issue.pull_request) continue;
      const labels = issue.labels.map((l) => (typeof l === "string" ? l : l.name ?? ""));
      const stateLabel = labels.find((l) => l in COLUMN_BY_LABEL);
      if (!stateLabel) continue;
      const column = COLUMN_BY_LABEL[stateLabel];

      const round = Math.max(0, ...labels.filter((l) => l.startsWith("round:")).map((l) => Number(l.slice(6)) || 0));
      const timeline = await this.timeline(issue.number, issue.updated_at);
      const pr = pulls.data.find((p) => p.head.ref === `claude/issue-${issue.number}`);
      const run = latestRun(runs.data.workflow_runs, issue.number);

      cards.push({
        number: issue.number,
        title: issue.title,
        url: issue.html_url,
        column,
        agent: column === "dev" ? "dev" : column === "review" ? "reviewer" : null,
        round,
        maxRounds: MAX_ROUNDS,
        createdAt: issue.created_at,
        stageSince: [...timeline].reverse().find((s) => s.column === column)?.at ?? issue.updated_at,
        pr: pr
          ? { number: pr.number, url: pr.html_url, state: pr.merged_at ? "merged" : (pr.state as "open" | "closed") }
          : null,
        run,
        timeline,
      });
    }

    return { repo: this.fullName, updatedAt: new Date().toISOString(), cards };
  }

  /** Histórico de transições (labels agent:*) — só é buscado de novo quando a issue muda. */
  private async timeline(issue: number, updatedAt: string): Promise<TimelineStep[]> {
    const cached = this.timelines.get(issue);
    if (cached?.updatedAt === updatedAt) return cached.steps;

    const events = await this.octokit.paginate(this.octokit.issues.listEventsForTimeline, {
      owner: this.owner,
      repo: this.repo,
      issue_number: issue,
      per_page: 100,
    });
    let round = 0;
    const steps: TimelineStep[] = [];
    for (const e of events as Array<Record<string, any>>) {
      if (e.event !== "labeled") continue;
      const name: string = e.label?.name ?? "";
      if (name.startsWith("round:")) round = Number(name.slice(6)) || 0;
      const column = COLUMN_BY_LABEL[name];
      if (!column) continue;
      let label = STEP_TEXT[column];
      if (column === "changes") label += ` (rodada ${round}/${MAX_ROUNDS})`;
      if (column === "dev" && round > 0) label = `Agente Dev retomou (rodada ${round}/${MAX_ROUNDS})`;
      steps.push({ at: e.created_at, column, label, actor: e.actor?.login ?? null });
    }
    this.timelines.set(issue, { updatedAt, steps });
    return steps;
  }
}

function latestRun(runs: Array<Record<string, any>>, issue: number): RunInfo | null {
  const match = runs.find((r) => new RegExp(`^(Dev|Revisão) #${issue}$`).test(r.display_title ?? ""));
  if (!match) return null;
  return {
    workflow: match.display_title.startsWith("Dev") ? "dev" : "review",
    status: match.status,
    conclusion: match.conclusion,
    url: match.html_url,
    startedAt: match.run_started_at ?? match.created_at,
  };
}
