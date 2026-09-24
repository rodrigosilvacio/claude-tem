import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GitHubSource } from "./github.js";
import { Poller } from "./poller.js";
import type { Board } from "./types.js";

const repo = process.env.GITHUB_REPO ?? "rodrigosilvacio/claude-tem";
const port = Number(process.env.PORT ?? 3001);
const interval = Number(process.env.POLL_INTERVAL_MS ?? 15000);
if (!process.env.GITHUB_TOKEN) console.warn("[server] GITHUB_TOKEN não definido — usando API anônima (60 req/h)");

const poller = new Poller(new GitHubSource(process.env.GITHUB_TOKEN, repo), interval);
poller.start();

const app = express();

app.get("/api/board", (_req, res) => res.json(poller.board));

// Server-Sent Events: envia o quadro sempre que o poller detecta mudança
app.get("/api/events", (req, res) => {
  res.set({ "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });
  res.flushHeaders();
  const send = (board: Board) => res.write(`data: ${JSON.stringify(board)}\n\n`);
  send(poller.board);
  poller.on("board", send);
  const ping = setInterval(() => res.write(": ping\n\n"), 25000);
  req.on("close", () => {
    clearInterval(ping);
    poller.off("board", send);
  });
});

// Em produção serve o front-end buildado
const webDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../web/dist");
app.use(express.static(webDist));
app.get("*", (_req, res) => res.sendFile(path.join(webDist, "index.html")));

app.listen(port, () => console.log(`[server] http://localhost:${port} — repo ${repo}, polling a cada ${interval / 1000}s`));
