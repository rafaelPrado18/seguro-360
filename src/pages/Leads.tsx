import { useState, useEffect, useRef, useCallback } from "react";
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
import {
  Search, Plus, MoreHorizontal, Users, Target,
  TrendingUp, UserCheck, Shuffle, Phone, Kanban, List, Settings2, Send, MessageSquare
} from "lucide-react";
import { LeadKanban, type KanbanColumn } from "@/components/leads/LeadKanban";
import { NewLeadDialog } from "@/components/leads/NewLeadDialog";
import { LeadDetailSheet } from "@/components/leads/LeadDetailSheet";
import { RedistribuirLeadsDialog } from "@/components/leads/RedistribuirLeadsDialog";
import { useRole } from "@/contexts/RoleContext";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import type { Lead } from "@/services/leadsService";
import type { WhatsAppTemplate } from "@/services/whatsappService";
import { useLeads } from "@/hooks/useLeads";
import { useNotifications } from "@/contexts/NotificationContext";

const PLACEHOLDER_STATS = {
  total: 142, novos: 28, em_contato: 35, qualificados: 22, convertidos: 45, perdidos: 12,
  taxa_conversao: 31.7,
};

const PLACEHOLDER_DISTRIBUTION = [
  { corretor_id: "1", corretor_nome: "André Oliveira", total_leads: 32, convertidos: 12, taxa_conversao: 37.5, valor_total_convertido: 156000 },
  { corretor_id: "2", corretor_nome: "Beatriz Costa", total_leads: 28, convertidos: 10, taxa_conversao: 35.7, valor_total_convertido: 132000 },
  { corretor_id: "3", corretor_nome: "Carlos Neto", total_leads: 25, convertidos: 8, taxa_conversao: 32.0, valor_total_convertido: 98000 },
  { corretor_id: "4", corretor_nome: "Diana Alves", total_leads: 30, convertidos: 9, taxa_conversao: 30.0, valor_total_convertido: 115000 },
  { corretor_id: "5", corretor_nome: "Eduardo Ramos", total_leads: 27, convertidos: 6, taxa_conversao: 22.2, valor_total_convertido: 78000 },
];

const PLACEHOLDER_LEADS: Lead[] = [
  { id: "1", nome: "Ricardo Pereira", email: "ricardo@email.com", telefone: "(11) 99900-1234", origem: "whatsapp", ramo_interesse: "Auto", status: "novo", corretor_responsavel: null, valor_estimado: 3500, observacoes: "", created_at: "2026-02-12T10:00:00Z", updated_at: "2026-02-12T10:00:00Z" },
  { id: "2", nome: "Luciana Mendes", email: "luciana@email.com", telefone: "(21) 98800-5678", origem: "site", ramo_interesse: "Vida", status: "em_contato", corretor_responsavel: "André Oliveira", valor_estimado: 2200, observacoes: "", created_at: "2026-02-11T14:00:00Z", updated_at: "2026-02-12T09:00:00Z" },
  { id: "3", nome: "Empresa Alfa Ltda", email: "contato@alfa.com", telefone: "(11) 3300-9012", origem: "indicacao", ramo_interesse: "Empresarial", status: "qualificado", corretor_responsavel: "Beatriz Costa", valor_estimado: 45000, observacoes: "", created_at: "2026-02-10T11:00:00Z", updated_at: "2026-02-12T08:00:00Z" },
  { id: "4", nome: "Marcos Silva", email: "marcos@email.com", telefone: "(31) 97700-3456", origem: "facebook", ramo_interesse: "Residencial", status: "proposta_enviada", corretor_responsavel: "Carlos Neto", valor_estimado: 1800, observacoes: "", created_at: "2026-02-09T16:00:00Z", updated_at: "2026-02-11T15:00:00Z" },
  { id: "5", nome: "Patrícia Gomes", email: "patricia@email.com", telefone: "(41) 96600-7890", origem: "instagram", ramo_interesse: "Auto", status: "novo", corretor_responsavel: null, valor_estimado: 4200, observacoes: "", created_at: "2026-02-12T08:30:00Z", updated_at: "2026-02-12T08:30:00Z" },
  { id: "6", nome: "Fernando Dias", email: "fernando@email.com", telefone: "(51) 95500-2345", origem: "whatsapp", ramo_interesse: "Vida", status: "convertido", corretor_responsavel: "Diana Alves", valor_estimado: 3800, observacoes: "", created_at: "2026-02-05T09:00:00Z", updated_at: "2026-02-10T17:00:00Z" },
  { id: "7", nome: "Juliana Rocha", email: "juliana@email.com", telefone: "(61) 94400-6789", origem: "google_ads", ramo_interesse: "Saúde", status: "perdido", corretor_responsavel: "Eduardo Ramos", valor_estimado: 5600, observacoes: "", created_at: "2026-02-03T13:00:00Z", updated_at: "2026-02-08T10:00:00Z" },
  { id: "8", nome: "Tech Solutions S/A", email: "rh@tech.com", telefone: "(11) 4400-1122", origem: "indicacao", ramo_interesse: "Empresarial", status: "em_contato", corretor_responsavel: "André Oliveira", valor_estimado: 78000, observacoes: "", created_at: "2026-02-11T10:00:00Z", updated_at: "2026-02-12T07:00:00Z" },
];

