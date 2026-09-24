import { EventEmitter } from "node:events";
import type { GitHubSource } from "./github.js";
import type { Board } from "./types.js";

/** Consulta o GitHub periodicamente e emite "board" quando algo muda. */
export class Poller extends EventEmitter {
  board: Board;
  private snapshot = "";

  constructor(private source: GitHubSource, private intervalMs: number) {
    super();
    this.board = { repo: source.fullName, updatedAt: new Date().toISOString(), cards: [] };
  }

  start() {
    const tick = async () => {
      try {
        const board = await this.source.fetchBoard();
        const snapshot = JSON.stringify(board.cards);
        this.board = board;
        if (snapshot !== this.snapshot) {
          this.snapshot = snapshot;
          this.emit("board", board);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[poller]", message);
        this.board = { ...this.board, error: message };
        this.emit("board", this.board);
      } finally {
        setTimeout(tick, this.intervalMs);
      }
    };
    void tick();
  }
}
