import { Bell, Search, Plus, Sun, Moon, Check, Menu, WifiOff, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useRole, ROLE_LABELS } from "@/contexts/RoleContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useNotifications } from "@/contexts/NotificationContext";
import type { UserRole } from "@/contexts/RoleContext";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NovaApoliceDialog } from "@/components/apolices/NovaApoliceDialog";

interface AppHeaderProps {
  onMenuToggle?: () => void;
}

export function AppHeader({ onMenuToggle }: AppHeaderProps) {
  const { role, currentUser, brokerStatus, setBrokerStatus } = useRole();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [novaApoliceOpen, setNovaApoliceOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

  const handleLogout = async () => {
    // Update status to offline before clearing cookies
    const token = document.cookie.match(/(?:^| )userToken=([^;]+)/)?.[1];
    const userId = document.cookie.match(/(?:^| )userId=([^;]+)/)?.[1];
    const userName = document.cookie.match(/(?:^| )userName=([^;]+)/)?.[1];
    const userEmail = document.cookie.match(/(?:^| )userEmail=([^;]+)/)?.[1];

    if (token && userId) {
      try {
        await fetch("https://crm-hataseg.com.br/v1/update/agent/status", {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${decodeURIComponent(token)}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agentId: currentUser.id,
            status: "offline",
            userId: userId,
          }),
        });
      } catch (err) {
        console.error("Erro ao atualizar status para offline:", err);
      }
    }

    const cookies = ["userToken", "userId", "userName", "userEmail", "userFunction", "userStatus", "assignedConsultant"];
    cookies.forEach(c => document.cookie = `${c}=; path=/; max-age=0`);
    navigate("/login", { replace: true });
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchValue.trim()) {
      const q = searchValue.toLowerCase();
      if (q.includes("lead")) navigate("/leads");
      else if (q.includes("apólice") || q.includes("apolice")) navigate("/apolices");
      else if (q.includes("sinistro")) navigate("/sinistros");
      else if (q.includes("cliente")) navigate("/clientes");
      else if (q.includes("renov")) navigate("/renovacoes");
      else if (q.includes("comiss")) navigate("/comissoes");
      else navigate("/clientes");
      setSearchValue("");
    }
  };

  

  return (
    <div>
      {brokerStatus === "offline" && (
        <div className="flex items-center justify-between gap-2 bg-destructive/15 border-b-2 border-destructive/40 px-4 py-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/20 animate-pulse">
              <WifiOff className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <span className="text-xs font-bold text-destructive block">
                ⚠️ Você está OFFLINE
              </span>
              <span className="text-[10px] text-destructive/70">
                Leads e mensagens não serão distribuídos para você
              </span>
            </div>
          </div>
          <Button
            size="sm"
            className="h-8 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold animate-pulse"
            onClick={() => setBrokerStatus("online")}
          >
            Ficar Online Agora
          </Button>
        </div>
      )}
    <header className="flex h-14 sm:h-16 items-center justify-between border-b border-border bg-card px-3 sm:px-6 gap-2">
      {/* Left: hamburger + search */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Button variant="ghost" size="icon" className="h-9 w-9 lg:hidden flex-shrink-0" onClick={onMenuToggle}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="relative flex-1 max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes, apólices, sinistros..."
            className="pl-9 bg-secondary border-0 h-9 text-sm"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
        <span className="text-xs text-muted-foreground hidden sm:inline font-medium">
          {currentUser.nome} · {ROLE_LABELS[role]}
        </span>

        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleTheme}>
          {theme === "light" ? <Moon className="h-4 w-4 text-muted-foreground" /> : <Sun className="h-4 w-4 text-muted-foreground" />}
        </Button>

        <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout} title="Sair">
          <LogOut className="h-4 w-4" />
        </Button>

        <Button size="sm" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 h-9 text-sm font-semibold hidden md:flex" onClick={() => setNovaApoliceOpen(true)}>
          <Plus className="h-4 w-4" />
          Nova Apólice
        </Button>
        <Button size="icon" className="h-9 w-9 bg-accent text-accent-foreground hover:bg-accent/90 md:hidden" onClick={() => setNovaApoliceOpen(true)}>
          <Plus className="h-4 w-4" />
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className={`relative h-9 w-9 ${unreadCount > 0 ? "text-accent" : ""}`}>
              <Bell className={`h-4 w-4 ${unreadCount > 0 ? "text-accent animate-[scale-in_0.3s_ease-out]" : "text-muted-foreground"}`} />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-pulse shadow-lg">
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
              {notifications.filter(n => !n.read).length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">Nenhuma notificação não lida</p>
              ) : (
                notifications.filter(n => !n.read).slice(0, 10).map(n => (
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
                          {n.timestamp}
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
    <NovaApoliceDialog open={novaApoliceOpen} onOpenChange={setNovaApoliceOpen} />
    </div>
  );
}
