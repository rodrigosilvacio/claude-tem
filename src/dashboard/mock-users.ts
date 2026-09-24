export type UserRole = "admin" | "editor" | "viewer";
export type UserStatus = "active" | "inactive";

export interface MockUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
}

// Dados fictícios apenas para demonstração: nenhuma credencial é real.
export const mockUsers: readonly MockUser[] = [
  {
    id: 1,
    name: "Ana Souza",
    email: "ana.souza@example.com",
    password: "ana@2026",
    role: "admin",
    status: "active",
    lastLogin: "2026-09-24T09:15:00Z",
  },
  {
    id: 2,
    name: "Bruno Lima",
    email: "bruno.lima@example.com",
    password: "bruno#123",
    role: "editor",
    status: "active",
    lastLogin: "2026-09-23T17:42:00Z",
  },
  {
    id: 3,
    name: "Carla Mendes",
    email: "carla.mendes@example.com",
    password: "carla!pass",
    role: "viewer",
    status: "inactive",
    lastLogin: "2026-08-30T11:05:00Z",
  },
  {
    id: 4,
    name: "Diego Rocha",
    email: "diego.rocha@example.com",
    password: "diego$456",
    role: "editor",
    status: "active",
    lastLogin: "2026-09-22T08:30:00Z",
  },
  {
    id: 5,
    name: "Elisa Martins",
    email: "elisa.martins@example.com",
    password: "elisa&789",
    role: "viewer",
    status: "active",
    lastLogin: "2026-09-20T14:10:00Z",
  },
];
