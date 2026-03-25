import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign, TrendingUp, TrendingDown, AlertCircle, Download,
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, XCircle,
  Wallet, Receipt, Users, BarChart3,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts";

// ── Mock Data ──────────────────────────────────────────────

const fluxoCaixaData = [
  { mes: "Set", entradas: 82000, saidas: 45000 },
  { mes: "Out", entradas: 95000, saidas: 52000 },
  { mes: "Nov", entradas: 88000, saidas: 48000 },
  { mes: "Dez", entradas: 102000, saidas: 61000 },
  { mes: "Jan", entradas: 97000, saidas: 54000 },
  { mes: "Fev", entradas: 110000, saidas: 58000 },
  { mes: "Mar", entradas: 105000, saidas: 55000 },
];

const pendenciasClientes = [
  { id: 1, cliente: "João Silva", apolice: "#4521", valor: "R$ 1.200", vencimento: "10/03/2026", diasAtraso: 15, status: "atrasado" },
  { id: 2, cliente: "Empresa ABC Ltda", apolice: "#4520", valor: "R$ 8.500", vencimento: "25/03/2026", diasAtraso: 0, status: "a_vencer" },
  { id: 3, cliente: "Maria Santos", apolice: "#4519", valor: "R$ 950", vencimento: "01/03/2026", diasAtraso: 24, status: "atrasado" },
  { id: 4, cliente: "Carlos Mendes", apolice: "#4518", valor: "R$ 2.300", vencimento: "28/03/2026", diasAtraso: 0, status: "a_vencer" },
  { id: 5, cliente: "Fernanda Costa", apolice: "#4517", valor: "R$ 680", vencimento: "15/02/2026", diasAtraso: 38, status: "atrasado" },
  { id: 6, cliente: "Indústria XYZ S/A", apolice: "#4514", valor: "R$ 15.000", vencimento: "05/04/2026", diasAtraso: 0, status: "a_vencer" },
];

const comissoesList = [
  { id: 1, seguradora: "Porto Seguro", ramo: "Auto", valor: "R$ 4.800", status: "pago", data: "20/03/2026" },
  { id: 2, seguradora: "Allianz", ramo: "Empresarial", valor: "R$ 12.750", status: "pendente", data: "15/03/2026" },
  { id: 3, seguradora: "SulAmérica", ramo: "Vida", valor: "R$ 3.200", status: "pago", data: "12/03/2026" },
  { id: 4, seguradora: "Bradesco", ramo: "Auto", valor: "R$ 2.100", status: "pendente", data: "10/03/2026" },
  { id: 5, seguradora: "Zurich", ramo: "Empresarial", valor: "R$ 8.900", status: "atrasado", data: "01/03/2026" },
  { id: 6, seguradora: "Tokio Marine", ramo: "Residencial", valor: "R$ 1.500", status: "pago", data: "08/03/2026" },
];

const contasPagar = [
  { id: 1, descricao: "Aluguel escritório", categoria: "Fixo", valor: "R$ 4.500", vencimento: "05/04/2026", status: "a_vencer" },
  { id: 2, descricao: "Software gestão", categoria: "Fixo", valor: "R$ 890", vencimento: "10/04/2026", status: "a_vencer" },
  { id: 3, descricao: "Telefonia / Internet", categoria: "Fixo", valor: "R$ 650", vencimento: "15/04/2026", status: "a_vencer" },
  { id: 4, descricao: "Energia elétrica", categoria: "Variável", valor: "R$ 420", vencimento: "20/03/2026", status: "pago" },
  { id: 5, descricao: "Contador", categoria: "Fixo", valor: "R$ 2.200", vencimento: "01/04/2026", status: "a_vencer" },
  { id: 6, descricao: "Material de escritório", categoria: "Variável", valor: "R$ 380", vencimento: "18/03/2026", status: "pago" },
];

// ── Helpers ─────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; classes: string }> = {
    pago: { label: "Pago", classes: "border-success text-success" },
    pendente: { label: "Pendente", classes: "border-warning text-warning" },
    atrasado: { label: "Atrasado", classes: "border-destructive text-destructive" },
    a_vencer: { label: "A vencer", classes: "border-info text-info" },
  };
  const s = map[status] ?? map.pendente;
  return <Badge variant="outline" className={`text-[10px] ${s.classes}`}>{s.label}</Badge>;
}

// ── Page ────────────────────────────────────────────────────

