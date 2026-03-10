import { AppLayout } from "@/components/layout/AppLayout";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRole, ROLE_LABELS, ROLE_EMOJI } from "@/contexts/RoleContext";
import { useNavigate } from "react-router-dom";
import {
  Users, FileText, DollarSign, AlertTriangle, RefreshCw, TrendingUp, Target, MessageSquare, Bell, Zap,
  Calendar, Settings, BarChart3, ArrowRight, Clock, UserPlus, FileCheck, PhoneCall,
} from "lucide-react";

// --- KPIs with scope tags ---
const allKpis = [
  { title: "Clientes Ativos", value: "1.247", change: "+12% este mês", changeType: "positive" as const, icon: Users, scopes: ["clientes"] },
  { title: "Leads Ativos", value: "34", change: "+6 esta semana", changeType: "positive" as const, icon: Target, scopes: ["leads"] },
  { title: "Apólices Vigentes", value: "3.892", change: "+8% este mês", changeType: "positive" as const, icon: FileText, scopes: ["apolices"] },
  { title: "Comissões (Mês)", value: "R$ 48.520", change: "+15% vs mês anterior", changeType: "positive" as const, icon: DollarSign, scopes: ["comissoes"] },
  { title: "Sinistros Abertos", value: "23", change: "-5% este mês", changeType: "negative" as const, icon: AlertTriangle, scopes: ["sinistros"] },
  { title: "Renovações Pendentes", value: "67", change: "Próximos 30 dias", changeType: "neutral" as const, icon: RefreshCw, scopes: ["renovacoes"] },
  { title: "Mensagens WhatsApp", value: "128", change: "12 não lidas", changeType: "neutral" as const, icon: MessageSquare, scopes: ["whatsapp"] },
  { title: "Prêmio Total", value: "R$ 2.1M", change: "+18% YoY", changeType: "positive" as const, icon: TrendingUp, scopes: ["comissoes", "apolices"] },
];

// --- Shortcuts ---
const allShortcuts = [
  { title: "Leads", desc: "Gerenciar leads e oportunidades", icon: Target, path: "/leads", color: "bg-accent/15 text-accent", scopes: ["leads"] },
  { title: "Clientes", desc: "Carteira de clientes", icon: Users, path: "/clientes", color: "bg-primary/15 text-primary", scopes: ["clientes"] },
  { title: "Apólices", desc: "Consultar apólices vigentes", icon: FileText, path: "/apolices", color: "bg-info/15 text-info", scopes: ["apolices"] },
  { title: "Sinistros", desc: "Acompanhar sinistros", icon: AlertTriangle, path: "/sinistros", color: "bg-destructive/15 text-destructive", scopes: ["sinistros"] },
  { title: "Renovações", desc: "Renovações pendentes", icon: RefreshCw, path: "/renovacoes", color: "bg-warning/15 text-warning", scopes: ["renovacoes"] },
  { title: "Comissões", desc: "Extrato de comissões", icon: DollarSign, path: "/comissoes", color: "bg-success/15 text-success", scopes: ["comissoes"] },
  { title: "WhatsApp", desc: "Mensagens e atendimento", icon: MessageSquare, path: "/whatsapp", color: "bg-accent/15 text-accent", scopes: ["whatsapp"] },
  { title: "Agenda", desc: "Compromissos e tarefas", icon: Calendar, path: "/agenda", color: "bg-primary/15 text-primary", scopes: [] },
  { title: "Relatórios", desc: "Análises e relatórios", icon: BarChart3, path: "/relatorios", color: "bg-muted-foreground/15 text-muted-foreground", scopes: ["relatorios"] },
];

// --- Activities with scope tags ---
const allActivities = [
  { type: "nova_apolice", desc: "Apólice Auto #4521 emitida para João Silva", time: "Há 15 min", status: "success", scopes: ["apolices"] },
  { type: "sinistro", desc: "Sinistro #892 aberto - Colisão veicular", time: "Há 45 min", status: "warning", scopes: ["sinistros"] },
  { type: "renovacao", desc: "Renovação #3201 aprovada - Maria Santos", time: "Há 1h", status: "info", scopes: ["renovacoes"] },
  { type: "comissao", desc: "Comissão R$ 1.250 creditada - Ref. Apólice #4498", time: "Há 2h", status: "success", scopes: ["comissoes"] },
  { type: "cliente", desc: "Novo cliente cadastrado - Empresa ABC Ltda", time: "Há 3h", status: "info", scopes: ["clientes"] },
  { type: "sinistro", desc: "Sinistro #887 encerrado - Indenização paga", time: "Há 4h", status: "success", scopes: ["sinistros"] },
  { type: "lead", desc: "Novo lead capturado - Ricardo Pereira (Auto)", time: "Há 5h", status: "info", scopes: ["leads"] },
  { type: "renovacao", desc: "Lembrete enviado - Renovação #3180", time: "Há 6h", status: "info", scopes: ["renovacoes"] },
];

const renewals = [
  { cliente: "Carlos Mendes", apolice: "Auto #3201", vencimento: "15/02/2026", premio: "R$ 3.200" },
  { cliente: "Ana Souza", apolice: "Vida #1890", vencimento: "18/02/2026", premio: "R$ 1.800" },
  { cliente: "Empresa XYZ", apolice: "Emp. #567", vencimento: "20/02/2026", premio: "R$ 12.500" },
  { cliente: "Roberto Lima", apolice: "Res. #2340", vencimento: "22/02/2026", premio: "R$ 2.100" },
  { cliente: "Fernanda Costa", apolice: "Auto #3567", vencimento: "25/02/2026", premio: "R$ 4.500" },
];

