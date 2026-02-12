import { useState } from "react";
import { DocumentUploadSection } from "@/components/shared/DocumentUploadSection";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import {
  Phone, Mail, MessageSquare, Calendar, Clock, User,
  Target, DollarSign, FileText, ArrowRight, CheckCircle2,
  Pencil, Save, X, Send, StickyNote, Trash2
} from "lucide-react";
import type { Lead } from "@/services/leadsService";

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

const ramoOptions = [
  "Auto", "Vida", "Residencial", "Empresarial", "Saúde",
  "Viagem", "Responsabilidade Civil", "Condomínio", "Frota", "Outro",
];

interface TimelineEvent {
  date: string;
  description: string;
  icon: string;
  type: string;
}

function generateTimeline(lead: Lead, notes: NoteEntry[]): TimelineEvent[] {
  const events: TimelineEvent[] = [
    { date: lead.created_at, type: "criado", description: "Lead cadastrado no sistema", icon: "create" },
  ];

  if (lead.status !== "novo") {
    events.push({
      date: new Date(new Date(lead.created_at).getTime() + 86400000).toISOString(),
      type: "contato", description: "Primeiro contato realizado via WhatsApp", icon: "contact",
    });
  }
  if (["qualificado", "proposta_enviada", "convertido"].includes(lead.status)) {
    events.push({
      date: new Date(new Date(lead.created_at).getTime() + 172800000).toISOString(),
      type: "qualificado", description: "Lead qualificado após reunião", icon: "qualified",
    });
  }
  if (["proposta_enviada", "convertido"].includes(lead.status)) {
    events.push({
      date: new Date(new Date(lead.created_at).getTime() + 259200000).toISOString(),
      type: "proposta", description: `Proposta enviada — R$ ${lead.valor_estimado.toLocaleString()}`, icon: "proposal",
    });
  }
  if (lead.status === "convertido") {
    events.push({ date: lead.updated_at, type: "convertido", description: "Lead convertido em cliente", icon: "converted" });
  }
  if (lead.status === "perdido") {
    events.push({ date: lead.updated_at, type: "perdido", description: "Lead perdido — sem retorno", icon: "lost" });
  }

  // Add notes as timeline events
  notes.forEach(n => {
    events.push({ date: n.date, type: "nota", description: n.text, icon: "note" });
  });

  return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

const timelineIconMap: Record<string, React.ReactNode> = {
  create: <FileText className="h-3.5 w-3.5 text-info" />,
  contact: <MessageSquare className="h-3.5 w-3.5 text-warning" />,
  qualified: <Target className="h-3.5 w-3.5 text-primary" />,
  proposal: <DollarSign className="h-3.5 w-3.5 text-accent" />,
  converted: <CheckCircle2 className="h-3.5 w-3.5 text-success" />,
  lost: <ArrowRight className="h-3.5 w-3.5 text-destructive" />,
  note: <StickyNote className="h-3.5 w-3.5 text-muted-foreground" />,
};

interface NoteEntry {
  id: string;
  text: string;
  date: string;
  author: string;
}

interface LeadDetailSheetProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadUpdate?: (updatedLead: Lead) => void;
  onLeadDelete?: (leadId: string) => void;
}

