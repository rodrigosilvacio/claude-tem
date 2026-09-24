export type Column = "todo" | "dev" | "review" | "changes" | "merged" | "blocked";
export type Agent = "dev" | "reviewer" | null;

export interface TimelineStep {
  at: string;
  column: Column;
  label: string;
  actor: string | null;
}

export interface RunInfo {
  workflow: "dev" | "review";
  status: string; // queued | in_progress | completed ...
  conclusion: string | null;
  url: string;
  startedAt: string;
}

export interface Card {
  number: number;
  title: string;
  url: string;
  column: Column;
  agent: Agent;
  round: number;
  maxRounds: number;
  createdAt: string;
  stageSince: string;
  pr: { number: number; url: string; state: "open" | "closed" | "merged" } | null;
  run: RunInfo | null;
  timeline: TimelineStep[];
}

export interface Board {
  repo: string;
  updatedAt: string;
  cards: Card[];
  error?: string;
}
