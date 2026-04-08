import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Clock, Users, Plus, Trash2, Pencil, Check, Save, Loader2 } from "lucide-react";
import { DocumentUploadSection } from "@/components/shared/DocumentUploadSection";
import { HistorySection } from "@/components/shared/HistorySection";
import { sinistroService } from "@/services/sinistroService";
import { toast } from "@/hooks/use-toast";

interface Terceiro {
  id: string;
  nome: string;
  telefone: string;
  cnh: string;
}

export interface SinistroData {
  id: string;
  numeroSinistro: string;
  dataSinistro: string;
  apolice: string;
  cliente: string;
  clienteId?: string;
  tipo: string;
  dataAbertura: string;
  valor: string;
  status: string;
  prioridade: string;
  telefone: string;
  seguradora?: string;
  oficina?: string;
  observacoes?: string;
  leadId?: string;
  terceiros?: { nome: string; telefone: string; cnh: string }[];
}

interface SinistroDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sinistro: SinistroData | null;
  onSinistroUpdated?: () => void;
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

const STATUS_OPTIONS = [
  "Abertura / Agendamento Vistoria",
  "Indenização Integral",
  "Fora do Prazo",
  "Acompanhamento de Reparo",
  "WhatsApp",
];

const PRIORIDADE_OPTIONS = ["Baixa", "Média", "Alta", "Crítica"];

