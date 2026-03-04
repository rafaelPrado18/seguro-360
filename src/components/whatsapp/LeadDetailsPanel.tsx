import { useState, useEffect, useMemo } from "react";
import { useLeadHistory } from "@/hooks/useLeads";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  X, User, Mail, Phone, MapPin, Target, DollarSign,
  FileText, Image, MessageSquare, Upload, Plus, Clock,
  Calendar, Tag, Building, Download, Pencil, Check, Loader2, ArrowRightLeft,
  Car, ChevronDown, ChevronUp, Trash2,
} from "lucide-react";
import { useAgents } from "@/hooks/useAgents";
import { toast } from "@/hooks/use-toast";
import type { WhatsAppContact } from "@/services/whatsappService";
import { v4 as uuidv4 } from "uuid";
import { leadsService } from "@/services/leadsService";

// --- Types ---

interface VeiculoProposta {
  id: string;
  veiculo: string;
  numero_proposta: string;
  numero_apolice: string;
  codigo_ci: string;
  premio: number;
  premio_liquido: number;
  numero_parcelas: number;
  valor_parcelas: number;
}

interface HistoryEntry {
  id: string;
  type: "note" | "document" | "image" | "message";
  title: string;
  description?: string;
  file_url?: string;
  file_name?: string;
  created_at: string;
  author: string;
}

const BASE_URL = "https://crm-hataseg.com.br";

function buildEmptyVeiculo(): VeiculoProposta {
  return { id: uuidv4(), veiculo: "", numero_proposta: "", numero_apolice: "", codigo_ci: "", premio: 0, premio_liquido: 0, numero_parcelas: 0, valor_parcelas: 0 };
}

function buildEmptyLead(contact: WhatsAppContact) {
  return {
    id: contact.id,
    nome: contact.nome,
    email: "",
    telefone: contact.telefone,
    cpf: "",
    endereco: "",
    cep: "",
    origem: "WhatsApp",
    status: "novo",
    corretor_responsavel: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    seguradora_atual: "",
    observacoes: "",
  };
}

const INITIAL_HISTORY: HistoryEntry[] = [];

interface LeadDetailsPanelProps {
  contact: WhatsAppContact;
  onClose: () => void;
}

const typeIcons: Record<HistoryEntry["type"], typeof FileText> = {
  note: MessageSquare, document: FileText, image: Image, message: MessageSquare,
};
const typeColors: Record<HistoryEntry["type"], string> = {
  note: "bg-accent/15 text-accent", document: "bg-info/15 text-info", image: "bg-success/15 text-success", message: "bg-muted text-muted-foreground",
};

