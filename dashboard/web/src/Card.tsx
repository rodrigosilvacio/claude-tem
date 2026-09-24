import { useState } from "react";
import type { Card } from "../../server/src/types";
import { since } from "./time";
import { Timeline } from "./Timeline";

const AGENT_NAME = { dev: "Agente Dev", reviewer: "Agente Revisor" } as const;

function runLabel(card: Card): { text: string; tone: string } | null {
  const run = card.run;
  if (!run) return null;
  const who = run.workflow === "dev" ? "Dev" : "Revisor";
  if (run.status === "in_progress") return { text: `${who} executando`, tone: "running" };
  if (run.status !== "completed") return { text: `${who} na fila`, tone: "queued" };
  if (run.conclusion === "success") return { text: `${who}: sucesso`, tone: "ok" };
  if (run.conclusion === "skipped" || run.conclusion === "cancelled") return { text: `${who}: ${run.conclusion}`, tone: "queued" };
  return { text: `${who}: falhou`, tone: "fail" };
}

export function CardView({ card, now }: { card: Card; now: number }) {
  const [open, setOpen] = useState(false);
  const run = runLabel(card);

  return (
    <article className={`card ${open ? "open" : ""}`}>
      <button className="card-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="num">#{card.number}</span>
        <span className="title">{card.title}</span>
      </button>

      <div className="meta">
        {card.agent && (
          <span className={`agent agent-${card.agent}`}>
            <span className="dot" /> {AGENT_NAME[card.agent]}
          </span>
        )}
        {run && <span className={`run run-${run.tone}`}>{run.text}</span>}
      </div>

      <div className="meta small">
        <span title="Rodadas de ajustes">
          Rodada {card.round}/{card.maxRounds}
        </span>
        <span title="Tempo na etapa atual">⏱ {since(card.stageSince, now)}</span>
        <span title="Desde a criação da demanda">Total {since(card.createdAt, now)}</span>
      </div>

      <div className="links">
        <a href={card.url} target="_blank" rel="noreferrer">Issue</a>
        {card.pr && (
          <a href={card.pr.url} target="_blank" rel="noreferrer">
            PR #{card.pr.number} ({card.pr.state === "merged" ? "mergeado" : card.pr.state === "open" ? "aberto" : "fechado"})
          </a>
        )}
        {card.run && <a href={card.run.url} target="_blank" rel="noreferrer">Execução</a>}
        <button className="linkish" onClick={() => setOpen(!open)}>{open ? "Ocultar passos" : "Ver passo a passo"}</button>
      </div>

      {open && <Timeline steps={card.timeline} />}
    </article>
  );
}
