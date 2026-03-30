import { useMemo, useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRole, ROLE_LABELS, ROLE_EMOJI } from "@/contexts/RoleContext";
import { useNavigate } from "react-router-dom";
import { useLeads } from "@/hooks/useLeads";
import { useApolices } from "@/hooks/useApolices";
import { useFinanceiro } from "@/hooks/useFinanceiro";
import { sinistroService, type SinistroCreatePayload } from "@/services/sinistroService";
import {
  Users, FileText, DollarSign, AlertTriangle, RefreshCw, TrendingUp, Target, MessageSquare, Bell, Zap,
  Calendar, Settings, BarChart3, ArrowRight, Clock, UserPlus, FileCheck, PhoneCall, Loader2,
  ShieldAlert, Wrench, TimerOff, MessageCircle, Wallet, CheckCircle2, XCircle, AlertCircle,
} from "lucide-react";

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

function parseDateBR(dateStr: string): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.split("/");
  if (parts.length !== 3) return null;
  const [day, month, year] = parts;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

function getNovosCutoff(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon
  if (dayOfWeek === 1) {
    // Segunda-feira: desde sábado às 14h
    const sat = new Date(now);
    sat.setDate(sat.getDate() - 2);
    sat.setHours(14, 0, 0, 0);
    return sat;
  } else {
    // Outros dias: desde o dia anterior às 18h
    const prev = new Date(now);
    prev.setDate(prev.getDate() - 1);
    prev.setHours(18, 0, 0, 0);
    return prev;
  }
}

function parseLeadDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  // DD/MM/YYYY HH:mm:ss
  const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/);
  if (match) {
    return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]), Number(match[4]), Number(match[5]), Number(match[6]));
  }
  // DD/MM/YYYY only
  const match2 = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (match2) {
    return new Date(Number(match2[3]), Number(match2[2]) - 1, Number(match2[1]));
  }
  // ISO fallback
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function isNovo(dateStr: string): boolean {
  const d = parseLeadDate(dateStr);
  if (!d) return false;
  return d >= getNovosCutoff();
}