const KANBAN_COLUMNS: KanbanColumn[] = [
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
  novo: "boas_vindas",
  em_contato: "follow_up",
  qualificado: "follow_up",
  proposta_enviada: "proposta",
  convertido: "geral",
  perdido: "geral",
};

const DEFAULT_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: "1", nome: "Boas-vindas Lead", categoria: "boas_vindas",
    conteudo: "Olá {{nome}}! 👋\n\nSou {{corretor}} da SeguraCRM. Vi que você tem interesse em seguro {{ramo}}.\n\nPosso te ajudar a encontrar a melhor cobertura com o melhor preço. Quando podemos conversar?",
    variaveis: ["nome", "corretor", "ramo"], status: "aprovado",
  },
  {
    id: "2", nome: "Envio de Proposta", categoria: "proposta",
    conteudo: "Olá {{nome}}! 📋\n\nSegue a proposta do seguro {{ramo}} que conversamos:\n\n🏢 Seguradora: {{seguradora}}\n💰 Prêmio: {{valor_premio}}\n\n📎 Acesse a proposta completa: {{link_proposta}}\n\nQualquer dúvida estou à disposição!",
    variaveis: ["nome", "ramo", "seguradora", "valor_premio", "link_proposta"], status: "aprovado",
  },
  {
    id: "4", nome: "Follow-up Lead", categoria: "follow_up",
    conteudo: "Oi {{nome}}, tudo bem? 😊\n\nEntrei em contato recentemente sobre o seguro {{ramo}}. Gostaria de saber se ainda tem interesse?\n\nEstou com condições especiais essa semana. Posso enviar uma cotação?",
    variaveis: ["nome", "ramo"], status: "aprovado",
  },
];

const NEW_LEAD_SOUND_URL = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdW+Jkpd/aXBygoyQf3VqcH+Lk5J8cW1xf4qQin5ybHKAi5GLfnJscoCLkYt+cmxygIuRi35ybHKAi5CLfnJscoCKkIt+cmxygIuRi35ybA==";

