// Gera um retrato estático do quadro (board.json) — usado pelo deploy no GitHub Pages.
// Uso: GITHUB_TOKEN=... GITHUB_REPO=owner/repo tsx src/snapshot.ts <arquivo-de-saída>
import { writeFile } from "node:fs/promises";
import { GitHubSource } from "./github.js";

const out = process.argv[2] ?? "board.json";
const repo = process.env.GITHUB_REPO ?? "rodrigosilvacio/claude-tem";

const board = await new GitHubSource(process.env.GITHUB_TOKEN, repo).fetchBoard();
await writeFile(out, JSON.stringify(board));
console.log(`[snapshot] ${board.cards.length} demandas → ${out}`);