const Dashboard = () => {
  const { role, hasScope, isAdmin, currentUser, brokerStatus } = useRole();
  const navigate = useNavigate();

  const { data: leadsResponse, isLoading: leadsLoading } = useLeads(
    undefined,
    currentUser?.nome,
    isAdmin ? "administrador" : currentUser?.role
  );

  const { data: apolices, isLoading: apolicesLoading } = useApolices();

  // Fetch financeiro
  const { data: financeiroClients = [], isLoading: financeiroLoading } = useFinanceiro();

  const financeiroSummary = useMemo(() => {
    const total = financeiroClients.length;
    const comPendencias = financeiroClients.filter(c => c.parcelas?.some(p => p.status === "pendente")).length;
    const totalPendentes = financeiroClients.reduce((acc, c) => acc + (c.parcelas?.filter(p => p.status === "pendente").length || 0), 0);
    const criticos = financeiroClients.filter(c => (c.parcelas?.filter(p => p.status === "pendente").length || 0) >= 3).length;
    return [
      { label: "Total de Clientes", value: total, icon: Users, color: "text-primary" },
      { label: "Com Pendências", value: comPendencias, icon: AlertCircle, color: "text-warning" },
      { label: "Parcelas Pendentes", value: totalPendentes, icon: XCircle, color: "text-destructive" },
      { label: "Situação Crítica", value: criticos, icon: AlertTriangle, color: "text-destructive" },
    ];
  }, [financeiroClients]);

  // Fetch sinistros
  const [sinistros, setSinistros] = useState<SinistroCreatePayload[]>([]);
  const [sinistrosLoading, setSinistrosLoading] = useState(true);
  useEffect(() => {
    sinistroService.fetchSinistros()
      .then(data => setSinistros(data))
      .catch(() => setSinistros([]))
      .finally(() => setSinistrosLoading(false));
  }, []);

  const sinistroSummary = useMemo(() => {
    const count = (status: string) => sinistros.filter(s => s.status === status).length;
    return [
      { label: "Abertura / Agend. Vistoria", value: count("abertura"), icon: ShieldAlert, color: "text-info" },
      { label: "Indenização Integral", value: count("indenizacao_integral"), icon: DollarSign, color: "text-accent" },
      { label: "Fora do Prazo", value: count("fora_do_prazo"), icon: TimerOff, color: "text-destructive" },
      { label: "Acompanhamento de Reparo", value: count("acompanhamento_reparo"), icon: Wrench, color: "text-success" },
      { label: "WhatsApp", value: count("whats"), icon: MessageCircle, color: "text-primary" },
    ];
  }, [sinistros]);

  // Compute real lead summary
  const leadSummary = useMemo(() => {
    const leads = leadsResponse?.data || [];
    const novosHoje = leads.filter(l => isNovo(l.created_at)).length;
    const emAtendimento = leads.filter(l => l.status === "em_contato" || l.status === "qualificado").length;
    const aguardandoProposta = leads.filter(l => l.status === "proposta_enviada").length;
    const convertidos = leads.filter(l => l.status === "convertido").length;
    return [
      { label: "Novos Hoje", value: novosHoje, icon: UserPlus, color: "text-accent" },
      { label: "Em Atendimento", value: emAtendimento, icon: PhoneCall, color: "text-primary" },
      { label: "Aguardando Proposta", value: aguardandoProposta, icon: FileCheck, color: "text-warning" },
      { label: "Convertidos", value: convertidos, icon: TrendingUp, color: "text-success" },
    ];
  }, [leadsResponse]);

  const totalLeads = leadsResponse?.data?.length || 0;
  const newLeadsCount = leadSummary[0]?.value || 0;

  // Compute real renewals from apolices (vigencia_fim within next 30 days)
  const upcomingRenewals = useMemo(() => {
    if (!apolices) return [];
    const now = new Date();
    const in30 = new Date();
    in30.setDate(in30.getDate() + 60);

    return apolices
      .map(a => {
        const fimDate = parseDateBR(a.fim);
        return { ...a, fimDate };
      })
      .filter(a => a.fimDate && a.fimDate >= now && a.fimDate <= in30)
      .sort((a, b) => (a.fimDate!.getTime() - b.fimDate!.getTime()));
  }, [apolices]);

  // Real KPIs
  const visibleKpis = useMemo(() => {
    const kpis = [];
    if (hasScope("leads")) {
      kpis.push({
        title: "Leads Ativos", value: String(totalLeads), change: `${newLeadsCount} novos hoje`,
        changeType: newLeadsCount > 0 ? "positive" as const : "neutral" as const, icon: Target,
      });
    }
    if (hasScope("apolices")) {
      const vigentes = apolices?.filter(a => a.status === "Vigente").length || 0;
      kpis.push({
        title: "Apólices Vigentes", value: String(vigentes), change: `${apolices?.length || 0} total`,
        changeType: "positive" as const, icon: FileText,
      });
    }
    if (hasScope("renovacoes")) {
      kpis.push({
        title: "Renovações Próximas", value: String(upcomingRenewals.length), change: "Próximos 60 dias",
        changeType: upcomingRenewals.length > 0 ? "neutral" as const : "positive" as const, icon: RefreshCw,
      });
    }
    if (hasScope("whatsapp")) {
      kpis.push({
        title: "Mensagens WhatsApp", value: "—", change: "Acesse para ver",
        changeType: "neutral" as const, icon: MessageSquare,
      });
    }
    if (hasScope("sinistros")) {
      kpis.push({
        title: "Sinistros", value: String(sinistros.length), change: `${sinistroSummary.find(s => s.label.includes("Abertura"))?.value || 0} em abertura`,
        changeType: sinistros.length > 0 ? "neutral" as const : "positive" as const, icon: AlertTriangle,
      });
    }
    if (hasScope("comissoes")) {
      const pendencias = financeiroSummary[1]?.value || 0;
      kpis.push({
        title: "Financeiro", value: String(financeiroClients.length), change: `${pendencias} com pendências`,
        changeType: pendencias > 0 ? "neutral" as const : "positive" as const, icon: Wallet,
      });
    }
    return kpis;
  }, [totalLeads, newLeadsCount, apolices, upcomingRenewals, sinistros, sinistroSummary, financeiroClients, financeiroSummary, hasScope]);

  const visibleShortcuts = allShortcuts.filter(s => s.scopes.length === 0 || s.scopes.some(sc => hasScope(sc)));
  const showRenewals = hasScope("renovacoes");
  const showLeadSummary = hasScope("leads");
  const showNewLeadsAlert = !isAdmin && hasScope("leads") && newLeadsCount > 0;
  const showSinistros = hasScope("sinistros");
  const showFinanceiro = hasScope("comissoes");

  const isLoadingData = leadsLoading || apolicesLoading || sinistrosLoading || financeiroLoading;

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
                {newLeadsCount}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-foreground">
                {newLeadsCount} lead{newLeadsCount > 1 ? "s" : ""} aguardando atendimento!
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
        {isLoadingData ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${visibleKpis.length > 3 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
            {visibleKpis.map((kpi, i) => (
              <KpiCard key={kpi.title} title={kpi.title} value={kpi.value} change={kpi.change} changeType={kpi.changeType} icon={kpi.icon} index={i} />
            ))}
          </div>
        )}

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

        {/* Lead Summary + Sinistros + Renewals */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
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
                {leadsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)
                ) : (
                  leadSummary.map((item, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                      <div className="flex items-center gap-3">
                        <item.icon className={`h-4 w-4 ${item.color}`} />
                        <span className="text-sm text-foreground">{item.label}</span>
                      </div>
                      <span className={`text-lg font-bold ${item.color}`}>{item.value}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {/* Renovações Próximas (from real apolices data) */}
          {showRenewals && (
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold">Renovações Próximas</CardTitle>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => navigate("/renovacoes")}>
                  Ver todas <ArrowRight className="h-3 w-3" />
                </Button>
              </CardHeader>
              <CardContent>
                {apolicesLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
                  </div>
                ) : upcomingRenewals.length === 0 ? (
                  <div className="text-center py-6 text-sm text-muted-foreground">
                    Nenhuma renovação nos próximos 60 dias.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingRenewals.slice(0, 5).map((r, i) => {
                      const daysLeft = r.fimDate ? Math.ceil((r.fimDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
                      const urgency = daysLeft <= 7 ? "border-destructive text-destructive" :
                                      daysLeft <= 15 ? "border-warning text-warning" :
                                      "border-info text-info";
                      return (
                        <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                          <div>
                            <p className="text-sm font-medium text-foreground">{r.cliente}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {r.veiculo.modelo} · {r.placa} · Vence {r.fim}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-foreground">{r.premio}</p>
                            <Badge variant="outline" className={`text-[10px] mt-0.5 ${urgency}`}>
                              {daysLeft <= 0 ? "Vencida" : `${daysLeft}d restantes`}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Sinistros Summary */}
          {showSinistros && (
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold">Resumo de Sinistros</CardTitle>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => navigate("/sinistros")}>
                  Ver todos <ArrowRight className="h-3 w-3" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {sinistrosLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)
                ) : (
                  sinistroSummary.map((item, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                      <div className="flex items-center gap-3">
                        <item.icon className={`h-4 w-4 ${item.color}`} />
                        <span className="text-sm text-foreground">{item.label}</span>
                      </div>
                      <span className={`text-lg font-bold ${item.color}`}>{item.value}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
