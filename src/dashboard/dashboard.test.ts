import { describe, expect, it } from "vitest";
import staticPage from "../pages/dashboard.html?raw";
import { mockUsers, type MockUser } from "./mock-users.js";
import { escapeHtml, formatDateTime, renderDashboardPage } from "./render.js";
import { maskPassword, summarizeUsers } from "./stats.js";

const sample: MockUser[] = [
  {
    id: 1,
    name: "Teste <script>",
    email: "t@example.com",
    password: "segredo-super-longo",
    role: "admin",
    status: "active",
    lastLogin: "2026-01-02T03:04:00Z",
  },
  {
    id: 2,
    name: "Outro",
    email: "o@example.com",
    password: "abc",
    role: "viewer",
    status: "inactive",
    lastLogin: "2026-12-31T23:59:00Z",
  },
];

describe("dados mock", () => {
  it("tem usuários com e-mail e senha preenchidos e ids únicos", () => {
    expect(mockUsers.length).toBeGreaterThan(0);
    for (const user of mockUsers) {
      expect(user.email).toMatch(/^[^@\s]+@example\.com$/);
      expect(user.password.length).toBeGreaterThan(0);
    }
    expect(new Set(mockUsers.map((u) => u.id)).size).toBe(mockUsers.length);
  });
});

describe("summarizeUsers", () => {
  it("conta total, ativos, inativos e perfis", () => {
    expect(summarizeUsers(sample)).toEqual({
      total: 2,
      active: 1,
      inactive: 1,
      byRole: { admin: 1, editor: 0, viewer: 1 },
    });
  });

  it("lida com lista vazia", () => {
    expect(summarizeUsers([])).toEqual({
      total: 0,
      active: 0,
      inactive: 0,
      byRole: { admin: 0, editor: 0, viewer: 0 },
    });
  });
});

describe("maskPassword", () => {
  it("não revela conteúdo nem comprimento da senha", () => {
    expect(maskPassword("abc")).toBe(maskPassword("segredo-super-longo"));
    expect(maskPassword("abc")).not.toContain("abc");
  });
});

describe("formatação", () => {
  it("escapa caracteres especiais de HTML", () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;",
    );
  });

  it("formata data em UTC como dd/mm/aaaa hh:mm", () => {
    expect(formatDateTime("2026-01-02T03:04:00Z")).toBe("02/01/2026 03:04");
  });
});

describe("renderDashboardPage", () => {
  const html = renderDashboardPage(sample);

  it("mostra os cards de resumo", () => {
    expect(html).toMatch(/Total de usuários<\/span>\s*<strong class="stat-value">2</);
    expect(html).toMatch(/Ativos<\/span>\s*<strong class="stat-value">1</);
    expect(html).toMatch(/Inativos<\/span>\s*<strong class="stat-value">1</);
    expect(html).toMatch(/Administradores<\/span>\s*<strong class="stat-value">1</);
  });

  it("lista cada usuário com e-mail, perfil e status", () => {
    expect(html.match(/<tbody>[\s\S]*<\/tbody>/)![0].match(/<tr>/g)).toHaveLength(2);
    expect(html).toContain("<td>t@example.com</td>");
    expect(html).toContain("<td>Administrador</td>");
    expect(html).toContain('<span class="badge badge-inactive">Inativo</span>');
    expect(html).toContain("<td>31/12/2026 23:59</td>");
  });

  it("mascara as senhas e nunca as exibe em texto puro", () => {
    expect(html).toContain('<td class="password">••••••••</td>');
    for (const user of sample) {
      expect(html).not.toContain(user.password);
    }
  });

  it("escapa o conteúdo dos usuários", () => {
    expect(html).toContain("Teste &lt;script&gt;");
    expect(html).not.toContain("<script>");
  });

  it("é responsiva", () => {
    expect(html).toMatch(/<meta name="viewport" content="width=device-width, initial-scale=1"/);
    expect(html).toMatch(/@media \(max-width: 480px\)/);
  });
});

describe("página estática", () => {
  it("está sincronizada com os dados mock", () => {
    expect(staticPage).toBe(renderDashboardPage(mockUsers));
  });

  it("não expõe nenhuma senha mock", () => {
    for (const user of mockUsers) {
      expect(staticPage).not.toContain(user.password);
    }
  });
});
