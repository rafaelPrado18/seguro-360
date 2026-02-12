import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  X, User, Mail, Phone, MapPin, Target, DollarSign,
  FileText, Image, MessageSquare, Upload, Plus, Clock,
  Calendar, Tag, Building, Download,
} from "lucide-react";
import type { WhatsAppContact } from "@/services/whatsappService";

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

const PLACEHOLDER_LEAD_DATA = {
  id: "1",
  nome: "Ricardo Pereira",
  email: "ricardo@email.com",
  telefone: "(11) 99900-1234",
  cpf: "123.456.789-00",
  endereco: "Rua das Flores, 123 - São Paulo/SP",
  origem: "WhatsApp",
  ramo_interesse: "Auto",
  valor_estimado: 3500,
  status: "novo",
  corretor_responsavel: "André Oliveira",
  created_at: "2026-02-12T10:00:00Z",
  veiculo: "Honda Civic EXL 2025",
  seguradora_atual: "Nenhuma",
  observacoes: "Cliente interessado em seguro auto com cobertura completa. Perfil jovem, garagem em casa e trabalho.",
};

const PLACEHOLDER_HISTORY: HistoryEntry[] = [
  { id: "h1", type: "message", title: "Primeiro contato via WhatsApp", description: "Lead entrou em contato solicitando cotação de seguro auto", created_at: "2026-02-12T14:00:00Z", author: "Sistema" },
  { id: "h2", type: "document", title: "CNH enviada", description: "Documento de habilitação do cliente", file_name: "CNH_Ricardo.pdf", file_url: "#", created_at: "2026-02-12T14:25:00Z", author: "Ricardo Pereira" },
  { id: "h3", type: "image", title: "Foto do veículo", description: "Honda Civic EXL 2025 - Frente", file_name: "civic_frente.jpg", file_url: "#", created_at: "2026-02-12T14:26:00Z", author: "Ricardo Pereira" },
  { id: "h4", type: "note", title: "Nota do corretor", description: "Cliente com bom perfil. Preparar cotações Porto Seguro, Tokio Marine e HDI. Prioridade alta.", created_at: "2026-02-12T14:30:00Z", author: "André Oliveira" },
  { id: "h5", type: "document", title: "Proposta Porto Seguro", description: "Cotação seguro auto - R$ 3.200/ano", file_name: "proposta_porto.pdf", file_url: "#", created_at: "2026-02-12T15:00:00Z", author: "André Oliveira" },
];

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
  const [history, setHistory] = useState(PLACEHOLDER_HISTORY);
  const lead = PLACEHOLDER_LEAD_DATA;

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
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
        id: crypto.randomUUID(),
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
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Informações Pessoais</h4>
                <InfoRow icon={User} label="Nome" value={lead.nome} />
                <InfoRow icon={Mail} label="Email" value={lead.email} />
                <InfoRow icon={Phone} label="Telefone" value={lead.telefone} />
                <InfoRow icon={MapPin} label="Endereço" value={lead.endereco} />
              </div>

              <div className="border-t border-border pt-3 space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dados do Seguro</h4>
                <InfoRow icon={Target} label="Ramo" value={lead.ramo_interesse} />
                <InfoRow icon={DollarSign} label="Valor Estimado" value={`R$ ${lead.valor_estimado.toLocaleString()}`} />
                <InfoRow icon={Building} label="Seguradora Atual" value={lead.seguradora_atual} />
                {lead.veiculo && <InfoRow icon={Target} label="Veículo" value={lead.veiculo} />}
              </div>

              <div className="border-t border-border pt-3 space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</h4>
                <InfoRow icon={Tag} label="Origem" value={lead.origem} />
                <InfoRow icon={User} label="Corretor" value={lead.corretor_responsavel} />
                <InfoRow icon={Calendar} label="Criado em" value={formatDate(lead.created_at)} />
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs border-info text-info">{lead.status === "novo" ? "Novo" : lead.status}</Badge>
                </div>
              </div>

              {lead.observacoes && (
                <div className="border-t border-border pt-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Observações</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{lead.observacoes}</p>
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
