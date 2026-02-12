import { Bell, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRole } from "@/contexts/RoleContext";
import type { UserRole } from "@/contexts/RoleContext";

export function AppHeader() {
  const { role, switchRole, isAdmin, currentUser } = useRole();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes, apólices, sinistros..."
            className="pl-9 bg-secondary border-0 h-9 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Role Switcher */}
        <Select value={role} onValueChange={(v) => switchRole(v as UserRole)}>
          <SelectTrigger className="w-[160px] h-8 text-xs border-dashed">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">👑 Administrador</SelectItem>
            <SelectItem value="corretor">👤 Corretor</SelectItem>
          </SelectContent>
        </Select>

        <Button size="sm" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 h-9 text-sm font-semibold">
          <Plus className="h-4 w-4" />
          Nova Apólice
        </Button>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
        </Button>
      </div>
    </header>
  );
}
