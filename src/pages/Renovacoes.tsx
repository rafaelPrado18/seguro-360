import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Mail, Phone, RefreshCw } from "lucide-react";
import { useState } from "react";

const renovacoesData = [
  { id: 1, apolice: "#3201", cliente: "Carlos Mendes", ramo: "Auto", seguradora: "Porto Seguro", vencimento: "15/02/2026", premio: "R$ 3.200", dias: 3, status: "Urgente" },
  { id: 2, apolice: "#1890", cliente: "Ana Souza", ramo: "Vida", seguradora: "SulAmérica", vencimento: "18/02/2026", premio: "R$ 1.800", dias: 6, status: "Pendente" },
  { id: 3, apolice: "#567", cliente: "Empresa XYZ", ramo: "Empresarial", seguradora: "Allianz", vencimento: "20/02/2026", premio: "R$ 12.500", dias: 8, status: "Pendente" },
  { id: 4, apolice: "#2340", cliente: "Roberto Lima", ramo: "Residencial", seguradora: "Tokio Marine", vencimento: "22/02/2026", premio: "R$ 2.100", dias: 10, status: "Pendente" },
  { id: 5, apolice: "#3567", cliente: "Fernanda Costa", ramo: "Auto", seguradora: "HDI", vencimento: "25/02/2026", premio: "R$ 4.500", dias: 13, status: "Em Contato" },
  { id: 6, apolice: "#4100", cliente: "João Silva", ramo: "Vida", seguradora: "MetLife", vencimento: "01/03/2026", premio: "R$ 2.800", dias: 17, status: "Pendente" },
  { id: 7, apolice: "#2890", cliente: "Maria Santos", ramo: "Auto", seguradora: "Bradesco", vencimento: "05/03/2026", premio: "R$ 3.600", dias: 21, status: "Renovado" },
];

const Renovacoes = () => {
  const [search, setSearch] = useState("");
  const [renovacoes, setRenovacoes] = useState(renovacoesData);
  const filtered = renovacoes.filter(r => r.cliente.toLowerCase().includes(search.toLowerCase()) || r.apolice.includes(search));

  const statusColor = (s: string) => {
    switch (s) {
      case "Urgente": return "bg-destructive text-destructive-foreground";
      case "Pendente": return "border-warning text-warning";
      case "Em Contato": return "border-info text-info";
      case "Renovado": return "border-success text-success";
      default: return "";
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Renovações</h2>
            <p className="text-sm text-muted-foreground">{renovacoesData.length} renovações próximas</p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar renovações..." className="pl-9 h-9 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Button variant="outline" size="sm" className="gap-2"><Filter className="h-3.5 w-3.5" /> Filtros</Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Apólice</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cliente</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ramo</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Seguradora</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Vencimento</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Dias</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Prêmio</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr key={r.id} className="border-b border-border hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">{r.apolice}</td>
                      <td className="px-4 py-3 font-medium">{r.cliente}</td>
                      <td className="px-4 py-3"><Badge variant="secondary" className="text-[10px]">{r.ramo}</Badge></td>
                      <td className="px-4 py-3 text-muted-foreground">{r.seguradora}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{r.vencimento}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-bold ${r.dias <= 5 ? "text-destructive" : r.dias <= 15 ? "text-warning" : "text-muted-foreground"}`}>{r.dias}d</span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">{r.premio}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={r.status === "Urgente" ? "default" : "outline"} className={`text-[10px] ${statusColor(r.status)}`}>{r.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Enviar email"><Mail className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Ligar"><Phone className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Renovar" onClick={() => {
                            setRenovacoes(prev => prev.map(item => item.id === r.id ? { ...item, status: "Renovado" } : item));
                            toast.success(`Apólice ${r.apolice} de ${r.cliente} renovada com sucesso!`);
                          }}><RefreshCw className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                        </div>
                      </td>
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

export default Renovacoes;
