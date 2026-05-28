import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Plus, Filter, Loader2, Download, FileText, FileSpreadsheet } from "lucide-react";
import { SinistroKanban, type SinistroItem, type SinistroKanbanColumn } from "@/components/sinistros/SinistroKanban";
import { SinistroDetailSheet } from "@/components/sinistros/SinistroDetailSheet";
import { NovoSinistroDialog } from "@/components/sinistros/NovoSinistroDialog";
import { toast } from "@/hooks/use-toast";
import { sinistroService } from "@/services/sinistroService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const SINISTRO_COLUMNS: SinistroKanbanColumn[] = [
  { id: "abertura", label: "Abertura do Sinistro", color: "text-info", bgColor: "bg-info" },
  { id: "agendamento_vistoria", label: "Agendamento de Vistoria", color: "text-info", bgColor: "bg-info" },
  { id: "em_analise", label: "Em Análise", color: "text-warning", bgColor: "bg-warning" },
  { id: "indenizacao_integral", label: "Indenização Integral", color: "text-accent", bgColor: "bg-accent" },
  { id: "acordo_terceiro", label: "Acordo Terceiro", color: "text-accent", bgColor: "bg-accent" },
  { id: "lucros_cessantes", label: "Lucros Cessantes", color: "text-accent", bgColor: "bg-accent" },
  { id: "pendente_retorno", label: "Pendente Retorno Seg/Terc", color: "text-warning", bgColor: "bg-warning" },
  { id: "fora_do_prazo", label: "Fora do Prazo", color: "text-destructive", bgColor: "bg-destructive" },
  { id: "acompanhamento_reparo", label: "Acompanhamento de Reparo", color: "text-success", bgColor: "bg-success" },
  { id: "finalizado", label: "Finalizado", color: "text-success", bgColor: "bg-success" },
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [sinistros, setSinistros] = useState<SinistroItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedSinistro, setSelectedSinistro] = useState<SinistroItem | null>(null);
  const [novoDialogOpen, setNovoDialogOpen] = useState(false);

  const loadSinistros = async () => {
    try {
      setLoading(true);
      const data = await sinistroService.fetchSinistros();
      const mapped = data.map(s => ({
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
        dataTratativa: s.dataTratativa,
        veiculo: s.veiculo,
        terceiros: s.terceiros,
      }));
      setSinistros(mapped);
      // Update selected sinistro if open
      if (selectedSinistro) {
        const updated = mapped.find(s => s.id === selectedSinistro.id);
        if (updated) setSelectedSinistro(updated);
      }
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

  const filtered = sinistros.filter(s => {
    const matchSearch = !search || s.cliente.toLowerCase().includes(search.toLowerCase()) || s.id.includes(search);
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    const matchDate = !dateFilter || (s.dataTratativa || s.dataAbertura || "").includes(dateFilter);
    return matchSearch && matchStatus && matchDate;
  });

  const handleStatusChange = async (sinistroId: string, newStatus: string) => {
    setSinistros(prev => prev.map(s => s.id === sinistroId ? { ...s, status: newStatus } : s));
    try {
      await sinistroService.updateSinistro({ id: sinistroId }, { status: newStatus });
      toast({ title: "Status atualizado", description: `Sinistro ${sinistroId} movido para ${SINISTRO_COLUMNS.find(c => c.id === newStatus)?.label || newStatus}` });
    } catch {
      setSinistros(prev => prev.map(s => s.id === sinistroId ? { ...s, status: sinistros.find(x => x.id === sinistroId)?.status || s.status } : s));
      toast({ title: "Erro", description: "Não foi possível atualizar o status", variant: "destructive" });
    }
  };

  const handleItemClick = (sinistro: SinistroItem) => {
    setSelectedSinistro(sinistro);
    setDetailOpen(true);
  };

  const handleSinistroCriado = (sinistro: SinistroItem) => {
    setSinistros(prev => [sinistro, ...prev]);
    loadSinistros(); // Refresh from API
  };

  const handleExport = () => {
    if (!filtered.length) {
      toast({ title: "Sem dados", description: "Não há sinistros para exportar com os filtros atuais", variant: "destructive" });
      return;
    }
    const statusLabel = (id: string) => SINISTRO_COLUMNS.find(c => c.id === id)?.label || id;
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const today = new Date().toLocaleDateString("pt-BR");

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Relatório de Sinistros", 40, 40);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Gerado em: ${today}`, 40, 58);
    doc.text(`Total: ${filtered.length} sinistros`, pageWidth - 40, 58, { align: "right" });

    autoTable(doc, {
      startY: 75,
      head: [["ID", "Cliente", "Telefone", "Seguradora", "Tipo", "Status", "Prioridade", "Abertura", "Valor", "Oficina"]],
      body: filtered.map(s => [
        s.id, s.cliente, s.telefone, s.seguradora, s.tipo,
        statusLabel(s.status), s.prioridade, s.dataAbertura, s.valor, s.oficina || "",
      ]),
      styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
      headStyles: { fillColor: [180, 30, 40], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 40, right: 40 },
    });

    doc.save(`sinistros_${new Date().toISOString().slice(0, 10)}.pdf`);
    toast({ title: "Relatório exportado", description: `${filtered.length} sinistros exportados em PDF` });
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Sinistros</h2>
            <p className="text-sm text-muted-foreground">{sinistros.length} sinistros registrados</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Exportar Relatório
            </Button>
            <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setNovoDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Novo Sinistro
            </Button>
          </div>
        </div>

        {/* Filters bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar sinistros..." className="pl-9 h-9 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[240px] h-9 text-sm">
              <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {SINISTRO_COLUMNS.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            className="h-9 text-sm w-[170px]"
            value={dateFilter ? dateFilter.split("/").reverse().join("-") : ""}
            onChange={(e) => {
              const v = e.target.value;
              setDateFilter(v ? v.split("-").reverse().join("/") : "");
            }}
          />
          {dateFilter && (
            <Button variant="ghost" size="sm" className="h-9" onClick={() => setDateFilter("")}>Limpar data</Button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <SinistroKanban
            sinistros={filtered}
            columns={SINISTRO_COLUMNS}
            onStatusChange={handleStatusChange}
            onItemClick={handleItemClick}
          />
        )}
      </div>

      <SinistroDetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        sinistro={selectedSinistro ? {
          id: selectedSinistro.id,
          numeroSinistro: selectedSinistro.id,
          dataSinistro: selectedSinistro.dataAbertura,
          apolice: selectedSinistro.apolice || "",
          cliente: selectedSinistro.cliente,
          clienteId: selectedSinistro.clienteId,
          tipo: selectedSinistro.tipo,
          dataAbertura: selectedSinistro.dataAbertura,
          valor: selectedSinistro.valor,
          status: selectedSinistro.status,
          prioridade: selectedSinistro.prioridade,
          telefone: selectedSinistro.telefone,
          seguradora: selectedSinistro.seguradora || "",
          oficina: selectedSinistro.oficina || "",
          observacoes: selectedSinistro.observacoes || "",
          terceiros: selectedSinistro.terceiros || [],
        } : null}
        onSinistroUpdated={() => loadSinistros()}
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