export function SinistroDetailSheet({ open, onOpenChange, sinistro, onSinistroUpdated }: SinistroDetailSheetProps) {
  const [arquivoApolice, setArquivoApolice] = useState<File | null>(null);
  const [arquivoProposta, setArquivoProposta] = useState<File | null>(null);
  const [terceiros, setTerceiros] = useState<Terceiro[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingTerceiros, setSavingTerceiros] = useState(false);
  const [editForm, setEditForm] = useState<SinistroData | null>(null);

  useEffect(() => {
    if (sinistro) {
      setEditForm({ ...sinistro });
      setIsEditing(false);
      // Load terceiros from sinistro data
      if (sinistro.terceiros?.length) {
        setTerceiros(sinistro.terceiros.map(t => ({ id: crypto.randomUUID(), ...t })));
      } else {
        setTerceiros([]);
      }
    }
  }, [sinistro]);

  const addTerceiro = () => {
    setTerceiros(prev => [...prev, { id: crypto.randomUUID(), nome: "", telefone: "", cnh: "" }]);
  };

  const updateTerceiro = (id: string, field: keyof Terceiro, value: string) => {
    setTerceiros(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const removeTerceiro = (id: string) => {
    setTerceiros(prev => prev.filter(t => t.id !== id));
  };

  if (!sinistro || !editForm) return null;

  const referenceId = sinistro.leadId || sinistro.id;

  const updateField = (field: keyof SinistroData, value: string) => {
    setEditForm(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const handleSave = async () => {
    if (!editForm) return;
    setSaving(true);
    try {
      const dados: Record<string, unknown> = {};
      const fields: (keyof SinistroData)[] = [
        "cliente", "tipo", "dataAbertura", "valor", "status",
        "prioridade", "telefone", "apolice", "seguradora", "oficina",
        "observacoes", "numeroSinistro", "dataSinistro",
      ];
      for (const f of fields) {
        if (editForm[f] !== sinistro[f]) {
          dados[f] = editForm[f] || "";
        }
      }
      // Always send terceiros
      dados.terceiros = terceiros.map(({ nome, telefone, cnh }) => ({ nome, telefone, cnh }));

      await sinistroService.updateSinistro({ id: sinistro.id }, dados);
      toast({ title: "Sinistro atualizado!", description: "Informações salvas com sucesso." });
      setIsEditing(false);
      onSinistroUpdated?.();
    } catch {
      toast({ title: "Erro ao atualizar sinistro", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[480px] p-0">
        <SheetHeader className="px-6 pt-6 pb-4">
          <div>
            <SheetTitle className="text-lg">Sinistro {editForm.numeroSinistro || sinistro.id}</SheetTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={`text-[10px] ${prioridadeColor(editForm.prioridade)}`}>{editForm.prioridade}</Badge>
              <Badge variant="outline" className={`text-[10px] ${statusColor(editForm.status)}`}>{editForm.status}</Badge>
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
                <div className="space-y-4 mt-2">
                  <div className="flex justify-end">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-xs" onClick={() => { setEditForm({ ...sinistro }); setIsEditing(false); }}>Cancelar</Button>
                        <Button size="sm" className="text-xs gap-1 bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleSave} disabled={saving}>
                          {saving ? <Save className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Salvar
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => setIsEditing(true)}>
                        <Pencil className="h-3 w-3" /> Editar
                      </Button>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">Informações do Sinistro</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Nº do Sinistro</Label>
                        {isEditing ? (
                          <Input className="h-8 text-xs" placeholder="Número do sinistro" value={editForm.numeroSinistro} onChange={(e) => updateField("numeroSinistro", e.target.value)} />
                        ) : (
                          <p className="text-sm font-mono">{editForm.numeroSinistro || "—"}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Data do Sinistro</Label>
                        {isEditing ? (
                          <Input className="h-8 text-xs" type="date" value={editForm.dataSinistro} onChange={(e) => updateField("dataSinistro", e.target.value)} />
                        ) : (
                          <p className="text-sm">{editForm.dataSinistro || "—"}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">Informações Gerais</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1 col-span-2">
                        <Label className="text-[10px] text-muted-foreground">Cliente</Label>
                        {isEditing ? (
                          <Input className="h-8 text-xs" value={editForm.cliente} onChange={(e) => updateField("cliente", e.target.value)} />
                        ) : (
                          <p className="text-sm font-medium">{editForm.cliente}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Apólice</Label>
                        {isEditing ? (
                          <Input className="h-8 text-xs" value={editForm.apolice} onChange={(e) => updateField("apolice", e.target.value)} />
                        ) : (
                          <p className="text-sm font-mono">{editForm.apolice || "—"}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Tipo</Label>
                        {isEditing ? (
                          <Input className="h-8 text-xs" value={editForm.tipo} onChange={(e) => updateField("tipo", e.target.value)} />
                        ) : (
                          <p className="text-sm">{editForm.tipo}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Data de Abertura</Label>
                        {isEditing ? (
                          <Input className="h-8 text-xs" type="date" value={editForm.dataAbertura} onChange={(e) => updateField("dataAbertura", e.target.value)} />
                        ) : (
                          <p className="text-sm">{editForm.dataAbertura}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Telefone</Label>
                        {isEditing ? (
                          <Input className="h-8 text-xs" value={editForm.telefone} onChange={(e) => updateField("telefone", e.target.value)} />
                        ) : (
                          <p className="text-sm">{editForm.telefone}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Seguradora</Label>
                        {isEditing ? (
                          <Input className="h-8 text-xs" value={editForm.seguradora || ""} onChange={(e) => updateField("seguradora", e.target.value)} />
                        ) : (
                          <p className="text-sm">{editForm.seguradora || "—"}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Oficina</Label>
                        {isEditing ? (
                          <Input className="h-8 text-xs" value={editForm.oficina || ""} onChange={(e) => updateField("oficina", e.target.value)} />
                        ) : (
                          <p className="text-sm">{editForm.oficina || "—"}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Status</Label>
                      {isEditing ? (
                        <Select value={editForm.status} onValueChange={(v) => updateField("status", v)}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline" className={`text-[10px] ${statusColor(editForm.status)}`}>{editForm.status}</Badge>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Prioridade</Label>
                      {isEditing ? (
                        <Select value={editForm.prioridade} onValueChange={(v) => updateField("prioridade", v)}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {PRIORIDADE_OPTIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={`text-[10px] ${prioridadeColor(editForm.prioridade)}`}>{editForm.prioridade}</Badge>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">Valores</h4>
                    {isEditing ? (
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Valor Estimado</Label>
                        <Input className="h-8 text-xs" value={editForm.valor} onChange={(e) => updateField("valor", e.target.value)} />
                      </div>
                    ) : (
                      <div className="rounded-lg border border-border p-4 text-center">
                        <p className="text-2xl font-bold text-foreground">{editForm.valor}</p>
                        <p className="text-xs text-muted-foreground">Valor Estimado</p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-[10px] text-muted-foreground">Observações</Label>
                    {isEditing ? (
                      <Textarea className="text-xs min-h-[60px] mt-1" placeholder="Observações..." value={editForm.observacoes || ""} onChange={(e) => updateField("observacoes", e.target.value)} />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">{editForm.observacoes || "Sem observações"}</p>
                    )}
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

                  {terceiros.length > 0 && (
                    <Button
                      className="w-full gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
                      size="sm"
                      disabled={savingTerceiros}
                      onClick={async () => {
                        setSavingTerceiros(true);
                        try {
                          const payload = terceiros.map(({ nome, telefone, cnh }) => ({ nome, telefone, cnh }));
                          await sinistroService.updateSinistro({ id: sinistro.id }, { terceiros: payload });
                          toast({ title: "Terceiros atualizados!", description: "Dados salvos com sucesso." });
                          onSinistroUpdated?.();
                        } catch {
                          toast({ title: "Erro ao salvar terceiros", variant: "destructive" });
                        } finally {
                          setSavingTerceiros(false);
                        }
                      }}
                    >
                      {savingTerceiros ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      Salvar Terceiros
                    </Button>
                  )}
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
