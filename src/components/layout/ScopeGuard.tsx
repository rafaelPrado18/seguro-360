import { Navigate } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";

interface ScopeGuardProps {
  scope: string;
  children: React.ReactNode;
}

export function ScopeGuard({ scope, children }: ScopeGuardProps) {
  const { hasScope } = useRole();

  if (!hasScope(scope)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { isAdmin } = useRole();

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
