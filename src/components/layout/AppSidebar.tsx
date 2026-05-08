import { Link, useLocation } from "react-router-dom";
import { useNotifications } from "@/contexts/NotificationContext";
import logoHataseg from "@/assets/logo-hataseg.png";
import {
  LayoutDashboard, Users, FileText, AlertTriangle, DollarSign,
  RefreshCw, CalendarCheck, Settings, BarChart3, Target,
  MessageSquare, FileStack, Workflow, X, Circle, Smartphone, Building2,
  ChevronsLeft, ChevronsRight, Wallet, Clock,
} from "lucide-react";
import { useRole, ROLE_LABELS } from "@/contexts/RoleContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const menuItems = [
  { icon: Clock, label: "Registro de Ponto", path: "/ponto", adminOnly: false, superAdminOnly: false, scope: null, highlighted: true },
  { icon: LayoutDashboard, label: "Dashboard", path: "/", adminOnly: false, superAdminOnly: false, scope: null },
  { icon: Target, label: "Leads", path: "/leads", adminOnly: false, superAdminOnly: false, scope: "leads" },
  { icon: MessageSquare, label: "WhatsApp", path: "/whatsapp", adminOnly: false, superAdminOnly: false, scope: "whatsapp" },
  { icon: FileStack, label: "Templates", path: "/whatsapp/templates", adminOnly: false, superAdminOnly: false, scope: "whatsapp" },
  { icon: Smartphone, label: "Instâncias WA", path: "/whatsapp/instancias", adminOnly: true, superAdminOnly: false, scope: null },
  { icon: Users, label: "Clientes", path: "/clientes", adminOnly: false, superAdminOnly: false, scope: "clientes" },
  { icon: FileText, label: "Apólices", path: "/apolices", adminOnly: false, superAdminOnly: false, scope: "apolices" },
  { icon: AlertTriangle, label: "Sinistros", path: "/sinistros", adminOnly: false, superAdminOnly: false, scope: "sinistros" },
  { icon: DollarSign, label: "Comissões", path: "/comissoes", adminOnly: false, superAdminOnly: false, scope: "comissoes" },
  { icon: Wallet, label: "Financeiro", path: "/financeiro", adminOnly: false, superAdminOnly: false, scope: "comissoes" },
  { icon: RefreshCw, label: "Renovações", path: "/renovacoes", adminOnly: false, superAdminOnly: false, scope: "renovacoes" },
  { icon: CalendarCheck, label: "Agenda", path: "/agenda", adminOnly: false, superAdminOnly: false, scope: null },
  
  { icon: BarChart3, label: "Relatórios", path: "/relatorios", adminOnly: false, superAdminOnly: false, scope: null },
  { icon: Workflow, label: "Ger. Status Leads", path: "/gerenciar-status", adminOnly: true, superAdminOnly: false, scope: null },
  { icon: Workflow, label: "Ger. Status Renov.", path: "/gerenciar-status-renovacao", adminOnly: true, superAdminOnly: false, scope: null },
  { icon: Users, label: "Usuários", path: "/usuarios", adminOnly: true, superAdminOnly: false, scope: null },
  { icon: Settings, label: "Configurações", path: "/configuracoes", adminOnly: true, superAdminOnly: false, scope: null },
  { icon: Building2, label: "Empresas", path: "/empresas", adminOnly: false, superAdminOnly: true, scope: null },
];

interface AppSidebarProps {
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AppSidebar({ onClose, collapsed = false, onToggleCollapse }: AppSidebarProps) {
  const location = useLocation();
  const { isAdmin, isSuperAdmin, currentUser, hasScope, brokerStatus, setBrokerStatus } = useRole();
  const { unreadCount } = useNotifications();

  const visibleItems = menuItems.filter(item => {
    if (item.superAdminOnly && !isSuperAdmin) return false;
    if (item.adminOnly && !isAdmin) return false;
    if (item.scope && !hasScope(item.scope)) return false;
    return true;
  });

  return (
    <aside className={`sidebar-gradient flex flex-col border-r border-sidebar-border h-full transition-all duration-200 ${collapsed ? "w-16" : "w-64"}`}>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-3 border-b border-sidebar-border">
        <div className="flex items-center gap-3 min-w-0">
          <img src={logoHataseg} alt="HataSeg" className="h-10 w-10 object-contain rounded flex-shrink-0" />
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-sidebar-accent-foreground tracking-wide">HataSeg</h1>
              <p className="text-[10px] text-sidebar-muted uppercase tracking-widest truncate">Seguros & Previdência</p>
            </div>
          )}
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden text-sidebar-foreground flex-shrink-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Collapse toggle (desktop only) */}
      <div className="hidden lg:flex justify-end px-2 py-1.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={onToggleCollapse}
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-2 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = location.pathname === item.path;
          const linkContent = (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                collapsed ? "justify-center px-0" : ""
              } ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-sidebar-primary" : ""}`} />
              {!collapsed && (
                <>
                  <span className="truncate">{item.label}</span>
                  {item.path === "/leads" && unreadCount > 0 && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-pulse shadow-md">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                  {isActive && !(item.path === "/leads" && unreadCount > 0) && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" />
                  )}
                </>
              )}
              {collapsed && item.path === "/leads" && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[8px] font-bold text-destructive-foreground animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.path} delayDuration={0}>
                <TooltipTrigger asChild>
                  <div className="relative">{linkContent}</div>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return linkContent;
        })}
      </nav>

      {/* User */}
      <div className="border-t border-sidebar-border p-3 space-y-3">
        {!collapsed ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Circle className={`h-2.5 w-2.5 fill-current ${brokerStatus === "online" ? "text-success" : "text-destructive"}`} />
                <span className={`text-xs font-medium ${brokerStatus === "online" ? "text-success" : "text-destructive"}`}>
                  {brokerStatus === "online" ? "Online" : "Offline"}
                </span>
              </div>
              <Switch
                checked={brokerStatus === "online"}
                onCheckedChange={(checked) => setBrokerStatus(checked ? "online" : "offline")}
                className="scale-75"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
                  {currentUser.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-sidebar-border ${brokerStatus === "online" ? "bg-success" : "bg-destructive"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-accent-foreground truncate">{currentUser.nome}</p>
                <p className="text-[11px] text-sidebar-muted truncate">{ROLE_LABELS[currentUser.role]}</p>
              </div>
            </div>
          </>
        ) : (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div className="flex justify-center">
                <div className="relative">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
                    {currentUser.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-sidebar-border ${brokerStatus === "online" ? "bg-success" : "bg-destructive"}`} />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="font-medium">{currentUser.nome}</p>
              <p className="text-xs text-muted-foreground">{ROLE_LABELS[currentUser.role]}</p>
              <p className={`text-xs ${brokerStatus === "online" ? "text-success" : "text-destructive"}`}>
                {brokerStatus === "online" ? "Online" : "Offline"}
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </aside>
  );
}
