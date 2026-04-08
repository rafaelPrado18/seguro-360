import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileText, Clock, Users, Plus, Trash2 } from "lucide-react";
import { DocumentUploadSection } from "@/components/shared/DocumentUploadSection";
import { HistorySection } from "@/components/shared/HistorySection";

interface Terceiro {
  id: string;
  nome: string;
  telefone: string;
  cnh: string;
}

interface SinistroData {
  id: string;
  apolice: string;
  cliente: string;
  tipo: string;
  dataAbertura: string;
  valor: string;
  status: string;
  prioridade: string;
  telefone: string;
  leadId?: string;
}

interface SinistroDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sinistro: SinistroData | null;
}

const statusColor = (s: string) => {
  switch (s) {
    case "Pago": return "border-success text-success";
    case "Aprovado": return "border-info text-info";
    case "Em Análise": return "border-warning text-warning";
    case "Em Vistoria": return "border-accent text-accent";
    case "Documentação": return "border-muted-foreground text-muted-foreground";
    default: return "";
  }
};

const prioridadeColor = (p: string) => {
  switch (p) {
    case "Crítica": return "bg-destructive text-destructive-foreground";
    case "Alta": return "bg-warning text-warning-foreground";
    case "Média": return "bg-info text-info-foreground";
    default: return "bg-secondary text-secondary-foreground";
  }
};

export function SinistroDetailSheet({ open, onOpenChange, sinistro }: SinistroDetailSheetProps) {
  const [arquivoApolice, setArquivoApolice] = useState<File | null>(null);
  const [arquivoProposta, setArquivoProposta] = useState<File | null>(null);
  const [terceiros, setTerceiros] = useState<Terceiro[]>([]);

  const addTerceiro = () => {
    setTerceiros(prev => [...prev, { id: crypto.randomUUID(), nome: "", telefone: "", cnh: "" }]);
  };

  const updateTerceiro = (id: string, field: keyof Terceiro, value: string) => {
    setTerceiros(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const removeTerceiro = (id: string) => {
    setTerceiros(prev => prev.filter(t => t.id !== id));
  };

  if (!sinistro) return null;

  const referenceId = sinistro.leadId || sinistro.id;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[480px] p-0">
        <SheetHeader className="px-6 pt-6 pb-4">
          <div>
            <SheetTitle className="text-lg">Sinistro {sinistro.id}</SheetTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={`text-[10px] ${prioridadeColor(sinistro.prioridade)}`}>{sinistro.prioridade}</Badge>
              <Badge variant="outline" className={`text-[10px] ${statusColor(sinistro.status)}`}>{sinistro.status}</Badge>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="px-6 pb-6">
            <Tabs defaultValue="info">
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="info" className="text-xs gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> Info
                </TabsTrigger>
                <TabsTrigger value="terceiros" className="text-xs gap-1.5">
                  <Users className="h-3.5 w-3.5" /> Terceiros
                </TabsTrigger>
                <TabsTrigger value="documentos" className="text-xs gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> Docs
                </TabsTrigger>
                <TabsTrigger value="historico" className="text-xs gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Histórico
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info">
                <div className="space-y-5 mt-2">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">Informações Gerais</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cliente</span>
                        <span className="font-medium">{sinistro.cliente}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Apólice</span>
                        <span className="font-mono">{sinistro.apolice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tipo</span>
                        <span>{sinistro.tipo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Data de Abertura</span>
                        <span>{sinistro.dataAbertura}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Telefone</span>
                        <span>{sinistro.telefone}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">Valores</h4>
                    <div className="rounded-lg border border-border p-4 text-center">
                      <p className="text-2xl font-bold text-foreground">{sinistro.valor}</p>
                      <p className="text-xs text-muted-foreground">Valor Estimado</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="terceiros">
                <div className="space-y-3 mt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-foreground">Terceiros Envolvidos ({terceiros.length})</h4>
                    <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs" onClick={addTerceiro}>
                      <Plus className="h-3 w-3" /> Adicionar
                    </Button>
                  </div>

                  {terceiros.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                      <Users className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Nenhum terceiro registrado</p>
                      <Button variant="link" size="sm" className="text-xs mt-1" onClick={addTerceiro}>Adicionar terceiro</Button>
                    </div>
                  )}

                  {terceiros.map((t, idx) => (
                    <div key={t.id} className="border border-border rounded-lg p-3 space-y-2 bg-muted/20">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">Terceiro {idx + 1}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeTerceiro(t.id)}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground">Nome</Label>
                          <Input className="h-8 text-xs" placeholder="Nome do terceiro" value={t.nome} onChange={(e) => updateTerceiro(t.id, "nome", e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground">Telefone</Label>
                          <Input className="h-8 text-xs" placeholder="(11) 99999-9999" value={t.telefone} onChange={(e) => updateTerceiro(t.id, "telefone", e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground">CNH</Label>
                          <Input className="h-8 text-xs" placeholder="Número da CNH" value={t.cnh} onChange={(e) => updateTerceiro(t.id, "cnh", e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="documentos">
                <div className="mt-2">
                  <DocumentUploadSection
                    arquivoApolice={arquivoApolice}
                    setArquivoApolice={setArquivoApolice}
                    arquivoProposta={arquivoProposta}
                    setArquivoProposta={setArquivoProposta}
                    leadId={referenceId}
                  />
                </div>
              </TabsContent>

              <TabsContent value="historico">
                <div className="mt-2">
                  <HistorySection referenceId={referenceId} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
