import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "admin" | "corretor_novo" | "corretor_renovacao" | "corretor_sinistro" | "corretor_financeiro";

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
}

const PROFILES: Record<UserRole, UserProfile> = {
  admin: { id: "admin-1", nome: "Admin Geral", email: "admin@hataseg.com", role: "admin" },
  corretor_novo: { id: "corretor-novo-1", nome: "André Oliveira", email: "andre@hataseg.com", role: "corretor_novo" },
  corretor_renovacao: { id: "corretor-renov-1", nome: "Beatriz Costa", email: "beatriz@hataseg.com", role: "corretor_renovacao" },
  corretor_sinistro: { id: "corretor-sin-1", nome: "Carlos Neto", email: "carlos@hataseg.com", role: "corretor_sinistro" },
  corretor_financeiro: { id: "corretor-fin-1", nome: "Diana Alves", email: "diana@hataseg.com", role: "corretor_financeiro" },
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  corretor_novo: "Corretor — Novo",
  corretor_renovacao: "Corretor — Renovação",
  corretor_sinistro: "Corretor — Sinistro",
  corretor_financeiro: "Corretor — Financeiro",
};

export const ROLE_EMOJI: Record<UserRole, string> = {
  admin: "👑",
  corretor_novo: "🎯",
  corretor_renovacao: "🔄",
  corretor_sinistro: "⚠️",
  corretor_financeiro: "💰",
};

/** Which data scopes each role focuses on */
export const ROLE_SCOPES: Record<UserRole, string[]> = {
  admin: ["todos"],
  corretor_novo: ["leads", "whatsapp", "clientes", "apolices"],
  corretor_renovacao: ["renovacoes", "apolices", "clientes", "whatsapp"],
  corretor_sinistro: ["sinistros", "clientes", "apolices", "whatsapp"],
  corretor_financeiro: ["comissoes", "relatorios", "apolices", "clientes"],
};

interface RoleContextType {
  currentUser: UserProfile;
  role: UserRole;
  switchRole: (role: UserRole) => void;
  isAdmin: boolean;
  isCorretorType: (type: UserRole) => boolean;
  hasScope: (scope: string) => boolean;
}

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>("admin");

  const currentUser = PROFILES[role];
  const scopes = ROLE_SCOPES[role];

  const hasScope = (scope: string) => role === "admin" || scopes.includes(scope);

  return (
    <RoleContext.Provider value={{
      currentUser,
      role,
      switchRole: setRole,
      isAdmin: role === "admin",
      isCorretorType: (type: UserRole) => role === type,
      hasScope,
    }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
