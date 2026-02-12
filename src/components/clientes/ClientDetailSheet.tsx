import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentUploadSection } from "@/components/shared/DocumentUploadSection";
import {
  Car, FileText, Clock, MessageSquare, Target, DollarSign,
  CheckCircle2, ArrowRight, StickyNote, Download, Phone, Mail,
  Calendar, User,
} from "lucide-react";

interface ClientVehicle {
  modelo: string;
  ano: string;
  placa: string;
  apolice?: string;
  proposta?: string;
}

interface ClientData {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  tipo: string;
  apolices: number;
  status: string;
  premio: string;
  veiculos: ClientVehicle[];
  endereco?: string;
  cep?: string;
  premioLiquido?: string;
  numeroParcelas?: number;
  valorParcela?: string;
  numeroProposta?: string;
  numeroApolice?: string;
  codigoCi?: string;
  vigencia?: string;
  comissao?: string;
}

interface ClientDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: ClientData | null;
}

// Mock documents for the client
function getClientDocuments(clientId: number) {
  const docs = [
    { id: "d1", nome: "Apólice_Auto_4521.pdf", tipo: "apolice", tamanho: "245 KB", data: "2026-01-15", ramo: "Auto" },
    { id: "d2", nome: "Proposta_Auto_P1001.pdf", tipo: "proposta", tamanho: "180 KB", data: "2026-01-10", ramo: "Auto" },
    { id: "d3", nome: "CNH_Frente.jpg", tipo: "documento", tamanho: "1.2 MB", data: "2025-12-20", ramo: "" },
    { id: "d4", nome: "Comprovante_Residencia.pdf", tipo: "documento", tamanho: "320 KB", data: "2025-12-20", ramo: "" },
  ];
  if (clientId <= 3) return docs;
  return docs.slice(0, 2);
}

