import { useState, useEffect, useMemo, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Search, Plus, MoreHorizontal, Users, Target,
  TrendingUp, UserCheck, Shuffle, Phone, Kanban, List, Settings2, Send, MessageSquare, CalendarDays, Download
} from "lucide-react";
import * as XLSX from "xlsx";
import { startOfDay, startOfYesterday, subDays, isAfter, isEqual, parse } from "date-fns";
import { LeadKanban, type KanbanColumn } from "@/components/leads/LeadKanban";
import { NewLeadDialog } from "@/components/leads/NewLeadDialog";
import { LeadDetailSheet } from "@/components/leads/LeadDetailSheet";
import { RedistribuirLeadsDialog } from "@/components/leads/RedistribuirLeadsDialog";
import { useRole } from "@/contexts/RoleContext";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import type { Lead } from "@/services/leadsService";
import type { WhatsAppTemplate } from "@/services/whatsappService";
import { whatsappService } from "@/services/whatsappService";
import { useNotifications } from "@/contexts/NotificationContext";
import { useLeads, useUpdateLeadStatus, useRedistributeLeads } from "@/hooks/useLeads";
import { useLeadStatuses } from "@/hooks/useStatus";
import { useAgents } from "@/hooks/useAgents";
import { useWhatsAppTemplates } from "@/hooks/useWhatsApp";
import { v4 as uuidv4 } from "uuid";

const PLACEHOLDER_LEADS: Lead[] = [];

const KANBAN_COLUMNS_FALLBACK: KanbanColumn[] = [
  { id: "novo", label: "Novo", color: "text-info", bgColor: "bg-info" },
  { id: "em_contato", label: "Em Contato", color: "text-warning", bgColor: "bg-warning" },
  { id: "qualificado", label: "Qualificado", color: "text-primary", bgColor: "bg-primary" },
  { id: "proposta_enviada", label: "Proposta", color: "text-accent", bgColor: "bg-accent" },
  { id: "convertido", label: "Convertido", color: "text-success", bgColor: "bg-success" },
];

const statusLabels: Record<Lead["status"], string> = {
  novo: "Novo", em_contato: "Em Contato", qualificado: "Qualificado",
  proposta_enviada: "Proposta Enviada", convertido: "Convertido", perdido: "Perdido",
};

const statusColors: Record<Lead["status"], string> = {
  novo: "bg-info text-info-foreground",
  em_contato: "border-warning text-warning",
  qualificado: "border-primary text-primary",
  proposta_enviada: "border-accent text-accent",
  convertido: "border-success text-success",
  perdido: "border-destructive text-destructive",
};

const origemLabels: Record<string, string> = {
  whatsapp: "WhatsApp", site: "Site", indicacao: "Indicação",
  facebook: "Facebook", instagram: "Instagram", google_ads: "Google Ads", outro: "Outro",
};

// Map lead status to template category
const STATUS_TEMPLATE_MAP: Record<string, string> = {
  teste_1: "boas_vindas",
  em_contato: "follow_up",
  qualificado: "follow_up",
  proposta_enviada: "proposta",
  convertido: "geral",
  perdido: "geral",
};


