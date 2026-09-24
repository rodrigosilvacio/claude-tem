import type { TimelineStep } from "../../server/src/types";
import { clock } from "./time";

export function Timeline({ steps }: { steps: TimelineStep[] }) {
  if (steps.length === 0) return <p className="empty">Sem histórico ainda.</p>;
  return (
    <ol className="timeline">
      {steps.map((s, i) => (
        <li key={i} className={`step step-${s.column}`}>
          <span className="marker" />
          <div>
            <div>{s.label}</div>
            <div className="muted small">
              {clock(s.at)}
              {s.actor ? ` · ${s.actor}` : ""}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