// Lead summary data
const leadSummary = [
  { label: "Novos Hoje", value: 5, icon: UserPlus, color: "text-accent" },
  { label: "Em Atendimento", value: 12, icon: PhoneCall, color: "text-primary" },
  { label: "Aguardando Proposta", value: 8, icon: FileCheck, color: "text-warning" },
  { label: "Convertidos (Mês)", value: 18, icon: TrendingUp, color: "text-success" },
];

// Mock count of new leads for demo
const MOCK_NEW_LEADS_COUNT = 5;

const Dashboard = () => {
  const { role, hasScope, isAdmin, currentUser, brokerStatus } = useRole();
  const navigate = useNavigate();

  const visibleKpis = allKpis.filter(k => k.scopes.some(s => hasScope(s)));
  const visibleActivities = allActivities.filter(a => a.scopes.some(s => hasScope(s)));
  const visibleShortcuts = allShortcuts.filter(s => s.scopes.length === 0 || s.scopes.some(sc => hasScope(sc)));
  const showRenewals = hasScope("renovacoes");
  const showLeadSummary = hasScope("leads");
  const showNewLeadsAlert = !isAdmin && hasScope("leads") && MOCK_NEW_LEADS_COUNT > 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Offline Warning */}
        {!isAdmin && brokerStatus === "offline" && (
          <div className="animate-fade-in rounded-xl border-2 border-destructive/30 bg-destructive/10 p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20 animate-pulse">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-destructive">Você está offline!</h3>
              <p className="text-xs text-destructive/80">Novos leads e mensagens de WhatsApp não serão distribuídos para você enquanto estiver offline.</p>
            </div>
          </div>
        )}

        {/* New Leads Alert */}
        {showNewLeadsAlert && (
          <div className="animate-fade-in rounded-xl border-2 border-accent/40 bg-accent/10 p-4 flex items-center gap-4 cursor-pointer hover:bg-accent/15 transition-colors" onClick={() => navigate("/leads")}>
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-accent/20">
              <Zap className="h-6 w-6 text-accent" />
              <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-pulse">
                {MOCK_NEW_LEADS_COUNT}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-foreground">
                {MOCK_NEW_LEADS_COUNT} lead{MOCK_NEW_LEADS_COUNT > 1 ? "s" : ""} aguardando atendimento!
              </h3>
              <p className="text-xs text-muted-foreground">Clique para visualizar e iniciar o contato</p>
            </div>
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5">
              <Bell className="h-3.5 w-3.5" />
              Ver Leads
            </Button>
          </div>
        )}

        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            {isAdmin ? "Visão geral da sua corretora de seguros" : `${ROLE_EMOJI[role]} ${ROLE_LABELS[role]} — ${currentUser.nome}`}
          </p>
        </div>

        {/* KPI Grid */}
        <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 ${visibleKpis.length > 4 ? "xl:grid-cols-6" : visibleKpis.length > 3 ? "xl:grid-cols-4" : ""}`}>
          {visibleKpis.map((kpi, i) => (
            <KpiCard key={kpi.title} title={kpi.title} value={kpi.value} change={kpi.change} changeType={kpi.changeType} icon={kpi.icon} index={i} />
          ))}
        </div>

        {/* Shortcuts Grid */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Acesso Rápido</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {visibleShortcuts.map((shortcut) => (
              <button
                key={shortcut.path}
                onClick={() => navigate(shortcut.path)}
                className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${shortcut.color} shrink-0`}>
                  <shortcut.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">{shortcut.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{shortcut.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Lead Summary + Renewals + Activities */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Lead Summary */}
          {showLeadSummary && (
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold">Resumo de Leads</CardTitle>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => navigate("/leads")}>
                  Ver todos <ArrowRight className="h-3 w-3" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {leadSummary.map((item, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="flex items-center gap-3">
                      <item.icon className={`h-4 w-4 ${item.color}`} />
                      <span className="text-sm text-foreground">{item.label}</span>
                    </div>
                    <span className={`text-lg font-bold ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Renovações Próximas */}
          {showRenewals && (
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold">Renovações Próximas</CardTitle>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => navigate("/renovacoes")}>
                  Ver todas <ArrowRight className="h-3 w-3" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {renewals.slice(0, 4).map((r, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                      <div>
                        <p className="text-sm font-medium text-foreground">{r.cliente}</p>
                        <p className="text-[11px] text-muted-foreground">{r.apolice} · Vence {r.vencimento}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">{r.premio}</p>
                        <Badge variant="outline" className="text-[10px] mt-0.5 border-warning text-warning">Pendente</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Atividades Recentes */}
          <Card className={!showLeadSummary && !showRenewals ? "lg:col-span-3" : ""}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {visibleActivities.slice(0, 6).map((activity, i) => (
                <div key={i} className="flex items-start gap-3 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${
                    activity.status === "success" ? "bg-success" :
                    activity.status === "warning" ? "bg-warning" :
                    "bg-info"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{activity.desc}</p>
                    <p className="text-[11px] text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
