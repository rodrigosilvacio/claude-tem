// Permite importar arquivos HTML como texto (sufixo `?raw` do Vite/Vitest).
declare module "*.html?raw" {
  const content: string;
  export default content;
}

declare module "*.css?raw" {
  const content: string;
  export default content;
}
