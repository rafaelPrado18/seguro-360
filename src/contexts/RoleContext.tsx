import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "admin" | "corretor";

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
}

const ADMIN_PROFILE: UserProfile = {
  id: "admin-1",
  nome: "Admin Corretor",
  email: "admin@seguros.com",
  role: "admin",
};

const CORRETOR_PROFILE: UserProfile = {
  id: "corretor-1",
  nome: "André Oliveira",
  email: "andre@seguros.com",
  role: "corretor",
};

interface RoleContextType {
  currentUser: UserProfile;
  role: UserRole;
  switchRole: (role: UserRole) => void;
  isAdmin: boolean;
}

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>("admin");

  const currentUser = role === "admin" ? ADMIN_PROFILE : CORRETOR_PROFILE;

  return (
    <RoleContext.Provider value={{
      currentUser,
      role,
      switchRole: setRole,
      isAdmin: role === "admin",
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