const Leads = () => {
  const { isAdmin, currentUser } = useRole();
  const { addNotification } = useNotifications();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [leads, setLeads] = useState(PLACEHOLDER_LEADS);
  const [corretorFilter, setCorretorFilter] = useState<string>("all");
  const [newLeadOpen, setNewLeadOpen] = useState(false);
  const [redistribuirOpen, setRedistribuirOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Status change + template confirmation
  const [pendingChange, setPendingChange] = useState<{ leadId: string; newStatus: string; lead: Lead } | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [sendMessage, setSendMessage] = useState(true);

  // Polling leads every 10 seconds
  const { data: apiLeads } = useLeads(undefined);
  const prevLeadIdsRef = useRef<Set<string>>(new Set(leads.map(l => l.id)));
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playNewLeadSound = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(NEW_LEAD_SOUND_URL);
        audioRef.current.volume = 0.7;
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } catch {}
  }, []);

  // When API returns data, merge and detect new leads
  useEffect(() => {
    if (apiLeads?.data && apiLeads.data.length > 0) {
      const prevIds = prevLeadIdsRef.current;
      const newLeads = apiLeads.data.filter(l => !prevIds.has(l.id));

      if (newLeads.length > 0 && prevIds.size > 0) {
        // Play sound alert
        playNewLeadSound();

        // Add notifications for each new lead
        newLeads.forEach(lead => {
          addNotification({
            type: "lead",
            title: "🔔 Novo Lead!",
            message: `${lead.nome} — ${lead.ramo_interesse} (${lead.origem})`,
            leadId: lead.id,
          });
        });

        toast.success(`${newLeads.length} novo${newLeads.length > 1 ? "s" : ""} lead${newLeads.length > 1 ? "s" : ""} recebido${newLeads.length > 1 ? "s" : ""}!`, {
          description: newLeads.map(l => l.nome).join(", "),
        });
      }

      setLeads(apiLeads.data);
      prevLeadIdsRef.current = new Set(apiLeads.data.map(l => l.id));
    }
  }, [apiLeads, playNewLeadSound, addNotification]);

  const stats = PLACEHOLDER_STATS;
  const distribution = PLACEHOLDER_DISTRIBUTION;

  const getTemplateForStatus = (status: string): WhatsAppTemplate | null => {
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
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus as Lead["status"] } : l));
    if (shouldSend && selectedTemplate) {
      toast.success(`Mensagem "${selectedTemplate.nome}" enviada via WhatsApp`);
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
      .replace(/\{\{valor_premio\}\}/g, `R$ ${lead.valor_estimado.toLocaleString()}`)
      .replace(/\{\{seguradora\}\}/g, "Seguradora")
      .replace(/\{\{link_proposta\}\}/g, "https://...")
      .replace(/\{\{numero_apolice\}\}/g, "#...")
      .replace(/\{\{data_vencimento\}\}/g, "...")
  };

  const displayLeads = leads.filter(l => {
    const matchesSearch = l.nome.toLowerCase().includes(search.toLowerCase()) || l.telefone.includes(search);
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    const matchesCorretor = isAdmin
      ? corretorFilter === "all" || l.corretor_responsavel === corretorFilter
      : l.corretor_responsavel === currentUser.nome || !l.corretor_responsavel;
    return matchesSearch && matchesStatus && matchesCorretor;
  });

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
            <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90" size="sm" onClick={() => setNewLeadOpen(true)}>
              <Plus className="h-4 w-4" /> Novo Lead
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Total", value: stats.total, icon: Users, color: "text-foreground" },
            { label: "Novos", value: stats.novos, icon: Plus, color: "text-info" },
            { label: "Em Contato", value: stats.em_contato, icon: Phone, color: "text-warning" },
            { label: "Qualificados", value: stats.qualificados, icon: Target, color: "text-primary" },
            { label: "Convertidos", value: stats.convertidos, icon: UserCheck, color: "text-success" },
            { label: "Taxa Conversão", value: `${stats.taxa_conversao}%`, icon: TrendingUp, color: "text-success" },
          ].map((kpi, i) => (
            <Card key={kpi.label} className="kpi-card-shadow animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                  <kpi.icon className={`h-3.5 w-3.5 ${kpi.color}`} />
                </div>
                <p className={`mt-1 text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
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
              <Select value={corretorFilter} onValueChange={setCorretorFilter}>
                <SelectTrigger className="w-[160px] sm:w-[180px] h-9 text-sm">
                  <SelectValue placeholder="Corretor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Corretores</SelectItem>
                  {distribution.map(d => (
                    <SelectItem key={d.corretor_id} value={d.corretor_nome}>{d.corretor_nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="flex items-center gap-2">
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
            leads={displayLeads}
            columns={KANBAN_COLUMNS}
            onStatusChange={handleStatusChange}
            corretorFilter={isAdmin ? (corretorFilter !== "all" ? corretorFilter : null) : currentUser.nome}
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
                    {displayLeads.map((l, i) => (
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
                        <td className="px-4 py-3 text-right font-semibold">R$ {l.valor_estimado.toLocaleString()}</td>
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
              id: crypto.randomUUID(),
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
          onRedistribuir={({ data, horarioPartir, corretorOrigem }) => {
            // Filter leads from the given date/time and corretor, then redistribute
            const dateStr = data.toISOString().split("T")[0];
            const cutoff = new Date(`${dateStr}T${horarioPartir}:00`).getTime();
            setLeads(prev => {
              const corretorNames = distribution.map(d => d.corretor_nome);
              let idx = 0;
              return prev.map(l => {
                const leadTime = new Date(l.created_at).getTime();
                if (leadTime < cutoff) return l;
                if (corretorOrigem !== "all") {
                  const corretorNome = distribution.find(d => d.corretor_id === corretorOrigem)?.corretor_nome;
                  if (l.corretor_responsavel !== corretorNome && l.corretor_responsavel !== null) return l;
                }
                const assigned = corretorNames[idx % corretorNames.length];
                idx++;
                return { ...l, corretor_responsavel: assigned, updated_at: new Date().toISOString() };
              });
            });
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
