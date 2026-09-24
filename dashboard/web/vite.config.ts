import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Caminhos relativos: funciona tanto em /claude-tem/ (GitHub Pages) quanto na raiz
  base: "./",
  server: { port: 5173, proxy: { "/api": "http://localhost:3001" } },
});
