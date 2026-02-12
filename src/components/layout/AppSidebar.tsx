import { Link, useLocation } from "react-router-dom";
import { useNotifications } from "@/contexts/NotificationContext";
import logoHataseg from "@/assets/logo-hataseg.png";
import {
  LayoutDashboard,
  Users,
  FileText,
  AlertTriangle,
  DollarSign,
  RefreshCw,
  CalendarCheck,
  Settings,
  Shield,
  BarChart3,
  Target,
  MessageSquare,
  FileStack,
  Workflow,
} from "lucide-react";
import { useRole, ROLE_LABELS } from "@/contexts/RoleContext";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/", adminOnly: false },
  { icon: Target, label: "Leads", path: "/leads", adminOnly: false },
  { icon: MessageSquare, label: "WhatsApp", path: "/whatsapp", adminOnly: false },
  { icon: FileStack, label: "Templates", path: "/whatsapp/templates", adminOnly: false },
  { icon: Users, label: "Clientes", path: "/clientes", adminOnly: false },
  { icon: FileText, label: "Apólices", path: "/apolices", adminOnly: false },
  { icon: AlertTriangle, label: "Sinistros", path: "/sinistros", adminOnly: false },
  { icon: DollarSign, label: "Comissões", path: "/comissoes", adminOnly: false },
  { icon: RefreshCw, label: "Renovações", path: "/renovacoes", adminOnly: false },
  { icon: CalendarCheck, label: "Agenda", path: "/agenda", adminOnly: false },
  { icon: BarChart3, label: "Relatórios", path: "/relatorios", adminOnly: true },
  { icon: Workflow, label: "Ger. Status", path: "/gerenciar-status", adminOnly: true },
  { icon: Settings, label: "Configurações", path: "/configuracoes", adminOnly: true },
];

export function AppSidebar() {
  const location = useLocation();
  const { isAdmin, currentUser } = useRole();
  const { unreadCount } = useNotifications();

  const visibleItems = menuItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <aside className="sidebar-gradient flex w-64 flex-col border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-4 border-b border-sidebar-border">
        <img src={logoHataseg} alt="HataSeg" className="h-10 w-10 object-contain rounded" />
        <div>
          <h1 className="text-sm font-bold text-sidebar-accent-foreground tracking-wide">HataSeg</h1>
          <p className="text-[10px] text-sidebar-muted uppercase tracking-widest">Seguros & Previdência</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className={`h-4 w-4 ${isActive ? "text-sidebar-primary" : ""}`} />
              {item.label}
              {item.path === "/leads" && unreadCount > 0 && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
              {isActive && !( item.path === "/leads" && unreadCount > 0) && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
            {currentUser.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-accent-foreground truncate">{currentUser.nome}</p>
            <p className="text-[11px] text-sidebar-muted truncate">{ROLE_LABELS[currentUser.role]}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