export function LeadDetailsPanel({ contact, onClose }: LeadDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState("detalhes");
  const [newNote, setNewNote] = useState("");
  const [localHistory, setLocalHistory] = useState<HistoryEntry[]>(INITIAL_HISTORY);
  const [lead, setLead] = useState(() => buildEmptyLead(contact));
  const [veiculos, setVeiculos] = useState<VeiculoProposta[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ nome: lead.nome, telefone: lead.telefone, email: lead.email, cpf: lead.cpf, endereco: lead.endereco, cep: lead.cep, observacoes: lead.observacoes });
  const [editVeiculos, setEditVeiculos] = useState<VeiculoProposta[]>([]);
  const [expandedVeiculo, setExpandedVeiculo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { data: apiHistory = [] } = useLeadHistory(lead.email || undefined);

  // Merge local + API history
  const history = useMemo(() => {
    const apiEntries: HistoryEntry[] = apiHistory.map((entry) => ({
      id: entry._id,
      type: "message" as const,
      title: "Mensagem",
      description: entry.textContent,
      created_at: entry.timestamp,
      author: entry.consultantEmail,
    }));
    return [...localHistory, ...apiEntries].sort((a, b) => {
      const parseDate = (d: string) => {
        const match = d.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/);
        if (match) return new Date(+match[3], +match[2] - 1, +match[1], +match[4], +match[5], +match[6]).getTime();
        return new Date(d).getTime();
      };
      return parseDate(b.created_at) - parseDate(a.created_at);
    });
  }, [localHistory, apiHistory]);

  useEffect(() => {
    const phone = contact.telefone.replace(/\D/g, "");
    setLoading(true);
    fetch(`${BASE_URL}/v1/read/leads?leadTag=telefone&leadValue=${phone}`)
      .then(res => res.json())
      .then((data) => {
        const leads = Array.isArray(data) ? data : data?.data || [];
        if (leads.length > 0) {
          const apiLead = leads[0];
          setLead({
            id: apiLead.id || contact.id,
            nome: apiLead.nome || contact.nome,
            email: apiLead.email || "",
            telefone: apiLead.telefone || contact.telefone,
            cpf: apiLead.cpf || "",
            endereco: apiLead.endereco || "",
            cep: apiLead.cep || "",
            origem: apiLead.origem || "WhatsApp",
            status: apiLead.status || "novo",
            corretor_responsavel: apiLead.corretor_responsavel || "",
            created_at: apiLead.created_at || new Date().toISOString(),
            updated_at: apiLead.updated_at || apiLead.created_at || new Date().toISOString(),
            seguradora_atual: apiLead.seguradora_atual || "",
            observacoes: apiLead.observacoes || "",
          });

          // Parse veiculos from API (array) or build one from flat fields
          if (Array.isArray(apiLead.veiculos) && apiLead.veiculos.length > 0) {
            setVeiculos(apiLead.veiculos.map((v: any) => ({
              id: v.id || uuidv4(),
              veiculo: v.veiculo || v.modelo || "",
              numero_proposta: v.numero_proposta || "",
              numero_apolice: v.numero_apolice || "",
              codigo_ci: v.codigo_ci || "",
              premio: Number(v.premio) || 0,
              premio_liquido: Number(v.premio_liquido) || 0,
              numero_parcelas: Number(v.numero_parcelas) || 0,
              valor_parcelas: Number(v.valor_parcelas) || 0,
            })));
          } else if (apiLead.modelo || apiLead.veiculo || apiLead.numero_proposta) {
            setVeiculos([{
              id: uuidv4(),
              veiculo: apiLead.modelo || apiLead.veiculo || "",
              numero_proposta: apiLead.numero_proposta || "",
              numero_apolice: apiLead.numero_apolice || "",
              codigo_ci: apiLead.codigo_ci || "",
              premio: Number(apiLead.premio) || 0,
              premio_liquido: Number(apiLead.premio_liquido) || 0,
              numero_parcelas: Number(apiLead.numero_parcelas) || 0,
              valor_parcelas: Number(apiLead.valor_parcelas) || 0,
            }]);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [contact.id, contact.telefone]);

  const handleSaveEdit = async () => {
    try {
      await fetch(`${BASE_URL}/v1/update/lead`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: lead.id,
          nome: editForm.nome,
          email: editForm.email,
          telefone: editForm.telefone,
          endereco: editForm.endereco,
          cpf: editForm.cpf,
          cep: editForm.cep,
          observacoes: editForm.observacoes,
          veiculos: editVeiculos,
        }),
      });
      setLead(prev => ({ ...prev, ...editForm }));
      setVeiculos(editVeiculos);
      setIsEditing(false);
      toast({ title: "Dados atualizados!", description: "Informações salvas com sucesso." });
    } catch {
      toast({ title: "Erro", description: "Não foi possível atualizar.", variant: "destructive" });
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? decodeURIComponent(match[2]) : "";
    };
    const consultantEmail = getCookie("userEmail") || "sistema";
    try {
      await leadsService.createLeadHistory({
        leadEmail: lead.email,
        historyType: "note",
        textContent: newNote.trim(),
        consultantEmail,
      });
      setNewNote("");
      toast({ title: "Nota adicionada" });
    } catch {
      toast({ title: "Erro ao adicionar nota", variant: "destructive" });
    }
  };

  const [uploading, setUploading] = useState(false);
  const [uploadFileType, setUploadFileType] = useState<"image" | "proposta" | "apolice" | "pdf">("pdf");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? decodeURIComponent(match[2]) : "";
    };
    const profile = getCookie("userEmail") || "sistema";
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await leadsService.uploadLeadFile(file, uploadFileType, profile, lead.id);
      }
      toast({ title: "Arquivo(s) enviado(s)!", description: `${files.length} arquivo(s) enviado(s) com sucesso.` });
    } catch {
      toast({ title: "Erro ao enviar arquivo", variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const startEditing = () => {
    setEditForm({ nome: lead.nome, telefone: lead.telefone, email: lead.email, cpf: lead.cpf, endereco: lead.endereco, cep: lead.cep, observacoes: lead.observacoes });
    setEditVeiculos(veiculos.map(v => ({ ...v })));
    setIsEditing(true);
  };

  const updateEditVeiculo = (id: string, field: keyof VeiculoProposta, value: string | number) => {
    setEditVeiculos(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const addEditVeiculo = () => {
    const nv = buildEmptyVeiculo();
    setEditVeiculos(prev => [...prev, nv]);
    setExpandedVeiculo(nv.id);
  };

  const removeEditVeiculo = (id: string) => {
    setEditVeiculos(prev => prev.filter(v => v.id !== id));
  };

  return (
    <div className="w-[360px] flex-shrink-0 border-l border-border flex flex-col bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">{contact.cliente_id ? "Detalhes do Cliente" : "Detalhes do Lead"}</h3>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Contact Summary */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-accent/15 flex items-center justify-center text-sm font-bold text-accent">
            {contact.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">{contact.nome}</p>
            <p className="text-xs text-muted-foreground">{contact.telefone}</p>
            <div className="flex gap-1 mt-1">
              {contact.tags.map(t => (
                <Badge key={t} variant="secondary" className="text-[9px] px-1.5 py-0">{t}</Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-2 grid grid-cols-2">
          <TabsTrigger value="detalhes" className="text-xs">Detalhes</TabsTrigger>
          <TabsTrigger value="historico" className="text-xs">Histórico</TabsTrigger>
        </TabsList>

        {/* Detalhes Tab */}
        <TabsContent value="detalhes" className="flex-1 mt-0">
          <ScrollArea className="h-[calc(100vh-22rem)]">
            <div className="px-4 py-3 space-y-4">
              <div className="flex justify-end">
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => setIsEditing(false)}>Cancelar</Button>
                    <Button size="sm" className="text-xs gap-1 bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleSaveEdit}>
                      <Check className="h-3 w-3" /> Salvar
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" className="text-xs gap-1" onClick={startEditing}>
                    <Pencil className="h-3 w-3" /> Editar
                  </Button>
                )}
              </div>

              {/* Informações Pessoais / Lead */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {contact.cliente_id ? "Informações Pessoais" : "Informações do Lead"}
                </h4>
                {isEditing ? (
                  <div className="space-y-2">
                    <EditField label="Nome" value={editForm.nome} onChange={v => setEditForm(p => ({ ...p, nome: v }))} />
                    {contact.cliente_id ? (
                      <>
                        <EditField label="CPF" value={editForm.cpf} onChange={v => setEditForm(p => ({ ...p, cpf: v }))} />
                        <EditField label="Telefone" value={editForm.telefone} onChange={v => setEditForm(p => ({ ...p, telefone: v }))} />
                        <EditField label="Endereço" value={editForm.endereco} onChange={v => setEditForm(p => ({ ...p, endereco: v }))} />
                        <EditField label="CEP" value={editForm.cep} onChange={v => setEditForm(p => ({ ...p, cep: v }))} />
                      </>
                    ) : (
                      <>
                        <EditField label="Email" value={editForm.email} onChange={v => setEditForm(p => ({ ...p, email: v }))} />
                        <EditField label="Telefone" value={editForm.telefone} onChange={v => setEditForm(p => ({ ...p, telefone: v }))} />
                        <EditField label="Observações" value={editForm.observacoes} onChange={v => setEditForm(p => ({ ...p, observacoes: v }))} />
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    {contact.cliente_id ? (
                      <>
                        <InfoRow icon={User} label="Nome" value={lead.nome} />
                        <InfoRow icon={FileText} label="CPF" value={lead.cpf} />
                        <InfoRow icon={Phone} label="Telefone" value={lead.telefone} />
                        <InfoRow icon={MapPin} label="Endereço" value={lead.endereco} />
                        <InfoRow icon={MapPin} label="CEP" value={lead.cep} />
                      </>
                    ) : (
                      <>
                        <InfoRow icon={User} label="Nome" value={lead.nome} />
                        <InfoRow icon={Mail} label="Email" value={lead.email || "Não informado"} />
                        <InfoRow icon={Phone} label="Telefone" value={lead.telefone} />
                        <InfoRow icon={Tag} label="Status" value={lead.status === "novo" ? "Novo" : lead.status} />
                        <InfoRow icon={User} label="Corretor" value={lead.corretor_responsavel || "Não atribuído"} />
                        <InfoRow icon={Calendar} label="Criado em" value={lead.created_at} />
                        <InfoRow icon={Clock} label="Atualizado em" value={lead.updated_at || lead.created_at} />
                        {lead.observacoes && <InfoRow icon={FileText} label="Observações" value={lead.observacoes} />}
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Veículos / Propostas - Apenas para clientes */}
              {contact.cliente_id && (
              <div className="border-t border-border pt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Veículos / Propostas</h4>
                  {isEditing && (
                    <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1" onClick={addEditVeiculo}>
                      <Plus className="h-3 w-3" /> Adicionar
                    </Button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-2">
                    {editVeiculos.length === 0 && (
                      <p className="text-[11px] text-muted-foreground italic">Nenhum veículo cadastrado. Clique em "Adicionar".</p>
                    )}
                    {editVeiculos.map((v, idx) => (
                      <div key={v.id} className="border border-border rounded-md p-2 space-y-2 bg-muted/30">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-foreground flex items-center gap-1"><Car className="h-3 w-3" /> Veículo {idx + 1}</span>
                          <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive hover:text-destructive" onClick={() => removeEditVeiculo(v.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <EditField label="Veículo" value={v.veiculo} onChange={val => updateEditVeiculo(v.id, "veiculo", val)} />
                        <EditField label="Nº da Proposta" value={v.numero_proposta} onChange={val => updateEditVeiculo(v.id, "numero_proposta", val)} />
                        <EditField label="Nº da Apólice" value={v.numero_apolice} onChange={val => updateEditVeiculo(v.id, "numero_apolice", val)} />
                        <EditField label="Código C.I" value={v.codigo_ci} onChange={val => updateEditVeiculo(v.id, "codigo_ci", val)} />
                        <EditField label="Prêmio" value={String(v.premio)} onChange={val => updateEditVeiculo(v.id, "premio", Number(val) || 0)} type="number" />
                        <EditField label="Prêmio Líquido" value={String(v.premio_liquido)} onChange={val => updateEditVeiculo(v.id, "premio_liquido", Number(val) || 0)} type="number" />
                        <EditField label="Nº de Parcelas" value={String(v.numero_parcelas)} onChange={val => updateEditVeiculo(v.id, "numero_parcelas", Number(val) || 0)} type="number" />
                        <EditField label="Valor das Parcelas" value={String(v.valor_parcelas)} onChange={val => updateEditVeiculo(v.id, "valor_parcelas", Number(val) || 0)} type="number" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {veiculos.length === 0 && (
                      <p className="text-[11px] text-muted-foreground italic">Nenhum veículo/proposta cadastrado.</p>
                    )}
                    {veiculos.map((v, idx) => {
                      const isOpen = expandedVeiculo === v.id;
                      return (
                        <button
                          key={v.id}
                          className="w-full text-left border border-border rounded-md p-2.5 bg-muted/20 hover:bg-muted/40 transition-colors"
                          onClick={() => setExpandedVeiculo(isOpen ? null : v.id)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                              <Car className="h-3.5 w-3.5 text-accent" />
                              {v.veiculo || `Veículo ${idx + 1}`}
                            </span>
                            {isOpen ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
                          </div>
                          {v.numero_proposta && (
                            <span className="text-[10px] text-muted-foreground">Proposta: {v.numero_proposta}</span>
                          )}
                          {isOpen && (
                            <div className="mt-2 pt-2 border-t border-border space-y-1.5" onClick={e => e.stopPropagation()}>
                              <InfoRow icon={FileText} label="Nº da Proposta" value={v.numero_proposta} />
                              <InfoRow icon={FileText} label="Nº da Apólice" value={v.numero_apolice} />
                              <InfoRow icon={Tag} label="Código C.I" value={v.codigo_ci} />
                              <InfoRow icon={DollarSign} label="Prêmio" value={`R$ ${v.premio.toLocaleString()}`} />
                              <InfoRow icon={DollarSign} label="Prêmio Líquido" value={`R$ ${v.premio_liquido.toLocaleString()}`} />
                              <InfoRow icon={FileText} label="Nº de Parcelas" value={String(v.numero_parcelas)} />
                              <InfoRow icon={DollarSign} label="Valor das Parcelas" value={`R$ ${v.valor_parcelas.toLocaleString()}`} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              )}

              {/* Status */}
              <div className="border-t border-border pt-3 space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</h4>
                <InfoRow icon={Tag} label="Origem" value={lead.origem} />
                <InfoRow icon={User} label="Corretor" value={lead.corretor_responsavel} />
                <InfoRow icon={Calendar} label="Criado em" value={lead.created_at} />
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs border-info text-info">{lead.status === "novo" ? "Novo" : lead.status}</Badge>
                </div>
              </div>

              <TransferSection leadId={lead.id} currentCorretor={lead.corretor_responsavel} onTransferred={(nome) => { setLead(prev => ({ ...prev, corretor_responsavel: nome })); onClose(); }} />

              {(isEditing || lead.observacoes) && (
                <div className="border-t border-border pt-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Observações</h4>
                  {isEditing ? (
                    <Textarea className="text-xs min-h-[60px] resize-none" value={editForm.observacoes} onChange={e => setEditForm(p => ({ ...p, observacoes: e.target.value }))} />
                  ) : (
                    <p className="text-xs text-muted-foreground leading-relaxed">{lead.observacoes}</p>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Histórico Tab */}
        <TabsContent value="historico" className="flex-1 mt-0 flex flex-col">
          <div className="px-4 py-3 border-b border-border space-y-2">
            <div className="flex gap-2">
              <Textarea placeholder="Adicionar nota..." className="text-xs min-h-[60px] resize-none" value={newNote} onChange={(e) => setNewNote(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="text-xs gap-1 bg-accent text-accent-foreground hover:bg-accent/90 flex-1" onClick={handleAddNote} disabled={!newNote.trim()}>
                <Plus className="h-3 w-3" /> Nota
              </Button>
              <Select value={uploadFileType} onValueChange={(v) => setUploadFileType(v as typeof uploadFileType)}>
                <SelectTrigger className="h-8 text-xs w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Imagem</SelectItem>
                  <SelectItem value="proposta">Proposta</SelectItem>
                  <SelectItem value="apolice">Apólice</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
              <label className="flex-1">
                <input type="file" className="hidden" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" onChange={handleFileUpload} disabled={uploading} />
                <Button size="sm" variant="outline" className="text-xs gap-1 w-full" asChild disabled={uploading}>
                  <span>{uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />} {uploading ? "Enviando..." : "Arquivo"}</span>
                </Button>
              </label>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="px-4 py-3">
              <div className="relative">
                <div className="absolute left-[15px] top-0 bottom-0 w-px bg-border" />
                <div className="space-y-4">
                  {history.map((entry) => {
                    const Icon = typeIcons[entry.type];
                    return (
                      <div key={entry.id} className="relative pl-9">
                        <div className={`absolute left-[7px] top-1 h-[18px] w-[18px] rounded-full flex items-center justify-center ${typeColors[entry.type]}`}>
                          <Icon className="h-2.5 w-2.5" />
                        </div>
                        <div>
                          <div className="flex items-baseline justify-between">
                            <p className="text-xs font-medium text-foreground">{entry.title}</p>
                            <span className="text-[9px] text-muted-foreground ml-2 shrink-0">{formatDate(entry.created_at).split(",")[0]}</span>
                          </div>
                          {entry.description && (
                            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{entry.description}</p>
                          )}
                          {entry.file_name && (
                            <button className="mt-1 flex items-center gap-1.5 text-[10px] text-info hover:underline">
                              <Download className="h-3 w-3" />
                              {entry.file_name}
                            </button>
                          )}
                          <p className="text-[9px] text-muted-foreground mt-1">{entry.author}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-xs font-medium text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

function EditField({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
      <Input className="h-7 text-xs" type={type} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function TransferSection({ leadId, currentCorretor, onTransferred }: { leadId: string; currentCorretor: string; onTransferred: (nome: string) => void }) {
  const { data: agents } = useAgents();
  const [transferring, setTransferring] = useState(false);

  const corretores = useMemo(() => {
    if (!agents) return [];
    return agents.filter(a => a.isActive && a.name !== currentCorretor);
  }, [agents, currentCorretor]);

  const handleTransfer = async (nome: string) => {
    setTransferring(true);
    try {
      const res = await fetch(`${BASE_URL}/v1/update/assignedConsultant/conversation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, corretor_responsavel: nome }),
      });
      if (!res.ok) throw new Error();
      onTransferred(nome);
      toast({ title: "Lead transferido!", description: `Transferido para ${nome}` });
    } catch {
      toast({ title: "Erro", description: "Falha ao transferir lead.", variant: "destructive" });
    } finally {
      setTransferring(false);
    }
  };

  return (
    <div className="border-t border-border pt-3 space-y-2">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <ArrowRightLeft className="h-3 w-3" /> Transferir Lead
      </h4>
      <Select onValueChange={handleTransfer} disabled={transferring}>
        <SelectTrigger className="h-8 text-xs">
          <SelectValue placeholder={transferring ? "Transferindo..." : "Selecione o corretor"} />
        </SelectTrigger>
        <SelectContent>
          {corretores.map(a => (
            <SelectItem key={a.agentId} value={a.name} className="text-xs">
              {a.name} — {a.function}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}