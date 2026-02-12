import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const comissoesData = [
  { mes: "Ago", valor: 42000 },
  { mes: "Set", valor: 39500 },
  { mes: "Out", valor: 45000 },
  { mes: "Nov", valor: 46200 },
  { mes: "Dez", valor: 43800 },
  { mes: "Jan", valor: 48520 },
];

const comissoesList = [
  { id: 1, apolice: "#4521", cliente: "João Silva", seguradora: "Porto Seguro", ramo: "Auto", premio: "R$ 3.200", percentual: "15%", valor: "R$ 480", status: "Pago", data: "20/01/2026" },
  { id: 2, apolice: "#4520", cliente: "Empresa ABC Ltda", seguradora: "Allianz", ramo: "Empresarial", premio: "R$ 25.000", percentual: "15%", valor: "R$ 3.750", status: "Pago", data: "18/01/2026" },
  { id: 3, apolice: "#4519", cliente: "Maria Santos", seguradora: "SulAmérica", ramo: "Vida", premio: "R$ 1.800", percentual: "30%", valor: "R$ 540", status: "Pendente", data: "15/01/2026" },
  { id: 4, apolice: "#4518", cliente: "Carlos Mendes", seguradora: "Bradesco", ramo: "Auto", premio: "R$ 4.100", percentual: "15%", valor: "R$ 615", status: "Pago", data: "12/01/2026" },
  { id: 5, apolice: "#4514", cliente: "Indústria XYZ S/A", seguradora: "Zurich", ramo: "Empresarial", premio: "R$ 85.000", percentual: "15%", valor: "R$ 12.750", status: "Pendente", data: "10/01/2026" },
  { id: 6, apolice: "#4517", cliente: "Fernanda Costa", seguradora: "Tokio Marine", ramo: "Residencial", premio: "R$ 2.500", percentual: "20%", valor: "R$ 500", status: "Pago", data: "08/01/2026" },
];

const Comissoes = () => {
  const totalPago = "R$ 5.825";
  const totalPendente = "R$ 16.540";

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Comissões</h2>
            <p className="text-sm text-muted-foreground">Acompanhamento de comissões recebidas e pendentes</p>
          </div>
          <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Exportar</Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="kpi-card-shadow">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Mês</p>
                  <p className="mt-1 text-2xl font-bold">R$ 48.520</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="kpi-card-shadow">
            <CardContent className="pt-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pagas</p>
              <p className="mt-1 text-2xl font-bold text-success">{totalPago}</p>
            </CardContent>
          </Card>
          <Card className="kpi-card-shadow">
            <CardContent className="pt-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pendentes</p>
              <p className="mt-1 text-2xl font-bold text-warning">{totalPendente}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Evolução de Comissões (6 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={comissoesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                <XAxis dataKey="mes" fontSize={12} stroke="hsl(220, 10%, 46%)" />
                <YAxis fontSize={12} stroke="hsl(220, 10%, 46%)" tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} formatter={(v: number) => [`R$ ${v.toLocaleString()}`, "Comissão"]} />
                <Bar dataKey="valor" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Detalhamento</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Apólice</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cliente</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Seguradora</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ramo</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Prêmio</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">%</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Comissão</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {comissoesList.map((c, i) => (
                    <tr key={c.id} className="border-b border-border hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">{c.apolice}</td>
                      <td className="px-4 py-3 font-medium">{c.cliente}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.seguradora}</td>
                      <td className="px-4 py-3"><Badge variant="secondary" className="text-[10px]">{c.ramo}</Badge></td>
                      <td className="px-4 py-3 text-right">{c.premio}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{c.percentual}</td>
                      <td className="px-4 py-3 text-right font-semibold text-success">{c.valor}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="outline" className={`text-[10px] ${c.status === "Pago" ? "border-success text-success" : "border-warning text-warning"}`}>{c.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{c.data}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Comissoes;
