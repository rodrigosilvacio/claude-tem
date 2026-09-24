import type { MockUser, UserRole, UserStatus } from "./mock-users.js";
import { maskPassword, summarizeUsers } from "./stats.js";

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  editor: "Editor",
  viewer: "Leitor",
};

const STATUS_LABELS: Record<UserStatus, string> = {
  active: "Ativo",
  inactive: "Inativo",
};

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Formata a data ISO como dd/mm/aaaa hh:mm em UTC, para o resultado não depender do fuso da máquina.
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${pad(date.getUTCDate())}/${pad(date.getUTCMonth() + 1)}/${date.getUTCFullYear()} ` +
    `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`
  );
}

function renderStatCard(label: string, value: number): string {
  return `        <div class="stat-card">
          <span class="stat-label">${escapeHtml(label)}</span>
          <strong class="stat-value">${value}</strong>
        </div>`;
}

function renderUserRow(user: MockUser): string {
  return `            <tr>
              <td>${escapeHtml(user.name)}</td>
              <td>${escapeHtml(user.email)}</td>
              <td class="password">${maskPassword(user.password)}</td>
              <td>${ROLE_LABELS[user.role]}</td>
              <td><span class="badge badge-${user.status}">${STATUS_LABELS[user.status]}</span></td>
              <td>${formatDateTime(user.lastLogin)}</td>
            </tr>`;
}

const STYLES = `      *,
      *::before,
      *::after {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        padding: 2rem 1rem;
        font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
        background: #f3f4f6;
        color: #111827;
      }

      .dashboard {
        max-width: 1100px;
        margin: 0 auto;
      }

      .dashboard h1 {
        margin: 0 0 0.25rem;
        font-size: 1.75rem;
      }

      .subtitle {
        margin: 0 0 1.5rem;
        color: #6b7280;
      }

      .stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .stat-card,
      .panel {
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      }

      .stat-card {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding: 1rem 1.25rem;
      }

      .stat-label {
        font-size: 0.875rem;
        color: #6b7280;
      }

      .stat-value {
        font-size: 1.75rem;
      }

      .panel {
        padding: 1.5rem;
        overflow-x: auto;
      }

      .panel h2 {
        margin: 0 0 1rem;
        font-size: 1.25rem;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.9375rem;
      }

      th,
      td {
        padding: 0.625rem 0.75rem;
        text-align: left;
        border-bottom: 1px solid #e5e7eb;
        white-space: nowrap;
      }

      th {
        font-size: 0.8125rem;
        font-weight: 600;
        color: #6b7280;
        text-transform: uppercase;
      }

      .password {
        font-family: ui-monospace, monospace;
        letter-spacing: 0.1em;
      }

      .badge {
        display: inline-block;
        padding: 0.125rem 0.5rem;
        font-size: 0.8125rem;
        font-weight: 600;
        border-radius: 999px;
      }

      .badge-active {
        color: #166534;
        background: #dcfce7;
      }

      .badge-inactive {
        color: #374151;
        background: #e5e7eb;
      }

      @media (max-width: 480px) {
        body {
          padding: 1rem 0.5rem;
        }

        .panel {
          padding: 1rem;
        }
      }`;

export function renderDashboardPage(users: readonly MockUser[]): string {
  const stats = summarizeUsers(users);
  const cards = [
    renderStatCard("Total de usuários", stats.total),
    renderStatCard("Ativos", stats.active),
    renderStatCard("Inativos", stats.inactive),
    renderStatCard("Administradores", stats.byRole.admin),
  ].join("\n");
  const rows = users.map(renderUserRow).join("\n");

  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Dashboard</title>
    <style>
${STYLES}
    </style>
  </head>
  <body>
    <main class="dashboard">
      <h1>Dashboard</h1>
      <p class="subtitle">Dados fictícios de usuários para demonstração.</p>
      <section class="stats" aria-label="Resumo">
${cards}
      </section>
      <section class="panel">
        <h2>Usuários</h2>
        <table id="users-table">
          <thead>
            <tr>
              <th scope="col">Nome</th>
              <th scope="col">E-mail</th>
              <th scope="col">Senha</th>
              <th scope="col">Perfil</th>
              <th scope="col">Status</th>
              <th scope="col">Último acesso</th>
            </tr>
          </thead>
          <tbody>
${rows}
          </tbody>
        </table>
      </section>
    </main>
  </body>
</html>
`;
}
