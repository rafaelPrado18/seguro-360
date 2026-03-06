import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Mail, Phone, RefreshCw, LayoutGrid, List } from "lucide-react";
import { useState } from "react";
import { RenovacaoDetailDialog, type RenovacaoData } from "@/components/renovacoes/RenovacaoDetailDialog";
import { RenovacaoKanban, type RenovacaoKanbanColumn } from "@/components/renovacoes/RenovacaoKanban";
import { useRenovacaoStatuses } from "@/hooks/useRenovacaoStatus";

const renovacoesData: RenovacaoData[] = [
  { id: 1, apolice: "#3201", cliente: "Carlos Mendes", ramo: "Auto", seguradora: "Porto Seguro", vencimento: "15/02/2026", premio: "R$ 3.200", dias: 3, status: "Urgente", observacoes: "", veiculos: [
    { id: "v1", marca: "Toyota", modelo: "Corolla", ano: "2023", placa: "ABC-1D23", chassi: "9BRBL3HE8D0123456" },
  ]},
  { id: 2, apolice: "#1890", cliente: "Ana Souza", ramo: "Vida", seguradora: "SulAmérica", vencimento: "18/02/2026", premio: "R$ 1.800", dias: 6, status: "Pendente", observacoes: "", veiculos: [] },
  { id: 3, apolice: "#567", cliente: "Empresa XYZ", ramo: "Empresarial", seguradora: "Allianz", vencimento: "20/02/2026", premio: "R$ 12.500", dias: 8, status: "Pendente", observacoes: "", veiculos: [
    { id: "v2", marca: "Fiat", modelo: "Strada", ano: "2024", placa: "DEF-5G67", chassi: "9BGRD08X04G234567" },
    { id: "v3", marca: "Volkswagen", modelo: "Amarok", ano: "2023", placa: "GHI-8J90", chassi: "9BWDB45J6YT345678" },
  ]},
  { id: 4, apolice: "#2340", cliente: "Roberto Lima", ramo: "Residencial", seguradora: "Tokio Marine", vencimento: "22/02/2026", premio: "R$ 2.100", dias: 10, status: "Pendente", observacoes: "", veiculos: [] },
  { id: 5, apolice: "#3567", cliente: "Fernanda Costa", ramo: "Auto", seguradora: "HDI", vencimento: "25/02/2026", premio: "R$ 4.500", dias: 13, status: "Em Contato", observacoes: "", veiculos: [
    { id: "v4", marca: "Honda", modelo: "Civic", ano: "2022", placa: "JKL-2M34", chassi: "93HFC2630AZ456789" },
  ]},
  { id: 6, apolice: "#4100", cliente: "João Silva", ramo: "Vida", seguradora: "MetLife", vencimento: "01/03/2026", premio: "R$ 2.800", dias: 17, status: "Pendente", observacoes: "", veiculos: [] },
  { id: 7, apolice: "#2890", cliente: "Maria Santos", ramo: "Auto", seguradora: "Bradesco", vencimento: "05/03/2026", premio: "R$ 3.600", dias: 21, status: "Renovado", observacoes: "", veiculos: [
    { id: "v5", marca: "Chevrolet", modelo: "Onix", ano: "2024", placa: "MNO-5P67", chassi: "9BGCA80X0CG567890" },
    { id: "v6", marca: "Hyundai", modelo: "HB20", ano: "2023", placa: "PQR-8S90", chassi: "9BHBG41DBDP678901" },
  ]},
];

const FALLBACK_COLUMNS: RenovacaoKanbanColumn[] = [
  { id: "Urgente", label: "Urgente", color: "text-destructive", bgColor: "bg-destructive" },
  { id: "Pendente", label: "Pendente", color: "text-warning", bgColor: "bg-warning" },
  { id: "Em Contato", label: "Em Contato", color: "text-info", bgColor: "bg-info" },
  { id: "Renovado", label: "Renovado", color: "text-success", bgColor: "bg-success" },
];

const Renovacoes = () => {
  const [search, setSearch] = useState("");
  const [renovacoes, setRenovacoes] = useState(renovacoesData);
  const [selectedRenovacao, setSelectedRenovacao] = useState<RenovacaoData | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "kanban">("kanban");
  const { data: apiStatuses } = useRenovacaoStatuses();

  const kanbanColumns: RenovacaoKanbanColumn[] = apiStatuses && apiStatuses.length > 0
    ? apiStatuses.sort((a, b) => a.ordem - b.ordem).map(s => ({ id: s.key, label: s.label, color: s.color, bgColor: s.bgColor }))
    : FALLBACK_COLUMNS;

  const filtered = renovacoes.filter(r => r.cliente.toLowerCase().includes(search.toLowerCase()) || r.apolice.includes(search));

  const handleKanbanStatusChange = (renovacaoId: number, newStatus: string) => {
    setRenovacoes(prev => prev.map(r => r.id === renovacaoId ? { ...r, status: newStatus } : r));
    const item = renovacoes.find(r => r.id === renovacaoId);
    if (item) toast.success(`Renovação de ${item.cliente} movida para "${newStatus}"`);
  };

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
            <p className="text-sm text-muted-foreground">{renovacoes.length} renovações próximas</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "kanban" ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={() => setViewMode("kanban")}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Kanban
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={() => setViewMode("table")}
            >
              <List className="h-3.5 w-3.5" /> Tabela
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar renovações..." className="pl-9 h-9 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Button variant="outline" size="sm" className="gap-2"><Filter className="h-3.5 w-3.5" /> Filtros</Button>
        </div>

        {viewMode === "kanban" ? (
          <RenovacaoKanban
            renovacoes={filtered}
            columns={kanbanColumns}
            onStatusChange={handleKanbanStatusChange}
            onItemClick={(item) => setSelectedRenovacao(item)}
          />
        ) : (
          <Card>
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
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">Veículos</th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r, i) => (
                      <tr
                        key={r.id}
                        className="border-b border-border hover:bg-muted/30 transition-colors animate-fade-in cursor-pointer"
                        style={{ animationDelay: `${i * 40}ms` }}
                        onClick={() => setSelectedRenovacao(r)}
                      >
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
                          <Badge variant="secondary" className="text-[10px]">{r.veiculos.length}</Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={r.status === "Urgente" ? "default" : "outline"} className={`text-[10px] ${statusColor(r.status)}`}>{r.status}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" title="Enviar email" onClick={(e) => { e.stopPropagation(); }}><Mail className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" title="Ligar" onClick={(e) => { e.stopPropagation(); }}><Phone className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" title="Renovar" onClick={(e) => {
                              e.stopPropagation();
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
        )}

        <RenovacaoDetailDialog
          open={!!selectedRenovacao}
          onOpenChange={(open) => { if (!open) setSelectedRenovacao(null); }}
          renovacao={selectedRenovacao}
          onSave={(updated) => {
            setRenovacoes(prev => prev.map(r => r.id === updated.id ? updated : r));
            setSelectedRenovacao(null);
          }}
        />
      </div>
    </AppLayout>
  );
};

export default Renovacoes;
