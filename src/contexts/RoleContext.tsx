import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "super_admin" | "administrador" | "corretor" | "corretor_renovacao" | "corretor_sinistro" | "corretor_financeiro";
export type BrokerStatus = "online" | "offline";

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  role: string;
}

/** Map API "function" field to internal UserRole */
const FUNCTION_TO_ROLE: Record<string, UserRole> = {
  "Super Admin": "super_admin",
  "Administrador": "administrador",
  "Admin": "administrador",
  "Corretor — Novo": "corretor",
  "Corretor — Renovação": "corretor_renovacao",
  "Corretor — Sinistro": "corretor_sinistro",
  "Corretor — Financeiro": "corretor_financeiro",
  "corretor": "corretor",
  "corretor_renovacao": "corretor_renovacao",
  "corretor_sinistro": "corretor_sinistro",
  "corretor_financeiro": "corretor_financeiro",
  "super_admin": "super_admin"
};

function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : "";
}

function getUserFromCookies(): UserProfile | null {
  const userId = getCookie("userId");
  const userName = getCookie("userName");
  const userEmail = getCookie("userEmail");
  const userFunction = getCookie("userFunction");

  if (!userId || !userName) return null;

  const role = FUNCTION_TO_ROLE[userFunction] || "corretor";

  return {
    id: userId,
    nome: userName,
    email: userEmail,
    role: userFunction,
  };
}

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  administrador: "Administrador",
  corretor: "Corretor — Novo",
  corretor_renovacao: "Corretor — Renovação",
  corretor_sinistro: "Corretor — Sinistro",
  corretor_financeiro: "Corretor — Financeiro",
};

export const ROLE_EMOJI: Record<UserRole, string> = {
  super_admin: "🏢",
  administrador: "👑",
  corretor: "🎯",
  corretor_renovacao: "🔄",
  corretor_sinistro: "⚠️",
  corretor_financeiro: "💰",
};

/** Which data scopes each role focuses on */
export const ROLE_SCOPES: Record<UserRole, string[]> = {
  super_admin: ["todos"],
  administrador: ["todos"],
  corretor: ["leads", "whatsapp", "clientes", "apolices"],
  corretor_renovacao: ["renovacoes", "apolices", "clientes", "whatsapp"],
  corretor_sinistro: ["sinistros", "clientes", "apolices", "whatsapp"],
  corretor_financeiro: ["comissoes", "relatorios", "apolices", "clientes"],
};

interface RoleContextType {
  currentUser: UserProfile;
  role: UserRole;
  switchRole: (role: UserRole) => void;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isCorretorType: (type: UserRole) => boolean;
  hasScope: (scope: string) => boolean;
  brokerStatus: BrokerStatus;
  setBrokerStatus: (status: BrokerStatus) => void;
}

const RoleContext = createContext<RoleContextType | null>(null);

const DEFAULT_USER: UserProfile = { id: "guest", nome: "Visitante", email: "", role: "corretor" };

export function RoleProvider({ children }: { children: ReactNode }) {
  const cookieUser = getUserFromCookies();
  const [currentUser, setCurrentUser] = useState<UserProfile>(cookieUser || DEFAULT_USER);
  const [role, setRole] = useState<string>(currentUser.role);
  const [brokerStatus, setBrokerStatus] = useState<BrokerStatus>(
    (getCookie("userStatus") as BrokerStatus) || "online"
  );

  // Re-sync when cookies change (e.g. after login redirect)
  useEffect(() => {
    const u = getUserFromCookies();
    if (u && u.id !== currentUser.id) {
      setCurrentUser(u);
      setRole(u.role);
    }
  }, []);

  const scopes = ROLE_SCOPES[role];

  const isSuperAdmin = role === "super_admin";
  const hasScope = (scope: string) => role === "administrador" || role === "super_admin" || scopes.includes(scope);

  return (
    <RoleContext.Provider value={{
      currentUser,
      role,
      switchRole: setRole,
      isAdmin: role === "administrador" || role === "super_admin",
      isSuperAdmin: role === "super_admin",
      isCorretorType: (type: UserRole) => role === type,
      hasScope,
      brokerStatus,
      setBrokerStatus,
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
