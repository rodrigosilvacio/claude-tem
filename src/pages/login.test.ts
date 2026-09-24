import { describe, expect, it } from "vitest";
import html from "./login.html?raw";

// Retorna a tag de abertura do elemento com o id informado.
function findTagById(source: string, id: string): string | undefined {
  return source.match(new RegExp(`<[a-z]+[^>]*\\bid="${id}"[^>]*>`, "i"))?.[0];
}

function getAttribute(tag: string, name: string): string | undefined {
  return tag.match(new RegExp(`\\b${name}="([^"]*)"`, "i"))?.[1];
}

describe("página de login", () => {
  it("tem campo de e-mail com label associada", () => {
    const input = findTagById(html, "email");
    expect(input).toBeDefined();
    expect(getAttribute(input!, "type")).toBe("email");
    expect(html).toMatch(/<label for="email">E-mail<\/label>/);
  });

  it("tem campo de senha mascarado com label associada", () => {
    const input = findTagById(html, "password");
    expect(input).toBeDefined();
    expect(getAttribute(input!, "type")).toBe("password");
    expect(html).toMatch(/<label for="password">Senha<\/label>/);
  });

  it("tem botão Entrar que não executa ação ao enviar", () => {
    expect(html).toMatch(/<button type="submit">Entrar<\/button>/);
    const form = findTagById(html, "login-form");
    expect(form).toBeDefined();
    expect(getAttribute(form!, "action")).toBeUndefined();
    expect(getAttribute(form!, "onsubmit")).toBe("return false;");
  });

  it("é responsiva e centralizada", () => {
    expect(html).toMatch(/<meta name="viewport" content="width=device-width, initial-scale=1"/);
    expect(html).toMatch(/justify-content:\s*center/);
    expect(html).toMatch(/align-items:\s*center/);
    expect(html).toMatch(/max-width:\s*400px/);
    expect(html).toMatch(/@media \(max-width: 480px\)/);
  });
});
