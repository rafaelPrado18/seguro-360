import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Filter, Loader2 } from "lucide-react";
import { SinistroKanban, type SinistroItem, type SinistroKanbanColumn } from "@/components/sinistros/SinistroKanban";
import { SinistroDetailSheet } from "@/components/sinistros/SinistroDetailSheet";
import { NovoSinistroDialog } from "@/components/sinistros/NovoSinistroDialog";
import { toast } from "@/hooks/use-toast";
import { sinistroService } from "@/services/sinistroService";

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
  { value: "all", label: "Todos os filtros", type: "none" },
  { value: "seguradora", label: "Seguradora", type: "text" },
  { value: "agendamento_vistoria", label: "Agendamento de vistoria", type: "status", statusId: "abertura" },
  { value: "retorno_pos_vistoria", label: "Acompanhamento retorno pós vistoria", type: "status", statusId: "primeiro_atendimento" },
  { value: "prazo_entrega_peca", label: "Acompanhamento prazo entrega de peça", type: "status", statusId: "acompanhamento_reparo" },
  { value: "pos_envio_documentos", label: "Acompanhamento pós envio de documentos", type: "status", statusId: "pendente" },
  { value: "oficinas", label: "Oficinas (contatos oficina)", type: "text" },
];

const Sinistros = () => {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [filterValue, setFilterValue] = useState("");
  const [sinistros, setSinistros] = useState<SinistroItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedSinistro, setSelectedSinistro] = useState<SinistroItem | null>(null);
  const [novoDialogOpen, setNovoDialogOpen] = useState(false);

  const loadSinistros = async () => {
    try {
      setLoading(true);
      const data = await sinistroService.fetchSinistros();
      setSinistros(data.map(s => ({
        id: s.id,
        cliente: s.cliente,
        clienteId: s.clienteId,
        seguradora: s.seguradora,
        tipo: s.tipo,
        dataAbertura: s.dataAbertura,
        valor: s.valor,
        status: s.status,
        prioridade: s.prioridade,
        telefone: s.telefone,
        apolice: s.apolice,
        oficina: s.oficina,
        observacoes: s.observacoes,
        veiculo: s.veiculo,
      })));
    } catch (err) {
      console.error("Erro ao carregar sinistros:", err);
      toast({ title: "Erro", description: "Não foi possível carregar os sinistros", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSinistros();
  }, []);

  const activeFilterOption = FILTER_OPTIONS.find(f => f.value === activeFilter);

  const filtered = sinistros.filter(s => {
    const matchSearch = !search || s.cliente.toLowerCase().includes(search.toLowerCase()) || s.id.includes(search);

    let matchFilter = true;
    if (activeFilterOption && activeFilterOption.type === "text" && filterValue) {
      if (activeFilter === "seguradora") {
        matchFilter = s.seguradora.toLowerCase().includes(filterValue.toLowerCase());
      } else if (activeFilter === "oficinas") {
        matchFilter = (s.oficina || "").toLowerCase().includes(filterValue.toLowerCase());
      }
    } else if (activeFilterOption && activeFilterOption.type === "status") {
      matchFilter = s.status === activeFilterOption.statusId;
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
          {activeFilterOption?.type === "text" && (
            <Input
              placeholder={`Filtrar por ${activeFilterOption.label}...`}
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