const Financeiro = () => {
  const [tab, setTab] = useState("visao-geral");

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Financeiro</h2>
            <p className="text-sm text-muted-foreground">Fluxo de caixa, pendências e comissões</p>
          </div>
          <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Exportar</Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="kpi-card-shadow">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Saldo Mês</p>
                  <p className="mt-1 text-2xl font-bold text-success">R$ 50.000</p>
                  <p className="mt-0.5 text-xs text-success flex items-center gap-1"><ArrowUpRight className="h-3 w-3" />+8,2% vs mês anterior</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="kpi-card-shadow">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">A Receber</p>
                  <p className="mt-1 text-2xl font-bold text-warning">R$ 28.630</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">6 pendências</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="kpi-card-shadow">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Comissões Pendentes</p>
                  <p className="mt-1 text-2xl font-bold text-accent">R$ 23.750</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">3 seguradoras</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="kpi-card-shadow">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contas a Pagar</p>
                  <p className="mt-1 text-2xl font-bold text-destructive">R$ 8.240</p>
                  <p className="mt-0.5 text-xs text-destructive flex items-center gap-1"><ArrowDownRight className="h-3 w-3" />5 itens pendentes</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="visao-geral" className="gap-1.5 text-xs"><BarChart3 className="h-3.5 w-3.5" />Visão Geral</TabsTrigger>
            <TabsTrigger value="pendencias" className="gap-1.5 text-xs"><Users className="h-3.5 w-3.5" />Pendências</TabsTrigger>
            <TabsTrigger value="comissoes" className="gap-1.5 text-xs"><DollarSign className="h-3.5 w-3.5" />Comissões</TabsTrigger>
            <TabsTrigger value="contas" className="gap-1.5 text-xs"><Receipt className="h-3.5 w-3.5" />Contas a Pagar</TabsTrigger>
          </TabsList>

          {/* ── Visão Geral ──────────────────────── */}
          <TabsContent value="visao-geral" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Fluxo de Caixa (7 meses)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={fluxoCaixaData}>
                    <defs>
                      <linearGradient id="gradEntradas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradSaidas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                    <XAxis dataKey="mes" fontSize={12} stroke="hsl(220, 10%, 46%)" />
                    <YAxis fontSize={12} stroke="hsl(220, 10%, 46%)" tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} formatter={(v: number) => [`R$ ${v.toLocaleString()}`, ""]} />
                    <Area type="monotone" dataKey="entradas" stroke="hsl(142, 71%, 45%)" fill="url(#gradEntradas)" name="Entradas" strokeWidth={2} />
                    <Area type="monotone" dataKey="saidas" stroke="hsl(0, 84%, 60%)" fill="url(#gradSaidas)" name="Saídas" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Resumo Pendências */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">Pendências Recentes</CardTitle>
                    <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setTab("pendencias")}>Ver todas</Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pendenciasClientes.slice(0, 4).map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${p.status === "atrasado" ? "bg-destructive" : "bg-warning"}`} />
                        <div>
                          <p className="text-sm font-medium">{p.cliente}</p>
                          <p className="text-xs text-muted-foreground">Apólice {p.apolice} · Venc. {p.vencimento}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{p.valor}</p>
                        <StatusBadge status={p.status} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Resumo Comissões */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">Comissões Recentes</CardTitle>
                    <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setTab("comissoes")}>Ver todas</Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {comissoesList.slice(0, 4).map((c) => (
                    <div key={c.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${c.status === "pago" ? "bg-success" : c.status === "atrasado" ? "bg-destructive" : "bg-warning"}`} />
                        <div>
                          <p className="text-sm font-medium">{c.seguradora}</p>
                          <p className="text-xs text-muted-foreground">{c.ramo} · {c.data}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{c.valor}</p>
                        <StatusBadge status={c.status} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Pendências de Clientes ──────────── */}
          <TabsContent value="pendencias" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-warning" />Pendências de Clientes
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">{pendenciasClientes.length} registros</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cliente</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Apólice</th>
                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Valor</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Vencimento</th>
                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">Dias Atraso</th>
                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendenciasClientes.map((p, i) => (
                        <tr key={p.id} className="border-b border-border hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                          <td className="px-4 py-3 font-medium">{p.cliente}</td>
                          <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">{p.apolice}</td>
                          <td className="px-4 py-3 text-right font-semibold">{p.valor}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{p.vencimento}</td>
                          <td className="px-4 py-3 text-center">
                            {p.diasAtraso > 0 ? (
                              <span className="text-xs font-semibold text-destructive">{p.diasAtraso} dias</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center"><StatusBadge status={p.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Comissões ────────────────────────── */}
          <TabsContent value="comissoes" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-accent" />Comissões por Seguradora
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">{comissoesList.length} registros</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Seguradora</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ramo</th>
                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Valor</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Data</th>
                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comissoesList.map((c, i) => (
                        <tr key={c.id} className="border-b border-border hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                          <td className="px-4 py-3 font-medium">{c.seguradora}</td>
                          <td className="px-4 py-3"><Badge variant="secondary" className="text-[10px]">{c.ramo}</Badge></td>
                          <td className="px-4 py-3 text-right font-semibold">{c.valor}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{c.data}</td>
                          <td className="px-4 py-3 text-center"><StatusBadge status={c.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Contas a Pagar ────────────────────── */}
          <TabsContent value="contas" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-destructive" />Contas a Pagar
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">{contasPagar.length} registros</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Descrição</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Categoria</th>
                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Valor</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Vencimento</th>
                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contasPagar.map((c, i) => (
                        <tr key={c.id} className="border-b border-border hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                          <td className="px-4 py-3 font-medium">{c.descricao}</td>
                          <td className="px-4 py-3"><Badge variant="secondary" className="text-[10px]">{c.categoria}</Badge></td>
                          <td className="px-4 py-3 text-right font-semibold">{c.valor}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{c.vencimento}</td>
                          <td className="px-4 py-3 text-center"><StatusBadge status={c.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Financeiro;
