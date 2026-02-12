import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, TrendingUp, Users, Building2, Calendar } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";

// ── Mock data ──

type Periodo = "dia" | "semana" | "mes";

const corretoresNovo = ["André Oliveira", "Lucas Martins", "Patrícia Gomes"];
const corretoresRenovacao = ["Beatriz Costa", "Marcos Vieira", "Juliana Reis"];
const seguradoras = ["Porto Seguro", "Allianz", "SulAmérica", "Bradesco", "Tokio Marine", "HDI", "MetLife"];

const COLORS = [
  "hsl(222, 60%, 22%)", "hsl(38, 92%, 50%)", "hsl(142, 71%, 45%)",
  "hsl(210, 100%, 52%)", "hsl(280, 60%, 50%)", "hsl(0, 72%, 51%)", "hsl(220, 10%, 60%)",
];

function generateCorretorData(nomes: string[], periodo: Periodo) {
  const labels = periodo === "dia"
    ? ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
    : periodo === "semana"
    ? ["Sem 1", "Sem 2", "Sem 3", "Sem 4"]
    : ["Ago", "Set", "Out", "Nov", "Dez", "Jan", "Fev"];

  return labels.map(label => {
    const row: Record<string, string | number> = { label };
    nomes.forEach(n => {
      row[n] = Math.floor(Math.random() * 30) + 5;
    });
    return row;
  });
}

function generateCorretorTotals(nomes: string[]) {
  return nomes.map(nome => ({
    nome,
    apolices: Math.floor(Math.random() * 60) + 20,
    premio: Math.floor(Math.random() * 200000) + 50000,
    conversao: Math.floor(Math.random() * 40) + 30,
  }));
}

function generateSeguradoraData(periodo: Periodo) {
  const labels = periodo === "dia"
    ? ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
    : periodo === "semana"
    ? ["Sem 1", "Sem 2", "Sem 3", "Sem 4"]
    : ["Ago", "Set", "Out", "Nov", "Dez", "Jan", "Fev"];

  return labels.map(label => {
    const row: Record<string, string | number> = { label };
    seguradoras.forEach(s => {
      row[s] = Math.floor(Math.random() * 25) + 3;
    });
    return row;
  });
}

function generateSeguradoraPie() {
  return seguradoras.map((name, i) => ({
    name,
    value: Math.floor(Math.random() * 30) + 5,
    color: COLORS[i % COLORS.length],
  }));
}

// ── Period selector ──

function PeriodSelector({ value, onChange }: { value: Periodo; onChange: (v: Periodo) => void }) {
  return (
    <Select value={value} onValueChange={v => onChange(v as Periodo)}>
      <SelectTrigger className="w-[130px] h-8 text-xs">
        <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="dia">Por Dia</SelectItem>
        <SelectItem value="semana">Por Semana</SelectItem>
        <SelectItem value="mes">Por Mês</SelectItem>
      </SelectContent>
    </Select>
  );
}

// ── Corretor table ──