// Mock lead history timeline
function getLeadHistory(clientId: number) {
  const baseDate = new Date("2025-10-05");
  return [
    { date: new Date(baseDate.getTime()).toISOString(), type: "lead_criado", description: "Lead cadastrado via WhatsApp", icon: "create" },
    { date: new Date(baseDate.getTime() + 86400000).toISOString(), type: "contato", description: "Primeiro contato realizado — interesse em seguro Auto", icon: "contact" },
    { date: new Date(baseDate.getTime() + 86400000 * 3).toISOString(), type: "nota", description: "Cliente possui 2 veículos, quer cotar ambos", icon: "note" },
    { date: new Date(baseDate.getTime() + 86400000 * 5).toISOString(), type: "qualificado", description: "Lead qualificado após envio de documentos", icon: "qualified" },
    { date: new Date(baseDate.getTime() + 86400000 * 7).toISOString(), type: "proposta", description: "Proposta enviada — Porto Seguro R$ 4.200", icon: "proposal" },
    { date: new Date(baseDate.getTime() + 86400000 * 8).toISOString(), type: "nota", description: "Cliente pediu desconto, negociação em andamento", icon: "note" },
    { date: new Date(baseDate.getTime() + 86400000 * 10).toISOString(), type: "proposta", description: "Nova proposta com desconto — R$ 3.800", icon: "proposal" },
    { date: new Date(baseDate.getTime() + 86400000 * 12).toISOString(), type: "convertido", description: "Lead convertido em cliente — apólice emitida", icon: "converted" },
    { date: new Date(baseDate.getTime() + 86400000 * 60).toISOString(), type: "renovacao", description: "Início do processo de renovação", icon: "renewal" },
    { date: new Date(baseDate.getTime() + 86400000 * 90).toISOString(), type: "nota", description: "Cliente adicionou novo veículo HR-V 2024", icon: "note" },
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

const timelineIcons: Record<string, React.ReactNode> = {
  create: <Target className="h-3.5 w-3.5 text-info" />,
  contact: <MessageSquare className="h-3.5 w-3.5 text-warning" />,
  qualified: <CheckCircle2 className="h-3.5 w-3.5 text-primary" />,
  proposal: <DollarSign className="h-3.5 w-3.5 text-accent" />,
  converted: <ArrowRight className="h-3.5 w-3.5 text-success" />,
  note: <StickyNote className="h-3.5 w-3.5 text-muted-foreground" />,
  renewal: <Clock className="h-3.5 w-3.5 text-warning" />,
};

const timelineLabels: Record<string, string> = {
  lead_criado: "Lead Criado",
  contato: "Contato",
  qualificado: "Qualificado",
  proposta: "Proposta",
  convertido: "Convertido",
  nota: "Nota",
  renovacao: "Renovação",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

const docTypeColors: Record<string, string> = {
  apolice: "border-primary text-primary",
  proposta: "border-accent text-accent",
  documento: "border-muted-foreground text-muted-foreground",
};

export function ClientDetailSheet({ open, onOpenChange, client }: ClientDetailSheetProps) {
  const [arquivoApolice, setArquivoApolice] = useState<File | null>(null);
  const [arquivoProposta, setArquivoProposta] = useState<File | null>(null);

  if (!client) return null;

  const documents = getClientDocuments(client.id);
  const history = getLeadHistory(client.id);

  const fields = [
    { label: "CPF/CNPJ", value: client.cpf },
    { label: "Email", value: client.email, icon: <Mail className="h-3.5 w-3.5" /> },
    { label: "Telefone", value: client.telefone, icon: <Phone className="h-3.5 w-3.5" /> },
    { label: "Endereço", value: client.endereco || "—" },
    { label: "CEP", value: client.cep || "—" },
    { label: "Prêmio", value: client.premio },
    { label: "Prêmio Líquido", value: client.premioLiquido || "—" },
    { label: "Nº Parcelas", value: client.numeroParcelas?.toString() || "—" },
    { label: "Valor Parcela", value: client.valorParcela || "—" },
    { label: "Nº Proposta", value: client.numeroProposta || "—" },
    { label: "Nº Apólice", value: client.numeroApolice || "—" },
    { label: "Código C.I", value: client.codigoCi || "—" },
    { label: "Vigência", value: client.vigencia || "—" },
    { label: "Comissão", value: client.comissao || "—" },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[520px] p-0">
        <SheetHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
              {client.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <SheetTitle className="text-lg">{client.nome}</SheetTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={client.tipo === "PJ" ? "default" : "secondary"} className="text-[10px]">{client.tipo}</Badge>
                <Badge variant="outline" className={`text-[10px] ${
                  client.status === "Ativo" ? "border-success text-success" :
                  client.status === "Inativo" ? "border-destructive text-destructive" :
                  "border-info text-info"
                }`}>{client.status}</Badge>
              </div>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="dados" className="flex-1">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dados" className="text-xs gap-1">
                <User className="h-3 w-3" /> Dados
              </TabsTrigger>
              <TabsTrigger value="veiculos" className="text-xs gap-1">
                <Car className="h-3 w-3" /> Veículos
              </TabsTrigger>
              <TabsTrigger value="documentos" className="text-xs gap-1">
                <FileText className="h-3 w-3" /> Docs
              </TabsTrigger>
              <TabsTrigger value="historico" className="text-xs gap-1">
                <Clock className="h-3 w-3" /> Histórico
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[calc(100vh-200px)]">
            {/* Dados */}
            <TabsContent value="dados" className="px-6 pb-6 mt-4">
              <div className="space-y-2 text-sm">
                {fields.map((f) => (
                  <div key={f.label} className="flex justify-between py-1.5 border-b border-border/50 last:border-0">
                    <span className="text-muted-foreground text-xs">{f.label}</span>
                    <span className="font-medium text-right max-w-[60%] text-xs">{f.value}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Veículos */}
            <TabsContent value="veiculos" className="px-6 pb-6 mt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Veículos ({client.veiculos.length})
                </h4>
              </div>
              {client.veiculos.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum veículo cadastrado.</p>
              ) : (
                <div className="space-y-3">
                  {client.veiculos.map((v, i) => (
                    <div key={i} className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{v.modelo}</p>
                          <p className="text-xs text-muted-foreground">Ano: {v.ano}</p>
                        </div>
                        <Badge variant="outline" className="font-mono text-xs">{v.placa}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-border">
                        <div>
                          <span className="text-muted-foreground">Apólice: </span>
                          <span className="font-medium">{v.apolice || "—"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Proposta: </span>
                          <span className="font-medium">{v.proposta || "—"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Documentos */}
            <TabsContent value="documentos" className="px-6 pb-6 mt-4 space-y-5">
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Documentos Anexados ({documents.length})
                </h4>
                <div className="space-y-2">
                  {documents.map(doc => (
                    <div key={doc.id} className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                      <FileText className={`h-4 w-4 shrink-0 ${
                        doc.tipo === "apolice" ? "text-primary" :
                        doc.tipo === "proposta" ? "text-accent" : "text-muted-foreground"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.nome}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className={`text-[9px] ${docTypeColors[doc.tipo]}`}>
                            {doc.tipo === "apolice" ? "Apólice" : doc.tipo === "proposta" ? "Proposta" : "Documento"}
                          </Badge>
                          {doc.ramo && <span className="text-[10px] text-muted-foreground">{doc.ramo}</span>}
                          <span className="text-[10px] text-muted-foreground">{doc.tamanho}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] text-muted-foreground">{formatDate(doc.data)}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Download">
                          <Download className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <DocumentUploadSection
                arquivoApolice={arquivoApolice}
                setArquivoApolice={setArquivoApolice}
                arquivoProposta={arquivoProposta}
                setArquivoProposta={setArquivoProposta}
              />
            </TabsContent>

            {/* Histórico (from Lead) */}
            <TabsContent value="historico" className="px-6 pb-6 mt-4">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Histórico Completo
                </h4>
                <Badge variant="secondary" className="text-[9px]">Inclui fase Lead</Badge>
              </div>

              <div className="relative">
                <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />
                <div className="space-y-4">
                  {history.map((event, i) => (
                    <div key={i} className="flex gap-3 relative">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-card border border-border z-10 shrink-0 mt-0.5">
                        {timelineIcons[event.icon] || <Clock className="h-3.5 w-3.5 text-muted-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                            {timelineLabels[event.type] || event.type}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">{formatDate(event.date)}</span>
                        </div>
                        <p className="text-xs text-foreground">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