export function LeadDetailSheet({ lead, open, onOpenChange, onLeadUpdate, onLeadDelete }: LeadDetailSheetProps) {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Lead>>({});
  const [notes, setNotes] = useState<NoteEntry[]>([]);
  const [newNote, setNewNote] = useState("");
  const [arquivoApolice, setArquivoApolice] = useState<File | null>(null);
  const [arquivoProposta, setArquivoProposta] = useState<File | null>(null);

  if (!lead) return null;

  const startEdit = () => {
    setEditData({
      nome: lead.nome,
      email: lead.email,
      telefone: lead.telefone,
      ramo_interesse: lead.ramo_interesse,
      valor_estimado: lead.valor_estimado,
      observacoes: lead.observacoes,
      status: lead.status,
      origem: lead.origem,
      corretor_responsavel: lead.corretor_responsavel,
    });
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditData({});
  };

  const saveEdit = () => {
    if (!editData.nome?.trim()) {
      toast({ title: "Nome é obrigatório", variant: "destructive" });
      return;
    }
    const updated: Lead = {
      ...lead,
      ...editData,
      updated_at: new Date().toISOString(),
    } as Lead;
    onLeadUpdate?.(updated);
    setEditing(false);
    setEditData({});
    toast({ title: "Lead atualizado!", description: `${updated.nome} salvo com sucesso.` });
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    const entry: NoteEntry = {
      id: crypto.randomUUID(),
      text: newNote.trim(),
      date: new Date().toISOString(),
      author: "Você",
    };
    setNotes(prev => [entry, ...prev]);
    setNewNote("");
    toast({ title: "Nota adicionada" });
  };

  const handleCall = () => {
    window.open(`tel:${lead.telefone.replace(/\D/g, "")}`, "_self");
    toast({ title: "Iniciando chamada", description: lead.telefone });
  };

  const handleWhatsApp = () => {
    const phone = lead.telefone.replace(/\D/g, "");
    const brPhone = phone.startsWith("55") ? phone : `55${phone}`;
    window.open(`https://wa.me/${brPhone}`, "_blank");
  };

  const handleEmail = () => {
    window.open(`mailto:${lead.email}?subject=Seguro - ${lead.ramo_interesse}`, "_blank");
  };

  const timeline = generateTimeline(lead, notes);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[460px] p-0">
        <SheetHeader className="px-6 pt-6 pb-4">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-full bg-accent/15 flex items-center justify-center text-sm font-bold text-accent flex-shrink-0">
              {lead.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-lg text-left flex-1">{lead.nome}</SheetTitle>
                {!editing ? (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={startEdit}>
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Lead</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir <strong>{lead.nome}</strong>? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => {
                              onLeadDelete?.(lead.id);
                              onOpenChange(false);
                              toast({ title: "Lead excluído", description: `${lead.nome} foi removido.` });
                            }}
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ) : (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={cancelEdit}>
                      <X className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={saveEdit}>
                      <Save className="h-3.5 w-3.5 text-success" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={lead.status === "novo" ? "default" : "outline"} className={`text-[10px] ${statusColors[lead.status]}`}>
                  {statusLabels[lead.status]}
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  {origemLabels[lead.origem] || lead.origem}
                </Badge>
              </div>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-160px)]">
          <div className="px-6 space-y-5 pb-6">
            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs" onClick={handleCall}>
                <Phone className="h-3.5 w-3.5" /> Ligar
              </Button>
              <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs" onClick={handleWhatsApp}>
                <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
              </Button>
              <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs" onClick={handleEmail}>
                <Mail className="h-3.5 w-3.5" /> Email
              </Button>
            </div>

            <Separator />

            {/* Lead Info - View or Edit */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Informações</h4>

              {editing ? (
                <div className="space-y-3">
                  <EditField label="Nome" value={editData.nome || ""} onChange={(v) => setEditData(p => ({ ...p, nome: v }))} />
                  <EditField label="Email" value={editData.email || ""} onChange={(v) => setEditData(p => ({ ...p, email: v }))} type="email" />
                  <EditField label="Telefone" value={editData.telefone || ""} onChange={(v) => setEditData(p => ({ ...p, telefone: v }))} />
                  <div>
                    <label className="text-[11px] text-muted-foreground">Ramo de Interesse</label>
                    <Select value={editData.ramo_interesse} onValueChange={(v) => setEditData(p => ({ ...p, ramo_interesse: v }))}>
                      <SelectTrigger className="h-8 text-sm mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ramoOptions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <EditField label="Valor Estimado (R$)" value={String(editData.valor_estimado || 0)} onChange={(v) => setEditData(p => ({ ...p, valor_estimado: Number(v) || 0 }))} type="number" />
                  <div>
                    <label className="text-[11px] text-muted-foreground">Status</label>
                    <Select value={editData.status} onValueChange={(v) => setEditData(p => ({ ...p, status: v as Lead["status"] }))}>
                      <SelectTrigger className="h-8 text-sm mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground">Origem</label>
                    <Select value={editData.origem} onValueChange={(v) => setEditData(p => ({ ...p, origem: v as Lead["origem"] }))}>
                      <SelectTrigger className="h-8 text-sm mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(origemLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <EditField label="Corretor Responsável" value={editData.corretor_responsavel || ""} onChange={(v) => setEditData(p => ({ ...p, corretor_responsavel: v || null }))} />
                  <div>
                    <label className="text-[11px] text-muted-foreground">Observações</label>
                    <Textarea
                      className="mt-1 text-sm"
                      rows={3}
                      value={editData.observacoes || ""}
                      onChange={(e) => setEditData(p => ({ ...p, observacoes: e.target.value }))}
                      placeholder="Observações sobre o lead..."
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <InfoRow icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={lead.email} />
                  <InfoRow icon={<Phone className="h-3.5 w-3.5" />} label="Telefone" value={lead.telefone} />
                  <InfoRow icon={<Target className="h-3.5 w-3.5" />} label="Ramo de Interesse" value={lead.ramo_interesse} />
                  <InfoRow icon={<DollarSign className="h-3.5 w-3.5" />} label="Valor Estimado" value={`R$ ${lead.valor_estimado.toLocaleString()}`} />
                  <InfoRow icon={<User className="h-3.5 w-3.5" />} label="Corretor" value={lead.corretor_responsavel || "Não atribuído"} muted={!lead.corretor_responsavel} />
                  <InfoRow icon={<Calendar className="h-3.5 w-3.5" />} label="Criado em" value={formatDate(lead.created_at)} />
                  <InfoRow icon={<Clock className="h-3.5 w-3.5" />} label="Última atualização" value={formatDate(lead.updated_at)} />
                </div>
              )}
            </div>

            {!editing && lead.observacoes && (
              <>
                <Separator />
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Observações</h4>
                  <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3">{lead.observacoes}</p>
                </div>
              </>
            )}

            <Separator />

            {/* Document Upload */}
            <DocumentUploadSection
              arquivoApolice={arquivoApolice}
              setArquivoApolice={setArquivoApolice}
              arquivoProposta={arquivoProposta}
              setArquivoProposta={setArquivoProposta}
            />

            <Separator />
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Adicionar Nota</h4>
              <div className="flex gap-2">
                <Textarea
                  placeholder="Escreva uma nota ou comentário..."
                  className="text-sm flex-1 min-h-[60px]"
                  rows={2}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      addNote();
                    }
                  }}
                />
              </div>
              <Button
                size="sm"
                className="mt-2 gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={addNote}
                disabled={!newNote.trim()}
              >
                <Send className="h-3 w-3" /> Enviar Nota
              </Button>
            </div>

            <Separator />

            {/* Timeline */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Histórico</h4>
              <div className="relative">
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
                <div className="space-y-4">
                  {timeline.map((event, i) => (
                    <div key={i} className="flex gap-3 relative">
                      <div className={`h-6 w-6 rounded-full bg-background border flex items-center justify-center flex-shrink-0 z-10 ${
                        event.type === "nota" ? "border-accent/50" : "border-border"
                      }`}>
                        {timelineIconMap[event.icon]}
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className={`text-sm ${event.type === "nota" ? "text-foreground bg-accent/5 rounded-md p-2 -mt-0.5" : "text-foreground"}`}>
                          {event.description}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{formatDateTime(event.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function InfoRow({ icon, label, value, muted }: { icon: React.ReactNode; label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-muted-foreground">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className={`text-sm font-medium truncate ${muted ? "text-muted-foreground italic" : "text-foreground"}`}>{value}</p>
      </div>
    </div>
  );
}

function EditField({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-[11px] text-muted-foreground">{label}</label>
      <Input className="h-8 text-sm mt-1" type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
