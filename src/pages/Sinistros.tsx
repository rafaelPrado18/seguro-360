import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Filter } from "lucide-react";
import { SinistroKanban, type SinistroItem, type SinistroKanbanColumn } from "@/components/sinistros/SinistroKanban";
import { SinistroDetailSheet } from "@/components/sinistros/SinistroDetailSheet";
import { NovoSinistroDialog } from "@/components/sinistros/NovoSinistroDialog";
import { toast } from "@/hooks/use-toast";

const SINISTRO_COLUMNS: SinistroKanbanColumn[] = [
  { id: "abertura", label: "Abertura / Agendamento Vistoria", color: "text-info", bgColor: "bg-info" },
  { id: "primeiro_atendimento", label: "Primeiro Atendimento", color: "text-warning", bgColor: "bg-warning" },
  { id: "indenizacao_integral", label: "Indenização Integral", color: "text-accent", bgColor: "bg-accent" },
  { id: "acordo_terceiro", label: "Acordo Terceiro", color: "text-primary", bgColor: "bg-primary" },
  { id: "lucros_cessantes", label: "Lucros Cessantes", color: "text-secondary-foreground", bgColor: "bg-secondary" },
  { id: "pendente", label: "Pendente", color: "text-muted-foreground", bgColor: "bg-muted-foreground" },
  { id: "em_atraso", label: "Em Atraso", color: "text-destructive", bgColor: "bg-destructive" },
  { id: "acompanhamento_reparo", label: "Acompanhamento de Reparo", color: "text-success", bgColor: "bg-success" },
];

const FILTER_OPTIONS = [
  { value: "all", label: "Todos os filtros" },
  { value: "seguradora", label: "Seguradora" },
  { value: "agendamento_vistoria", label: "Agendamento de vistoria" },
  { value: "retorno_pos_vistoria", label: "Acompanhamento retorno pós vistoria" },
  { value: "prazo_entrega_peca", label: "Acompanhamento prazo entrega de peça" },
  { value: "pos_envio_documentos", label: "Acompanhamento pós envio de documentos" },
  { value: "oficinas", label: "Oficinas (contatos oficina)" },
];

const initialSinistros: SinistroItem[] = [
  { id: "#892", cliente: "João Silva", clienteId: "1", seguradora: "Porto Seguro", tipo: "Colisão", dataAbertura: "10/02/2026", valor: "R$ 15.000", status: "abertura", prioridade: "Alta", telefone: "(11) 99999-1234", apolice: "#4521" },
  { id: "#891", cliente: "Carlos Mendes", clienteId: "2", seguradora: "Bradesco Seguros", tipo: "Furto", dataAbertura: "08/02/2026", valor: "R$ 42.000", status: "primeiro_atendimento", prioridade: "Alta", telefone: "(31) 97777-9012", apolice: "#4518" },
  { id: "#890", cliente: "Fernanda Costa", clienteId: "3", seguradora: "SulAmérica", tipo: "Danos Elétricos", dataAbertura: "05/02/2026", valor: "R$ 3.200", status: "acompanhamento_reparo", prioridade: "Média", telefone: "(41) 96666-3456", apolice: "#4517" },
  { id: "#889", cliente: "Empresa ABC Ltda", clienteId: "4", seguradora: "Tokio Marine", tipo: "Incêndio", dataAbertura: "01/02/2026", valor: "R$ 120.000", status: "indenizacao_integral", prioridade: "Crítica", telefone: "(11) 3333-4567", apolice: "#4520" },
  { id: "#888", cliente: "Roberto Lima", clienteId: "5", seguradora: "HDI", tipo: "Invalidez", dataAbertura: "28/01/2026", valor: "R$ 80.000", status: "pendente", prioridade: "Alta", telefone: "(51) 95555-1234", apolice: "#4516" },
  { id: "#887", cliente: "Maria Santos", clienteId: "6", seguradora: "Allianz", tipo: "Hospitalização", dataAbertura: "20/01/2026", valor: "R$ 8.500", status: "acordo_terceiro", prioridade: "Média", telefone: "(21) 98888-5678", apolice: "#4519" },
  { id: "#886", cliente: "Indústria XYZ S/A", clienteId: "7", seguradora: "Mapfre", tipo: "RC Geral", dataAbertura: "15/01/2026", valor: "R$ 250.000", status: "em_atraso", prioridade: "Crítica", telefone: "(11) 4444-7890", apolice: "#4514", oficina: "Auto Center SP" },
];

const Sinistros = () => {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [filterValue, setFilterValue] = useState("");
  const [sinistros, setSinistros] = useState<SinistroItem[]>(initialSinistros);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedSinistro, setSelectedSinistro] = useState<SinistroItem | null>(null);
  const [novoDialogOpen, setNovoDialogOpen] = useState(false);

  const filtered = sinistros.filter(s => {
    const matchSearch = !search || s.cliente.toLowerCase().includes(search.toLowerCase()) || s.id.includes(search);
    let matchFilter = true;
    if (activeFilter === "seguradora" && filterValue) {
      matchFilter = s.seguradora.toLowerCase().includes(filterValue.toLowerCase());
    }
    if (activeFilter === "oficinas" && filterValue) {
      matchFilter = (s.oficina || "").toLowerCase().includes(filterValue.toLowerCase());
    }
    return matchSearch && matchFilter;
  });

  const handleStatusChange = (sinistroId: string, newStatus: string) => {
    setSinistros(prev => prev.map(s => s.id === sinistroId ? { ...s, status: newStatus } : s));
    toast({ title: "Status atualizado", description: `Sinistro ${sinistroId} movido para ${SINISTRO_COLUMNS.find(c => c.id === newStatus)?.label || newStatus}` });
  };

  const handleItemClick = (sinistro: SinistroItem) => {
    setSelectedSinistro(sinistro);
    setDetailOpen(true);
  };

  const handleSinistroCriado = (sinistro: SinistroItem) => {
    setSinistros(prev => [sinistro, ...prev]);
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Sinistros</h2>
            <p className="text-sm text-muted-foreground">{sinistros.length} sinistros registrados</p>
          </div>
          <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setNovoDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo Sinistro
          </Button>
        </div>

        {/* Filters bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar sinistros..." className="pl-9 h-9 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={activeFilter} onValueChange={(v) => { setActiveFilter(v); setFilterValue(""); }}>
            <SelectTrigger className="w-[280px] h-9 text-sm">
              <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FILTER_OPTIONS.map(f => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {activeFilter !== "all" && (
            <Input
              placeholder={`Filtrar por ${FILTER_OPTIONS.find(f => f.value === activeFilter)?.label || ""}...`}
              className="h-9 text-sm max-w-xs"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
            />
          )}
        </div>

        <SinistroKanban
          sinistros={filtered}
          columns={SINISTRO_COLUMNS}
          onStatusChange={handleStatusChange}
          onItemClick={handleItemClick}
        />
      </div>

      <SinistroDetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        sinistro={selectedSinistro ? {
          id: selectedSinistro.id,
          apolice: selectedSinistro.apolice || "",
          cliente: selectedSinistro.cliente,
          tipo: selectedSinistro.tipo,
          dataAbertura: selectedSinistro.dataAbertura,
          valor: selectedSinistro.valor,
          status: selectedSinistro.status,
          prioridade: selectedSinistro.prioridade,
          telefone: selectedSinistro.telefone,
        } : null}
      />

      <NovoSinistroDialog
        open={novoDialogOpen}
        onOpenChange={setNovoDialogOpen}
        onSinistroCriado={handleSinistroCriado}
      />
    </AppLayout>
  );
};

export default Sinistros;
