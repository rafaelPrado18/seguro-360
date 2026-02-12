import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const producaoMensal = [
  { mes: "Jul", auto: 120, vida: 80, residencial: 45, empresarial: 35 },
  { mes: "Ago", auto: 135, vida: 85, residencial: 50, empresarial: 40 },
  { mes: "Set", auto: 125, vida: 90, residencial: 42, empresarial: 38 },
  { mes: "Out", auto: 150, vida: 95, residencial: 55, empresarial: 40 },
  { mes: "Nov", auto: 160, vida: 88, residencial: 60, empresarial: 52 },
  { mes: "Dez", auto: 140, vida: 82, residencial: 48, empresarial: 50 },
  { mes: "Jan", auto: 170, vida: 100, residencial: 58, empresarial: 52 },
];

const sinistralidade = [
  { mes: "Jul", taxa: 42 }, { mes: "Ago", taxa: 38 }, { mes: "Set", taxa: 45 },
  { mes: "Out", taxa: 40 }, { mes: "Nov", taxa: 48 }, { mes: "Dez", taxa: 43 }, { mes: "Jan", taxa: 35 },
];

const seguradoraData = [
  { name: "Porto Seguro", value: 30, color: "hsl(222, 60%, 22%)" },
  { name: "Allianz", value: 20, color: "hsl(38, 92%, 50%)" },
  { name: "SulAmérica", value: 18, color: "hsl(142, 71%, 45%)" },
  { name: "Bradesco", value: 15, color: "hsl(210, 100%, 52%)" },
  { name: "Tokio Marine", value: 10, color: "hsl(280, 60%, 50%)" },
  { name: "Outros", value: 7, color: "hsl(220, 10%, 70%)" },
];

const Relatorios = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Relatórios</h2>
            <p className="text-sm text-muted-foreground">Análise detalhada da produção e desempenho</p>
          </div>
          <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Exportar PDF</Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Produção por Ramo</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={producaoMensal}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                  <XAxis dataKey="mes" fontSize={12} stroke="hsl(220, 10%, 46%)" />
                  <YAxis fontSize={12} stroke="hsl(220, 10%, 46%)" />
                  <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                  <Bar dataKey="auto" fill="hsl(222, 60%, 22%)" stackId="a" name="Auto" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="vida" fill="hsl(38, 92%, 50%)" stackId="a" name="Vida" />
                  <Bar dataKey="residencial" fill="hsl(142, 71%, 45%)" stackId="a" name="Residencial" />
                  <Bar dataKey="empresarial" fill="hsl(210, 100%, 52%)" stackId="a" name="Empresarial" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Distribuição por Seguradora</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={seguradoraData} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                    {seguradoraData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Índice de Sinistralidade (%)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={sinistralidade}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                  <XAxis dataKey="mes" fontSize={12} stroke="hsl(220, 10%, 46%)" />
                  <YAxis fontSize={12} stroke="hsl(220, 10%, 46%)" domain={[30, 55]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} formatter={(v: number) => [`${v}%`, "Sinistralidade"]} />
                  <Line type="monotone" dataKey="taxa" stroke="hsl(0, 72%, 51%)" strokeWidth={2} dot={{ fill: "hsl(0, 72%, 51%)", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Relatorios;
