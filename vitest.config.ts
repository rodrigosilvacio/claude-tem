import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Processa CSS para que imports `*.css?raw` retornem o conteúdo do arquivo nos testes.
    css: true,
  },
});
