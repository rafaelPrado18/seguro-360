import { Bell, Search, Plus, Sun, Moon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useRole } from "@/contexts/RoleContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useNotifications } from "@/contexts/NotificationContext";
import type { UserRole } from "@/contexts/RoleContext";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function AppHeader() {
  const { role, switchRole } = useRole();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

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
        <Select value={role} onValueChange={(v) => switchRole(v as UserRole)}>
          <SelectTrigger className="w-[160px] h-8 text-xs border-dashed">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">👑 Administrador</SelectItem>
            <SelectItem value="corretor">👤 Corretor</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleTheme}>
          {theme === "light" ? <Moon className="h-4 w-4 text-muted-foreground" /> : <Sun className="h-4 w-4 text-muted-foreground" />}
        </Button>

        <Button size="sm" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 h-9 text-sm font-semibold">
          <Plus className="h-4 w-4" />
          Nova Apólice
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-4 w-4 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h4 className="text-sm font-semibold">Notificações</h4>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllAsRead}>
                  <Check className="h-3 w-3 mr-1" /> Marcar todas
                </Button>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">Nenhuma notificação</p>
              ) : (
                notifications.slice(0, 10).map(n => (
                  <button
                    key={n.id}
                    className={`w-full text-left px-4 py-3 border-b border-border hover:bg-muted/50 transition-colors ${!n.read ? "bg-accent/5" : ""}`}
                    onClick={() => markAsRead(n.id)}
                  >
                    <div className="flex items-start gap-2">
                      {!n.read && <span className="mt-1.5 h-2 w-2 rounded-full bg-accent shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{n.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true, locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
