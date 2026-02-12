import { AppLayout } from "@/components/layout/AppLayout";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FileText,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";

const kpis = [
  { title: "Clientes Ativos", value: "1.247", change: "+12% este mês", changeType: "positive" as const, icon: Users },
  { title: "Apólices Vigentes", value: "3.892", change: "+8% este mês", changeType: "positive" as const, icon: FileText },
  { title: "Comissões (Mês)", value: "R$ 48.520", change: "+15% vs mês anterior", changeType: "positive" as const, icon: DollarSign },
  { title: "Sinistros Abertos", value: "23", change: "-5% este mês", changeType: "negative" as const, icon: AlertTriangle },
  { title: "Renovações Pendentes", value: "67", change: "Próximos 30 dias", changeType: "neutral" as const, icon: RefreshCw },
  { title: "Prêmio Total", value: "R$ 2.1M", change: "+18% YoY", changeType: "positive" as const, icon: TrendingUp },
];

const monthlyData = [
  { mes: "Jul", apolices: 280, sinistros: 12, comissoes: 38000 },
  { mes: "Ago", apolices: 310, sinistros: 8, comissoes: 42000 },
  { mes: "Set", apolices: 295, sinistros: 15, comissoes: 39500 },
  { mes: "Out", apolices: 340, sinistros: 10, comissoes: 45000 },
  { mes: "Nov", apolices: 360, sinistros: 18, comissoes: 46200 },
  { mes: "Dez", apolices: 320, sinistros: 14, comissoes: 43800 },
  { mes: "Jan", apolices: 380, sinistros: 9, comissoes: 48520 },
];

const ramoData = [
  { name: "Auto", value: 35, color: "hsl(222, 60%, 22%)" },
  { name: "Vida", value: 25, color: "hsl(38, 92%, 50%)" },
  { name: "Residencial", value: 20, color: "hsl(142, 71%, 45%)" },
  { name: "Empresarial", value: 12, color: "hsl(210, 100%, 52%)" },
  { name: "Saúde", value: 8, color: "hsl(0, 72%, 51%)" },
];

const recentActivities = [
  { type: "nova_apolice", desc: "Apólice Auto #4521 emitida para João Silva", time: "Há 15 min", status: "success" },
  { type: "sinistro", desc: "Sinistro #892 aberto - Colisão veicular", time: "Há 45 min", status: "warning" },
  { type: "renovacao", desc: "Renovação #3201 aprovada - Maria Santos", time: "Há 1h", status: "info" },
  { type: "comissao", desc: "Comissão R$ 1.250 creditada - Ref. Apólice #4498", time: "Há 2h", status: "success" },
  { type: "cliente", desc: "Novo cliente cadastrado - Empresa ABC Ltda", time: "Há 3h", status: "info" },
  { type: "sinistro", desc: "Sinistro #887 encerrado - Indenização paga", time: "Há 4h", status: "success" },
];

const renewals = [
  { cliente: "Carlos Mendes", apolice: "Auto #3201", vencimento: "15/02/2026", premio: "R$ 3.200" },
  { cliente: "Ana Souza", apolice: "Vida #1890", vencimento: "18/02/2026", premio: "R$ 1.800" },
  { cliente: "Empresa XYZ", apolice: "Emp. #567", vencimento: "20/02/2026", premio: "R$ 12.500" },
  { cliente: "Roberto Lima", apolice: "Res. #2340", vencimento: "22/02/2026", premio: "R$ 2.100" },
  { cliente: "Fernanda Costa", apolice: "Auto #3567", vencimento: "25/02/2026", premio: "R$ 4.500" },
];

const Dashboard = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Visão geral da sua corretora de seguros</p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {kpis.map((kpi, i) => (
            <KpiCard key={kpi.title} {...kpi} index={i} />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Evolução Mensal */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Evolução Mensal - Apólices & Comissões</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorApolices" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(222, 60%, 22%)" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="hsl(222, 60%, 22%)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorComissoes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                  <XAxis dataKey="mes" fontSize={12} stroke="hsl(220, 10%, 46%)" />
                  <YAxis yAxisId="left" fontSize={12} stroke="hsl(220, 10%, 46%)" />
                  <YAxis yAxisId="right" orientation="right" fontSize={12} stroke="hsl(220, 10%, 46%)" tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "1px solid hsl(220, 13%, 91%)", fontSize: "12px" }}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="apolices" stroke="hsl(222, 60%, 22%)" fill="url(#colorApolices)" strokeWidth={2} name="Apólices" />
                  <Area yAxisId="right" type="monotone" dataKey="comissoes" stroke="hsl(38, 92%, 50%)" fill="url(#colorComissoes)" strokeWidth={2} name="Comissões (R$)" />
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
                  <Pie
                    data={ramoData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Atividades Recentes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivities.map((activity, i) => (
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

          {/* Renovações Próximas */}
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
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
