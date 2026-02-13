import { AppLayout } from "@/components/layout/AppLayout";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRole, ROLE_LABELS, ROLE_EMOJI } from "@/contexts/RoleContext";
import { useNavigate } from "react-router-dom";
import {
  Users, FileText, DollarSign, AlertTriangle, RefreshCw, TrendingUp, Target, MessageSquare, Bell, Zap,
} from "lucide-react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart,
} from "recharts";

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

const monthlyData = [
  { mes: "Jul", apolices: 280, sinistros: 12, comissoes: 38000, leads: 22, renovacoes: 35 },
  { mes: "Ago", apolices: 310, sinistros: 8, comissoes: 42000, leads: 28, renovacoes: 40 },
  { mes: "Set", apolices: 295, sinistros: 15, comissoes: 39500, leads: 19, renovacoes: 38 },
  { mes: "Out", apolices: 340, sinistros: 10, comissoes: 45000, leads: 31, renovacoes: 45 },
  { mes: "Nov", apolices: 360, sinistros: 18, comissoes: 46200, leads: 35, renovacoes: 50 },
  { mes: "Dez", apolices: 320, sinistros: 14, comissoes: 43800, leads: 25, renovacoes: 42 },
  { mes: "Jan", apolices: 380, sinistros: 9, comissoes: 48520, leads: 34, renovacoes: 55 },
];

const ramoData = [
  { name: "Auto", value: 35, color: "hsl(222, 60%, 22%)" },
  { name: "Vida", value: 25, color: "hsl(38, 92%, 50%)" },
  { name: "Residencial", value: 20, color: "hsl(142, 71%, 45%)" },
  { name: "Empresarial", value: 12, color: "hsl(210, 100%, 52%)" },
  { name: "Saúde", value: 8, color: "hsl(0, 72%, 51%)" },
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

// Chart config per role
const CHART_CONFIG: Record<string, { title: string; series: { key: string; color: string; name: string; yAxisId: string }[] }> = {
  admin: {
    title: "Evolução Mensal - Apólices & Comissões",
    series: [
      { key: "apolices", color: "hsl(222, 60%, 22%)", name: "Apólices", yAxisId: "left" },
      { key: "comissoes", color: "hsl(38, 92%, 50%)", name: "Comissões (R$)", yAxisId: "right" },
    ],
  },
  corretor_novo: {
    title: "Evolução Mensal - Leads & Apólices",
    series: [
      { key: "leads", color: "hsl(38, 92%, 50%)", name: "Leads", yAxisId: "left" },
      { key: "apolices", color: "hsl(222, 60%, 22%)", name: "Apólices", yAxisId: "right" },
    ],
  },
  corretor_renovacao: {
    title: "Evolução Mensal - Renovações & Apólices",
    series: [
      { key: "renovacoes", color: "hsl(142, 71%, 45%)", name: "Renovações", yAxisId: "left" },
      { key: "apolices", color: "hsl(222, 60%, 22%)", name: "Apólices", yAxisId: "right" },
    ],
  },
  corretor_sinistro: {
    title: "Evolução Mensal - Sinistros & Apólices",
    series: [
      { key: "sinistros", color: "hsl(0, 72%, 51%)", name: "Sinistros", yAxisId: "left" },
      { key: "apolices", color: "hsl(222, 60%, 22%)", name: "Apólices", yAxisId: "right" },
    ],
  },
  corretor_financeiro: {
    title: "Evolução Mensal - Comissões & Apólices",
    series: [
      { key: "comissoes", color: "hsl(38, 92%, 50%)", name: "Comissões (R$)", yAxisId: "left" },
      { key: "apolices", color: "hsl(222, 60%, 22%)", name: "Apólices", yAxisId: "right" },
    ],
  },
};

// Mock count of new leads for demo
const MOCK_NEW_LEADS_COUNT = 5;

const Dashboard = () => {
  const { role, hasScope, isAdmin, currentUser, brokerStatus } = useRole();
  const navigate = useNavigate();

  // Filter KPIs by scope
  const visibleKpis = allKpis.filter(k => k.scopes.some(s => hasScope(s)));

  // Filter activities by scope
  const visibleActivities = allActivities.filter(a => a.scopes.some(s => hasScope(s)));

  // Chart config
  const chartConfig = CHART_CONFIG[role] || CHART_CONFIG.admin;

  // Show renewals only if user has renovacoes scope
  const showRenewals = hasScope("renovacoes");

  // Show new leads alert for broker roles with leads scope
  const showNewLeadsAlert = !isAdmin && hasScope("leads") && MOCK_NEW_LEADS_COUNT > 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Offline Warning for Brokers */}
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

        {/* New Leads Alert for Brokers */}
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

        {/* Charts Row */}
        <div className={`grid grid-cols-1 gap-6 ${showRenewals || isAdmin ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
          {/* Evolução Mensal */}
          <Card className={showRenewals || isAdmin ? "lg:col-span-2" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">{chartConfig.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={monthlyData}>
                  <defs>
                    {chartConfig.series.map(s => (
                      <linearGradient key={s.key} id={`color-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={s.color} stopOpacity={0.15}/>
                        <stop offset="95%" stopColor={s.color} stopOpacity={0}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                  <XAxis dataKey="mes" fontSize={12} stroke="hsl(220, 10%, 46%)" />
                  <YAxis yAxisId="left" fontSize={12} stroke="hsl(220, 10%, 46%)" />
                  <YAxis yAxisId="right" orientation="right" fontSize={12} stroke="hsl(220, 10%, 46%)"
                    tickFormatter={(v) => chartConfig.series[1]?.key === "comissoes" ? `R$${(v/1000).toFixed(0)}k` : String(v)}
                  />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(220, 13%, 91%)", fontSize: "12px" }} />
                  {chartConfig.series.map(s => (
                    <Area key={s.key} yAxisId={s.yAxisId} type="monotone" dataKey={s.key} stroke={s.color} fill={`url(#color-${s.key})`} strokeWidth={2} name={s.name} />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribuição por Ramo */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Distribuição por Ramo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={ramoData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {ramoData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value}%`} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(220, 13%, 91%)", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 flex flex-wrap gap-3 justify-center">
                {ramoData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[11px] text-muted-foreground">{item.name} ({item.value}%)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className={`grid grid-cols-1 gap-6 ${showRenewals ? "lg:grid-cols-2" : ""}`}>
          {/* Atividades Recentes */}
          <Card>
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

          {/* Renovações Próximas - only for roles with renovacoes scope */}
          {showRenewals && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Renovações Próximas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {renewals.map((r, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                      <div>
                        <p className="text-sm font-medium text-foreground">{r.cliente}</p>
                        <p className="text-[11px] text-muted-foreground">{r.apolice} · Vence em {r.vencimento}</p>
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
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
