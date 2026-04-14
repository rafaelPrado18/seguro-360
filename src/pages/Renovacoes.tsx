import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Mail, Phone, RefreshCw, LayoutGrid, List, Loader2, Plus } from "lucide-react";
import { useState, useMemo } from "react";
import { RenovacaoDetailDialog, type RenovacaoData } from "@/components/renovacoes/RenovacaoDetailDialog";
import { RenovacaoKanban, type RenovacaoKanbanColumn } from "@/components/renovacoes/RenovacaoKanban";
import { NovaRenovacaoDialog } from "@/components/renovacoes/NovaRenovacaoDialog";
import { useRenovacaoStatuses } from "@/hooks/useRenovacaoStatus";
import { useRenovacaoClients } from "@/hooks/useRenovacaoClients";
import { renovacaoClientService, type RenovacaoClient } from "@/services/renovacaoClientService";
import { useQueryClient } from "@tanstack/react-query";

const FALLBACK_COLUMNS: RenovacaoKanbanColumn[] = [
  { id: "Urgente", label: "Urgente", color: "text-destructive", bgColor: "bg-destructive" },
  { id: "Pendente", label: "Pendente", color: "text-warning", bgColor: "bg-warning" },
  { id: "Em Contato", label: "Em Contato", color: "text-info", bgColor: "bg-info" },
  { id: "Renovado", label: "Renovado", color: "text-success", bgColor: "bg-success" },
];

const Renovacoes = () => {
  const [search, setSearch] = useState("");
  const [selectedRenovacao, setSelectedRenovacao] = useState<RenovacaoData | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "kanban">("kanban");
  const [novaRenovacaoOpen, setNovaRenovacaoOpen] = useState(false);
  const { data: apiStatuses } = useRenovacaoStatuses();
  const { data: apiClients, isLoading } = useRenovacaoClients();
  const queryClient = useQueryClient();

  // Map API data to the RenovacaoData shape used by components
  const renovacoes: RenovacaoData[] = useMemo(() => {
    if (!apiClients) return [];
    return apiClients.map((c: RenovacaoClient) => ({
      id: c.id as unknown as number,
      apolice: c.apolice || "",
      cliente: c.cliente || "",
      ramo: c.ramo || "",
      seguradora: c.seguradora || "",
      vencimento: c.vencimento || "",
      premio: c.premio || "",
      dias: c.dias ?? 0,
      status: c.status || "",
      observacoes: c.observacoes || "",
      veiculos: c.veiculos || [],
    }));
  }, [apiClients]);

  const kanbanColumns: RenovacaoKanbanColumn[] = apiStatuses && apiStatuses.length > 0
    ? apiStatuses.sort((a, b) => a.ordem - b.ordem).map(s => ({ id: s.key, label: s.label, color: s.color, bgColor: s.bgColor }))
    : FALLBACK_COLUMNS;

  const filtered = renovacoes.filter(r => r.cliente.toLowerCase().includes(search.toLowerCase()) || r.apolice.includes(search));

  const handleKanbanStatusChange = async (renovacaoId: number, newStatus: string) => {
    const item = renovacoes.find(r => r.id === renovacaoId);
    if (!item) return;
    try {
      await renovacaoClientService.update(String(item.id), { status: newStatus });
      queryClient.invalidateQueries({ queryKey: ["renovacao-clients"] });
      toast.success(`Renovação de ${item.cliente} movida para "${newStatus}"`);
    } catch {
      toast.error(`Erro ao atualizar status da renovação de ${item.cliente}`);
    }
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

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : viewMode === "kanban" ? (
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
            setSelectedRenovacao(null);
            toast.success(`Renovação ${updated.apolice} atualizada!`);
          }}
        />
      </div>
    </AppLayout>
  );
};

export default Renovacoes;
