import { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import { useAgents } from "@/hooks/useAgents";
import { toast } from "@/hooks/use-toast";
import type { WhatsAppContact } from "@/services/whatsappService";
import { v4 as uuidv4 } from "uuid";

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

function buildEmptyLead(contact: WhatsAppContact) {
  return {
    id: contact.id,
    nome: contact.nome,
    email: "",
    telefone: contact.telefone,
    cpf: "",
    endereco: "",
    origem: "WhatsApp",
    ramo_interesse: "",
    valor_estimado: 0,
    status: "novo",
    corretor_responsavel: "",
    created_at: new Date().toISOString(),
    veiculo: "",
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
  note: MessageSquare,
  document: FileText,
  image: Image,
  message: MessageSquare,
};

const typeColors: Record<HistoryEntry["type"], string> = {
  note: "bg-accent/15 text-accent",
  document: "bg-info/15 text-info",
  image: "bg-success/15 text-success",
  message: "bg-muted text-muted-foreground",
};

export function LeadDetailsPanel({ contact, onClose }: LeadDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState("detalhes");
  const [newNote, setNewNote] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>(INITIAL_HISTORY);
  const [lead, setLead] = useState(() => buildEmptyLead(contact));
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ nome: lead.nome, telefone: lead.telefone, email: lead.email, endereco: lead.endereco, ramo_interesse: lead.ramo_interesse, valor_estimado: lead.valor_estimado, veiculo: lead.veiculo, observacoes: lead.observacoes });
  const [loading, setLoading] = useState(true);

  // Fetch lead data from API by phone number
  useEffect(() => {
    const phone = contact.telefone.replace(/\D/g, "");
    setLoading(true);
    fetch(`${BASE_URL}/v1/read/leads?leadTag=telefone&leadValue=${phone}`)
      .then(res => res.json())
      .then((data) => {
        // API may return array or paginated object
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
            origem: apiLead.origem || "WhatsApp",
            ramo_interesse: apiLead.ramo_interesse || apiLead.modelo || "",
            valor_estimado: Number(apiLead.valor_estimado) || 0,
            status: apiLead.status || "novo",
            corretor_responsavel: apiLead.corretor_responsavel || "",
            created_at: apiLead.created_at || new Date().toISOString(),
            veiculo: apiLead.modelo || apiLead.veiculo || "",
            seguradora_atual: apiLead.seguradora_atual || "",
            observacoes: apiLead.observacoes || "",
          });
        }
      })
      .catch(() => {
        // Keep empty lead on error
      })
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
          ramo_interesse: editForm.ramo_interesse,
          valor_estimado: editForm.valor_estimado,
          modelo: editForm.veiculo,
          observacoes: editForm.observacoes,
        }),
      });
      setLead(prev => ({ ...prev, ...editForm }));
      setIsEditing(false);
      toast({ title: "Lead atualizado!", description: "Informações salvas com sucesso." });
    } catch {
      toast({ title: "Erro", description: "Não foi possível atualizar o lead.", variant: "destructive" });
    }
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const entry: HistoryEntry = {
      id: uuidv4(),
      type: "note",
      title: "Nota adicionada",
      description: newNote,
      created_at: new Date().toISOString(),
      author: "Corretor",
    };
    setHistory(prev => [entry, ...prev]);
    setNewNote("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const isImage = file.type.startsWith("image/");
      const entry: HistoryEntry = {
        id: uuidv4(),
        type: isImage ? "image" : "document",
        title: isImage ? "Imagem enviada" : "Documento enviado",
        description: file.name,
        file_name: file.name,
        file_url: URL.createObjectURL(file),
        created_at: new Date().toISOString(),
        author: "Corretor",
      };
      setHistory(prev => [entry, ...prev]);
    });
    e.target.value = "";
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="w-[360px] flex-shrink-0 border-l border-border flex flex-col bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Detalhes do Lead</h3>
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
                  <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => {
                    setEditForm({ nome: lead.nome, telefone: lead.telefone, email: lead.email, endereco: lead.endereco, ramo_interesse: lead.ramo_interesse, valor_estimado: lead.valor_estimado, veiculo: lead.veiculo, observacoes: lead.observacoes });
                    setIsEditing(true);
                  }}>
                    <Pencil className="h-3 w-3" /> Editar
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Informações Pessoais</h4>
                {isEditing ? (
                  <div className="space-y-2">
                    <EditField label="Nome" value={editForm.nome} onChange={v => setEditForm(p => ({ ...p, nome: v }))} />
                    <EditField label="Email" value={editForm.email} onChange={v => setEditForm(p => ({ ...p, email: v }))} />
                    <EditField label="Telefone" value={editForm.telefone} onChange={v => setEditForm(p => ({ ...p, telefone: v }))} />
                    <EditField label="Endereço" value={editForm.endereco} onChange={v => setEditForm(p => ({ ...p, endereco: v }))} />
                  </div>
                ) : (
                  <>
                    <InfoRow icon={User} label="Nome" value={lead.nome} />
                    <InfoRow icon={Mail} label="Email" value={lead.email} />
                    <InfoRow icon={Phone} label="Telefone" value={lead.telefone} />
                    <InfoRow icon={MapPin} label="Endereço" value={lead.endereco} />
                  </>
                )}
              </div>

              <div className="border-t border-border pt-3 space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dados do Seguro</h4>
                {isEditing ? (
                  <div className="space-y-2">
                    <EditField label="Ramo" value={editForm.ramo_interesse} onChange={v => setEditForm(p => ({ ...p, ramo_interesse: v }))} />
                    <EditField label="Valor Estimado" value={String(editForm.valor_estimado)} onChange={v => setEditForm(p => ({ ...p, valor_estimado: Number(v) || 0 }))} type="number" />
                    <EditField label="Veículo" value={editForm.veiculo} onChange={v => setEditForm(p => ({ ...p, veiculo: v }))} />
                  </div>
                ) : (
                  <>
                    <InfoRow icon={Target} label="Ramo" value={lead.ramo_interesse} />
                    <InfoRow icon={DollarSign} label="Valor Estimado" value={`R$ ${lead.valor_estimado.toLocaleString()}`} />
                    <InfoRow icon={Building} label="Seguradora Atual" value={lead.seguradora_atual} />
                    {lead.veiculo && <InfoRow icon={Target} label="Veículo" value={lead.veiculo} />}
                  </>
                )}
              </div>

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
          {/* Add note / upload */}
          <div className="px-4 py-3 border-b border-border space-y-2">
            <div className="flex gap-2">
              <Textarea
                placeholder="Adicionar nota..."
                className="text-xs min-h-[60px] resize-none"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="text-xs gap-1 bg-accent text-accent-foreground hover:bg-accent/90 flex-1" onClick={handleAddNote} disabled={!newNote.trim()}>
                <Plus className="h-3 w-3" /> Nota
              </Button>
              <label className="flex-1">
                <input type="file" className="hidden" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" onChange={handleFileUpload} />
                <Button size="sm" variant="outline" className="text-xs gap-1 w-full" asChild>
                  <span><Upload className="h-3 w-3" /> Arquivo</span>
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
