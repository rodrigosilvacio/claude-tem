import { useEffect, useState } from "react";
import type { Board } from "../../server/src/types";

/** Recebe o quadro via SSE; o EventSource reconecta sozinho se a conexão cair. */
export function useBoard() {
  const [board, setBoard] = useState<Board | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const es = new EventSource("/api/events");
    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);
    es.onmessage = (e) => setBoard(JSON.parse(e.data));
    return () => es.close();
  }, []);

  return { board, connected };
}
