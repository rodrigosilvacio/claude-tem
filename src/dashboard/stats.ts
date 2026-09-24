import type { MockUser, UserRole } from "./mock-users.js";

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<UserRole, number>;
}

export function summarizeUsers(users: readonly MockUser[]): UserStats {
  const byRole: Record<UserRole, number> = { admin: 0, editor: 0, viewer: 0 };
  let active = 0;
  for (const user of users) {
    byRole[user.role] += 1;
    if (user.status === "active") active += 1;
  }
  return { total: users.length, active, inactive: users.length - active, byRole };
}

// Nunca exibe a senha: devolve um marcador de tamanho fixo para não revelar o comprimento.
export function maskPassword(_password: string): string {
  return "••••••••";
}
