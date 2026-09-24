import { useEffect, useState } from "react";
import type { Column } from "../../server/src/types";
import { CardView } from "./Card";
import { since } from "./time";
import { useBoard } from "./useBoard";

export const COLUMNS: { id: Column; title: string; hint: string }[] = [
  { id: "todo", title: "Backlog", hint: "Aguardando o Agente Dev" },
  { id: "dev", title: "Desenvolvendo", hint: "Agente Dev" },
  { id: "review", title: "Em revisão", hint: "Agente Revisor" },
  { id: "changes", title: "Ajustes", hint: "Voltando para o Dev" },
  { id: "merged", title: "Concluído", hint: "Aprovado e mergeado" },
  { id: "blocked", title: "Bloqueado", hint: "Requer humano" },
];

export function App() {
  const { board, connected, isStatic } = useBoard();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const cards = board?.cards ?? [];
  const active = cards.filter((c) => c.column === "dev" || c.column === "review").length;

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>Kanban dos Agentes</h1>
          <p className="muted">
            {board ? (
              <a href={`https://github.com/${board.repo}/issues`} target="_blank" rel="noreferrer">{board.repo}</a>
            ) : (
              "carregando…"
            )}
            {" · "}
            <a href="app/">Ver páginas do produto</a>
            {" · "}
            {active} {active === 1 ? "agente trabalhando" : "agentes trabalhando"}
          </p>
        </div>
        <span className={`conn ${connected ? "on" : "off"}`}>
          {!connected ? "reconectando…" : isStatic && board ? `atualizado há ${since(board.updatedAt, now)}` : "ao vivo"}
        </span>
      </header>

      {board?.error && <div className="error">Erro ao consultar o GitHub: {board.error}</div>}

      <main className="board">
        {COLUMNS.map((col) => {
          const list = cards.filter((c) => c.column === col.id);
          return (
            <section key={col.id} className={`column col-${col.id}`}>
              <header>
                <h2>{col.title}</h2>
                <span className="count">{list.length}</span>
              </header>
              <p className="hint">{col.hint}</p>
              <div className="cards">
                {list.map((c) => <CardView key={c.number} card={c} now={now} />)}
                {list.length === 0 && <p className="empty">Nada aqui</p>}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