const Leads = () => {
  
  const { isAdmin, currentUser } = useRole();
  const { addNotification } = useNotifications();
  const { role } = useRole();
  const { data: apiData } = useLeads(null, currentUser.nome, role);
  const { data: apiStatuses } = useLeadStatuses();
  const { data: agents } = useAgents();
  const { data: templates = [] } = useWhatsAppTemplates();

  const agentCorretores = useMemo(() => {
    if (!agents) return [];
    return agents.filter(a => a.isActive && a.function !== "administrador" && a.function !== "Super Admin");
  }, [agents]);

  const kanbanColumns: KanbanColumn[] = useMemo(() => {
    console.log(apiStatuses)
    if (apiStatuses && apiStatuses.length > 0) {
      return apiStatuses
        .sort((a, b) => a.ordem - b.ordem)
        .map(s => ({
          id: s.key,
          label: s.label,
          color: s.color,
          bgColor: s.bgColor,
        }));
    }
    return KANBAN_COLUMNS_FALLBACK;
  }, [apiStatuses]);
  const updateLeadStatus = useUpdateLeadStatus();
  const redistributeLeads = useRedistributeLeads();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [leads, setLeads] = useState(PLACEHOLDER_LEADS);
  const [corretorFilter, setCorretorFilter] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [customDateStart, setCustomDateStart] = useState<string>("");
  const [customDateEnd, setCustomDateEnd] = useState<string>("");
  const [newLeadOpen, setNewLeadOpen] = useState(false);
  const [redistribuirOpen, setRedistribuirOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    if (apiData?.data && apiData.data.length > 0) {
      setLeads(apiData.data);
    }
  }, [apiData]);

  const stats = useMemo(() => {
  if (!leads || leads.length === 0) {
    return {
      total: 0,
      novos: 0,
      em_contato: 0,
      qualificados: 0,
      convertidos: 0,
      perdidos: 0,
      valor_total: 0,
      taxa_conversao: 0,
    };
  }

  const counters = {
    total: leads.length,
    novos: 0,
    em_contato: 0,
    qualificados: 0,
    proposta_enviada: 0,
    convertidos: 0,
    perdidos: 0,
    valor_total: 0,
  };

  for (const lead of leads) {
    switch (lead.status) {
      case "novo":
        counters.novos++;
        break;

      case "em_contato":
        counters.em_contato++;
        break;

      case "qualificado":
        counters.qualificados++;
        break;

      case "proposta_enviada":
        counters.proposta_enviada++;
        break;

      case "convertido":
        counters.convertidos++;
        counters.valor_total += lead.valor_estimado || 0;
        break;

      case "perdido":
        counters.perdidos++;
        break;
    }
  }

  const taxa =
    counters.total > 0
      ? (counters.convertidos / counters.total) * 100
      : 0;

  return {
    ...counters,
    taxa_conversao: Number(taxa.toFixed(1)),
  };
}, [leads]);

  // Status change + template confirmation
  const [pendingChange, setPendingChange] = useState<{ leadId: string; newStatus: string; lead: Lead } | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [sendMessage, setSendMessage] = useState(true);

  const distribution = useMemo(() => {
    return agentCorretores.map(a => ({
      corretor_id: a.agentId,
      corretor_nome: a.name?.toLowerCase(),
      total_leads: leads.filter(l => l.corretor_responsavel?.toLowerCase() === a.name?.toLowerCase()).length,
      convertidos: leads.filter(l => l.corretor_responsavel?.toLowerCase() === a.name?.toLowerCase() && l.status === "convertido").length,
      taxa_conversao: (() => {
        const total = leads.filter(l => l.corretor_responsavel?.toLowerCase() === a.name?.toLowerCase()).length;
        const conv = leads.filter(l => l.corretor_responsavel?.toLowerCase() === a.name?.toLowerCase() && l.status === "convertido").length;
        return total > 0 ? Number(((conv / total) * 100).toFixed(1)) : 0;
      })(),
      valor_total_convertido: leads.filter(l => l.corretor_responsavel?.toLowerCase() === a.name?.toLowerCase() && l.status === "convertido")
        .reduce((sum, l) => sum + (l.valor_estimado || 0), 0),
    }));
  }, [agentCorretores, leads]);

  const getTemplateForStatus = (status: string): WhatsAppTemplate | null => {
    console.log('status:', status)
    const category = STATUS_TEMPLATE_MAP[status];
    if (!category) return null;
    return DEFAULT_TEMPLATES.find(t => t.categoria === category && t.status === "aprovado") || null;
  };

  const handleStatusChange = (leadId: string, newStatus: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    const template = getTemplateForStatus(newStatus);
    if (template) {
      setPendingChange({ leadId, newStatus, lead });
      setSelectedTemplate(template);
      setSendMessage(true);
    } else {
      applyStatusChange(leadId, newStatus, false);
    }
  };

  const applyStatusChange = (leadId: string, newStatus: string, shouldSend: boolean) => {
    // Optimistic update local
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus as Lead["status"] } : l));

    // Call API to persist status change
    updateLeadStatus.mutate(
      { id: leadId, status: newStatus as Lead["status"] },
      {
        onError: (error) => {
          // Revert on error
          setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: leads.find(ol => ol.id === leadId)?.status || l.status } : l));
          toast.error("Erro ao atualizar status do lead");
          console.error("Status update failed:", error);
        },
      }
    );

    if (shouldSend && selectedTemplate) {
      const lead = leads.find(l => l.id === leadId);
      if (lead) {
        const mensagem = getPreviewText(selectedTemplate, lead);
        whatsappService.sendMessage({
          userId: currentUser.id,
          chatId: '5514996142542',
          tipo: "text",
          message: mensagem,
        })
          .then(() => toast.success(`Mensagem "${selectedTemplate.nome}" enviada via WhatsApp`))
          .catch((err) => {
            console.error("Erro ao enviar mensagem WhatsApp:", err);
            toast.error("Erro ao enviar mensagem via WhatsApp");
          });
      }
    }
    setPendingChange(null);
    setSelectedTemplate(null);
  };

  const getPreviewText = (template: WhatsAppTemplate, lead: Lead) => {
    return template.conteudo
      .replace(/\{\{nome\}\}/g, lead.nome)
      .replace(/\{\{ramo\}\}/g, lead.ramo_interesse)
      .replace(/\{\{corretor\}\}/g, lead.corretor_responsavel || "Corretor")
      .replace(/\{\{telefone\}\}/g, lead.telefone)
      .replace(/\{\{email\}\}/g, lead.email)
      .replace(/\{\{valor_premio\}\}/g, `R$ ${lead.valor_estimado}`)
      .replace(/\{\{seguradora\}\}/g, "Seguradora")
      .replace(/\{\{link_proposta\}\}/g, "https://...")
      .replace(/\{\{numero_apolice\}\}/g, "#...")
      .replace(/\{\{data_vencimento\}\}/g, "...")
  };

  const parseBrDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;

    // DD/MM/YYYY HH:mm
    let match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);
    if (match) {
      const [, dd, mm, yyyy, hh, min] = match;
      return new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min), 0);
    }

    // DD/MM/YYYY HH:mm:ss
    match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/);
    if (match) {
      const [, dd, mm, yyyy, hh, min, ss] = match;
      return new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min), Number(ss));
    }

    // ISO
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  };

  const getSmartShortcutLabel = (): string => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    if (dayOfWeek === 1) return "Desde sáb 14h";
    return "Desde ontem 18h";
  };

  const getSmartShortcutDate = (): { start: Date; end: Date } => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    let start: Date;
    if (dayOfWeek === 1) {
      start = new Date(now);
      start.setDate(now.getDate() - 2);
      start.setHours(14, 0, 0, 0);
    } else {
      start = new Date(now);
      start.setDate(now.getDate() - 1);
      start.setHours(18, 0, 0, 0);
    }
    return { start, end: now };
  };

  const getDateFilterStart = (filter: string): Date | null => {
    const now = new Date();
    switch (filter) {
      case "hoje": return startOfDay(now);
      case "ontem": return startOfYesterday();
      case "7dias": return startOfDay(subDays(now, 7));
      case "15dias": return startOfDay(subDays(now, 15));
      case "30dias": return startOfDay(subDays(now, 30));
      case "atalho": return getSmartShortcutDate().start;
      case "custom": return customDateStart ? new Date(customDateStart) : null;
      default: return null;
    }
  };

  const getDateFilterEnd = (filter: string): Date | null => {
    if (filter === "ontem") return startOfDay(new Date());
    if (filter === "atalho") return getSmartShortcutDate().end;
    if (filter === "custom") return customDateEnd ? new Date(customDateEnd) : null;
    return null;
  };

  const displayLeads = leads.filter(l => {
    const matchesSearch = l.nome?.toLowerCase()?.includes(search?.toLowerCase()) || l.telefone?.includes(search);
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    const matchesCorretor = isAdmin
      ? corretorFilter.length === 0 || corretorFilter.includes(l.corretor_responsavel?.toLowerCase() || "")
      : l.corretor_responsavel?.toLowerCase() === currentUser.nome.toLowerCase() || !l.corretor_responsavel?.toLowerCase();
    
    let matchesDate = true;
    if (dateFilter !== "all" && l.created_at) {
      const leadDate = parseBrDate(l.created_at);
      if (!leadDate) {
        matchesDate = false; // can't parse → filter out when date filter is active
      } else {
        const start = getDateFilterStart(dateFilter);
        const end = getDateFilterEnd(dateFilter);
        if (start) matchesDate = isAfter(leadDate, start) || isEqual(leadDate, start);
        if (matchesDate && end) matchesDate = !isAfter(leadDate, end);
      }
    }

    return matchesSearch && matchesStatus && matchesCorretor && matchesDate;
  });

  const sortedLeads = [...displayLeads].sort((a, b) => {
    const dateA = parseBrDate(a.created_at || "");
    const dateB = parseBrDate(b.created_at || "");

    if (!dateA || !dateB) return 0;

    // MAIS NOVO PRIMEIRO
    return dateB.getTime() - dateA.getTime();
  });

  const handleExportExcel = useCallback(() => {
    const rows = sortedLeads.map(l => ({
      "Nome": l.nome || "",
      "Telefone": l.telefone || "",
      "Email": l.email || "",
      "Placa": l.placa || "",
      "Ramo": l.ramo_interesse || "",
      "Status": statusLabels[l.status] || l.status,
      "Corretor": l.corretor_responsavel || "",
      "Origem": origemLabels[l.origem] || l.origem || "",
      "Valor Estimado": l.valor_estimado || 0,
      "Criado em": l.created_at || "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    XLSX.writeFile(wb, `leads_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success(`${rows.length} leads exportados com sucesso!`);
  }, [sortedLeads]);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Leads</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isAdmin ? "Visão do Administrador — Todos os corretores" : `Meus Leads — ${currentUser.nome}`}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {isAdmin && (
              <>
                <Link to="/gerenciar-status">
                  <Button variant="outline" className="gap-2" size="sm">
                    <Settings2 className="h-4 w-4" /> <span className="hidden sm:inline">Status</span>
                  </Button>
                </Link>
                <Button variant="outline" className="gap-2" size="sm" onClick={() => setRedistribuirOpen(true)}>
                  <Shuffle className="h-4 w-4" /> <span className="hidden sm:inline">Distribuir</span>
                </Button>
              </>
            )}
            {/*
            <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90" size="sm" onClick={() => setNewLeadOpen(true)}>
              <Plus className="h-4 w-4" /> Novo Lead
            </Button>
            */}
          </div>
        </div>


        {/* Admin: Distribution Table */}
        {isAdmin && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Distribuição por Corretor</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Corretor</th>
                      <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">Leads</th>
                      <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">Convertidos</th>
                      <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">Taxa</th>
                      <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Valor Convertido</th>
                      <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {distribution.map((d, i) => (
                      <tr key={d.corretor_id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary">
                              {d.corretor_nome.split(" ").map(n => n[0]).join("")}
                            </div>
                            <span className="font-medium">{d.corretor_nome}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-center font-semibold">{d.total_leads}</td>
                        <td className="px-4 py-2.5 text-center text-success font-medium">{d.convertidos}</td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`font-semibold ${d.taxa_conversao >= 35 ? "text-success" : d.taxa_conversao >= 25 ? "text-warning" : "text-destructive"}`}>
                            {d.taxa_conversao}%
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right font-semibold">R$ {(d.valor_total_convertido / 1000).toFixed(0)}k</td>
                        <td className="px-4 py-2.5">
                          <div className="w-full bg-muted rounded-full h-1.5">
                            <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${d.taxa_conversao * 2.5}%` }} />
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

        {/* View Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[180px] max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar leads..." className="pl-9 h-9 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            {isAdmin && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[160px] sm:w-[200px] h-9 text-sm justify-between font-normal">
                    <span className="truncate">
                      {corretorFilter.length === 0
                        ? "Todos os Corretores"
                        : corretorFilter.length === 1
                        ? distribution.find(d => d.corretor_nome.toLowerCase() === corretorFilter[0])?.corretor_nome.toLowerCase() || "1 corretor"
                        : `${corretorFilter.length} corretores`}
                    </span>
                    <Users className="h-3.5 w-3.5 ml-1 shrink-0 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2" align="start">
                  <div className="space-y-1">
                    <label
                      className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/60 cursor-pointer transition-colors"
                      onClick={() => setCorretorFilter([])}
                    >
                      <Checkbox checked={corretorFilter.length === 0} onCheckedChange={() => setCorretorFilter([])} />
                      <span className="text-sm font-medium">Todos</span>
                    </label>
                    {distribution.map(d => (
                      <label
                        key={d.corretor_id}
                        className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/60 cursor-pointer transition-colors"
                      >
                        <Checkbox
                          checked={corretorFilter.includes(d.corretor_nome?.toLowerCase())}
                          onCheckedChange={(checked) => {
                            setCorretorFilter(prev =>
                              checked
                                ? [...prev, d.corretor_nome?.toLowerCase()]
                                : prev.filter(n => n !== d.corretor_nome?.toLowerCase())
                            );
                          }}
                        />
                        <span className="text-sm">{d.corretor_nome?.toLowerCase()}</span>
                      </label>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
            <Select value={dateFilter} onValueChange={(v) => { setDateFilter(v); if (v !== "custom") { setCustomDateStart(""); setCustomDateEnd(""); } }}>
              <SelectTrigger className="w-[160px] sm:w-[180px] h-9 text-sm">
                <CalendarDays className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="atalho">{getSmartShortcutLabel()}</SelectItem>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="ontem">Ontem</SelectItem>
                <SelectItem value="7dias">Últimos 7 dias</SelectItem>
                <SelectItem value="15dias">Últimos 15 dias</SelectItem>
                <SelectItem value="30dias">Últimos 30 dias</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
            {dateFilter === "custom" && (
              <div className="flex items-center gap-1.5">
                <Input
                  type="datetime-local"
                  className="h-9 text-sm w-[175px]"
                  value={customDateStart}
                  onChange={(e) => setCustomDateStart(e.target.value)}
                  placeholder="De"
                />
                <span className="text-xs text-muted-foreground">até</span>
                <Input
                  type="datetime-local"
                  className="h-9 text-sm w-[175px]"
                  value={customDateEnd}
                  onChange={(e) => setCustomDateEnd(e.target.value)}
                  placeholder="Até"
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleExportExcel}
            >
              <Download className="h-3.5 w-3.5" /> Exportar
            </Button>
            <Button
              variant={viewMode === "kanban" ? "default" : "outline"}
              size="sm"
              className="gap-1.5"
              onClick={() => setViewMode("kanban")}
            >
              <Kanban className="h-3.5 w-3.5" /> Kanban
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              className="gap-1.5"
              onClick={() => setViewMode("list")}
            >
              <List className="h-3.5 w-3.5" /> Lista
            </Button>
          </div>
        </div>

        {/* Content */}
        {viewMode === "kanban" ? (
          <LeadKanban
            leads={sortedLeads}
            columns={kanbanColumns}
            onStatusChange={handleStatusChange}
            corretorFilter={isAdmin ? (corretorFilter.length > 0 ? corretorFilter[0] : null) : currentUser.nome}
            onLeadClick={(lead) => setSelectedLead(lead)}
          />
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Lead</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Contato</th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">Origem</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ramo</th>
                      {isAdmin && <th className="px-4 py-3 text-left font-medium text-muted-foreground">Corretor</th>}
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Valor Est.</th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedLeads.map((l, i) => (
                      <tr key={l.id} className="border-b border-border hover:bg-muted/30 transition-colors animate-fade-in cursor-pointer" style={{ animationDelay: `${i * 40}ms` }} onClick={() => setSelectedLead(l)}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-accent/15 flex items-center justify-center text-[10px] font-semibold text-accent">
                              {l.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                            </div>
                            <span className="font-medium">{l.nome}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{l.telefone}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="secondary" className="text-[10px]">{origemLabels[l.origem]}</Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{l.ramo_interesse}</td>
                        {isAdmin && (
                          <td className="px-4 py-3 text-sm">
                            {l.corretor_responsavel || <span className="text-muted-foreground italic text-xs">Não atribuído</span>}
                          </td>
                        )}
                        <td className="px-4 py-3 text-right font-semibold">R$ {l.valor_estimado}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={l.status === "novo" ? "default" : "outline"} className={`text-[10px] ${statusColors[l.status]}`}>
                            {statusLabels[l.status]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        <NewLeadDialog
          open={newLeadOpen}
          onOpenChange={setNewLeadOpen}
          onLeadCreated={(lead) => {
            const newLead: Lead = {
              ...lead as Lead,
              id: uuidv4(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            setLeads(prev => [newLead, ...prev]);
          }}
        />

        <LeadDetailSheet
          lead={selectedLead}
          open={!!selectedLead}
          onOpenChange={(open) => { if (!open) setSelectedLead(null); }}
          onLeadUpdate={(updated) => {
            setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
            setSelectedLead(updated);
          }}
          onLeadDelete={(id) => {
            setLeads(prev => prev.filter(l => l.id !== id));
            setSelectedLead(null);
          }}
        />

        <RedistribuirLeadsDialog
          open={redistribuirOpen}
          onOpenChange={setRedistribuirOpen}
          corretores={distribution.map(d => ({ id: d.corretor_id, nome: d.corretor_nome }))}
          onRedistribuir={({ startDate, startHour, corretorOrigem, corretoresDestino }) => {
            const dateStr = startDate.toISOString().split("T")[0];
            redistributeLeads.mutate(
              { startDate: dateStr, startHour, corretorOrigem, corretoresDestino },
              {
                onSuccess: () => toast.success("Leads redistribuídos com sucesso!"),
                onError: () => toast.error("Erro ao redistribuir leads."),
              }
            );
          }}
        />
        {/* Template Send Confirmation Dialog */}
        <Dialog open={!!pendingChange} onOpenChange={(open) => { if (!open) { setPendingChange(null); setSelectedTemplate(null); } }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-accent" />
                Enviar mensagem WhatsApp?
              </DialogTitle>
              <DialogDescription>
                O lead <strong>{pendingChange?.lead.nome}</strong> será movido para{" "}
                <strong>{pendingChange ? statusLabels[pendingChange.newStatus as Lead["status"]] : ""}</strong>.
              </DialogDescription>
            </DialogHeader>

            {selectedTemplate && pendingChange && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">{selectedTemplate.nome}</Badge>
                </div>
                <div className="p-3 rounded-lg bg-muted border border-border max-h-48 overflow-y-auto">
                  <p className="text-sm whitespace-pre-wrap text-foreground">
                    {getPreviewText(selectedTemplate, pendingChange.lead)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="send-msg"
                    checked={sendMessage}
                    onCheckedChange={(checked) => setSendMessage(!!checked)}
                  />
                  <label htmlFor="send-msg" className="text-sm text-foreground cursor-pointer">
                    Enviar esta mensagem ao lead
                  </label>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => { if (pendingChange) applyStatusChange(pendingChange.leadId, pendingChange.newStatus, false); }}>
                Apenas mover
              </Button>
              <Button
                className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => { if (pendingChange) applyStatusChange(pendingChange.leadId, pendingChange.newStatus, sendMessage); }}
              >
                <Send className="h-4 w-4" />
                {sendMessage ? "Mover e Enviar" : "Confirmar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Leads;