function CorretorRankingTable({ data }: { data: ReturnType<typeof generateCorretorTotals> }) {
  const sorted = [...data].sort((a, b) => b.apolices - a.apolices);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground text-xs">#</th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground text-xs">Corretor</th>
            <th className="px-4 py-2.5 text-center font-medium text-muted-foreground text-xs">Apólices</th>
            <th className="px-4 py-2.5 text-right font-medium text-muted-foreground text-xs">Prêmio Total</th>
            <th className="px-4 py-2.5 text-center font-medium text-muted-foreground text-xs">Conversão</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((c, i) => (
            <tr key={c.nome} className="border-b border-border hover:bg-muted/30 transition-colors">
              <td className="px-4 py-2.5">
                <Badge variant={i === 0 ? "default" : "secondary"} className="text-[10px] w-6 justify-center">
                  {i + 1}º
                </Badge>
              </td>
              <td className="px-4 py-2.5 font-medium">{c.nome}</td>
              <td className="px-4 py-2.5 text-center font-semibold">{c.apolices}</td>
              <td className="px-4 py-2.5 text-right font-semibold">
                {c.premio.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </td>
              <td className="px-4 py-2.5 text-center">
                <Badge variant="outline" className={`text-[10px] ${c.conversao >= 50 ? "border-success text-success" : c.conversao >= 35 ? "border-warning text-warning" : "border-destructive text-destructive"}`}>
                  {c.conversao}%
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main ──

const Relatorios = () => {
  const [periodo, setPeriodo] = useState<Periodo>("mes");
  const [activeTab, setActiveTab] = useState("novo");

  const dataNovo = useMemo(() => generateCorretorData(corretoresNovo, periodo), [periodo]);
  const dataRenov = useMemo(() => generateCorretorData(corretoresRenovacao, periodo), [periodo]);
  const dataSeg = useMemo(() => generateSeguradoraData(periodo), [periodo]);
  const dataPie = useMemo(() => generateSeguradoraPie(), []);
  const totaisNovo = useMemo(() => generateCorretorTotals(corretoresNovo), []);
  const totaisRenov = useMemo(() => generateCorretorTotals(corretoresRenovacao), []);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Relatórios</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Análise detalhada da produção e desempenho</p>
          </div>
          <div className="flex items-center gap-2">
            <PeriodSelector value={periodo} onChange={setPeriodo} />
            <Button variant="outline" size="sm" className="gap-2 h-8 text-xs">
              <Download className="h-3.5 w-3.5" /> Exportar
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="novo" className="gap-1.5 text-xs">
              <TrendingUp className="h-3.5 w-3.5" /> Seguro Novo
            </TabsTrigger>
            <TabsTrigger value="renovacao" className="gap-1.5 text-xs">
              <Users className="h-3.5 w-3.5" /> Renovação
            </TabsTrigger>
            <TabsTrigger value="seguradora" className="gap-1.5 text-xs">
              <Building2 className="h-3.5 w-3.5" /> Seguradora
            </TabsTrigger>
          </TabsList>

          {/* ── Corretor Seguro Novo ── */}
          <TabsContent value="novo" className="space-y-6 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Produção por Corretor — Seguro Novo</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dataNovo}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                      <XAxis dataKey="label" fontSize={11} stroke="hsl(220, 10%, 46%)" />
                      <YAxis fontSize={11} stroke="hsl(220, 10%, 46%)" />
                      <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                      <Legend wrapperStyle={{ fontSize: "11px" }} />
                      {corretoresNovo.map((nome, i) => (
                        <Bar key={nome} dataKey={nome} fill={COLORS[i]} radius={[3, 3, 0, 0]} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Ranking — Seguro Novo</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <CorretorRankingTable data={totaisNovo} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Corretor Renovação ── */}
          <TabsContent value="renovacao" className="space-y-6 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Produção por Corretor — Renovação</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dataRenov}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                      <XAxis dataKey="label" fontSize={11} stroke="hsl(220, 10%, 46%)" />
                      <YAxis fontSize={11} stroke="hsl(220, 10%, 46%)" />
                      <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                      <Legend wrapperStyle={{ fontSize: "11px" }} />
                      {corretoresRenovacao.map((nome, i) => (
                        <Bar key={nome} dataKey={nome} fill={COLORS[i + 3]} radius={[3, 3, 0, 0]} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Ranking — Renovação</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <CorretorRankingTable data={totaisRenov} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Por Seguradora ── */}
          <TabsContent value="seguradora" className="space-y-6 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Apólices por Seguradora</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dataSeg}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                      <XAxis dataKey="label" fontSize={11} stroke="hsl(220, 10%, 46%)" />
                      <YAxis fontSize={11} stroke="hsl(220, 10%, 46%)" />
                      <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                      <Legend wrapperStyle={{ fontSize: "11px" }} />
                      {seguradoras.map((s, i) => (
                        <Line key={s} type="monotone" dataKey={s} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Distribuição por Seguradora</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={dataPie}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                        fontSize={10}
                      >
                        {dataPie.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Relatorios;
