import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, MoreHorizontal } from "lucide-react";

const sinistrosData = [
  { id: "#892", apolice: "#4521", cliente: "João Silva", tipo: "Colisão", dataAbertura: "10/02/2026", valor: "R$ 15.000", status: "Em Análise", prioridade: "Alta" },
  { id: "#891", apolice: "#4518", cliente: "Carlos Mendes", tipo: "Furto", dataAbertura: "08/02/2026", valor: "R$ 42.000", status: "Em Análise", prioridade: "Alta" },
  { id: "#890", apolice: "#4517", cliente: "Fernanda Costa", tipo: "Danos Elétricos", dataAbertura: "05/02/2026", valor: "R$ 3.200", status: "Aprovado", prioridade: "Média" },
  { id: "#889", apolice: "#4520", cliente: "Empresa ABC Ltda", tipo: "Incêndio", dataAbertura: "01/02/2026", valor: "R$ 120.000", status: "Em Vistoria", prioridade: "Crítica" },
  { id: "#888", apolice: "#4516", cliente: "Roberto Lima", tipo: "Invalidez", dataAbertura: "28/01/2026", valor: "R$ 80.000", status: "Documentação", prioridade: "Alta" },
  { id: "#887", apolice: "#4519", cliente: "Maria Santos", tipo: "Hospitalização", dataAbertura: "20/01/2026", valor: "R$ 8.500", status: "Pago", prioridade: "Média" },
  { id: "#886", apolice: "#4514", cliente: "Indústria XYZ S/A", tipo: "RC Geral", dataAbertura: "15/01/2026", valor: "R$ 250.000", status: "Em Análise", prioridade: "Crítica" },
];

const Sinistros = () => {
  const [search, setSearch] = useState("");
  const filtered = sinistrosData.filter(s => s.cliente.toLowerCase().includes(search.toLowerCase()) || s.id.includes(search));

  const statusColor = (s: string) => {
    switch (s) {
      case "Pago": return "border-success text-success";
      case "Aprovado": return "border-info text-info";
      case "Em Análise": return "border-warning text-warning";
      case "Em Vistoria": return "border-accent text-accent";
      case "Documentação": return "border-muted-foreground text-muted-foreground";
      default: return "";
    }
  };

  const prioridadeColor = (p: string) => {
    switch (p) {
      case "Crítica": return "bg-destructive text-destructive-foreground";
      case "Alta": return "bg-warning text-warning-foreground";
      case "Média": return "bg-info text-info-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Sinistros</h2>
            <p className="text-sm text-muted-foreground">{sinistrosData.length} sinistros registrados</p>
          </div>
          <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="h-4 w-4" />
            Novo Sinistro
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar sinistros..." className="pl-9 h-9 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Button variant="outline" size="sm" className="gap-2"><Filter className="h-3.5 w-3.5" /> Filtros</Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nº</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Apólice</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cliente</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tipo</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Data</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Valor Estimado</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Prioridade</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => (
                    <tr key={s.id} className="border-b border-border hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">{s.id}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.apolice}</td>
                      <td className="px-4 py-3 font-medium">{s.cliente}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.tipo}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{s.dataAbertura}</td>
                      <td className="px-4 py-3 text-right font-semibold">{s.valor}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={`text-[10px] ${prioridadeColor(s.prioridade)}`}>{s.prioridade}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="outline" className={`text-[10px] ${statusColor(s.status)}`}>{s.status}</Badge>
                      </td>
                      <td className="px-4 py-3"><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></Button></td>
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

export default Sinistros;
