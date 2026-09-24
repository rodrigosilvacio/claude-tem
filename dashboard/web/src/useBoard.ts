import { useEffect, useState } from "react";
import type { Board } from "../../server/src/types";

/** Build estático (GitHub Pages): lê board.json, regenerado pelo workflow a cada mudança. */
const STATIC = import.meta.env.VITE_STATIC === "true";
const STATIC_REFRESH_MS = 30_000;

export function useBoard() {
  const [board, setBoard] = useState<Board | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (STATIC) {
      let alive = true;
      const load = async () => {
        try {
          const res = await fetch(`${import.meta.env.BASE_URL}board.json?t=${Date.now()}`, { cache: "no-store" });
          if (!res.ok) throw new Error(String(res.status));
          const data: Board = await res.json();
          if (alive) {
            setBoard(data);
            setConnected(true);
          }
        } catch {
          if (alive) setConnected(false);
        }
      };
      void load();
      const t = setInterval(load, STATIC_REFRESH_MS);
      return () => {
        alive = false;
        clearInterval(t);
      };
    }

    // Servidor local: Server-Sent Events; o EventSource reconecta sozinho se a conexão cair
    const es = new EventSource("/api/events");
    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);
    es.onmessage = (e) => setBoard(JSON.parse(e.data));
    return () => es.close();
  }, []);

  return { board, connected, isStatic: STATIC };
}
