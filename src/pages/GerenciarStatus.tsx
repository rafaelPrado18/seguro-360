import { useState, useEffect } from "react";
import { useLeadStatuses, useCreateLeadStatus, useUpdateLeadStatus as useUpdateLeadStatusMutation, useDeleteLeadStatus as useDeleteLeadStatusMutation } from "@/hooks/useStatus";
import { useWhatsAppTemplates } from "@/hooks/useWhatsApp";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, GripVertical, ArrowRight, MessageSquare, ChevronDown, ChevronRight, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { WhatsAppTemplate } from "@/services/whatsappService";
import type { LeadSubStatus } from "@/services/statusService";

export interface LeadStatus {
  id: string;
  label: string;
  key: string;
  color: string;
  bgColor: string;
  ordem: number;
  is_final: boolean;
  tipo: "ativo" | "ganho" | "perdido";
  template_id: string | null;
  substatus?: LeadSubStatus[];
}

const PRESET_COLORS = [
  "#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#6366f1", "#14b8a6",
];

const generateKey = (label: string) => {
  return label.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
};

const GerenciarStatus = () => {
  const { data: apiStatuses, isLoading } = useLeadStatuses();
  const createStatusMutation = useCreateLeadStatus();
  const updateStatusMutation = useUpdateLeadStatusMutation();
  const deleteStatusMutation = useDeleteLeadStatusMutation();
  const { data: templates = [] } = useWhatsAppTemplates();
  const [statuses, setStatuses] = useState<LeadStatus[]>([]);
  const [expandedStatus, setExpandedStatus] = useState<string | null>(null);

  useEffect(() => {
    if (apiStatuses && apiStatuses.length > 0) {
      setStatuses([...apiStatuses].sort((a, b) => a.ordem - b.ordem));
    }
  }, [apiStatuses]);

  const [editingStatus, setEditingStatus] = useState<LeadStatus | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    label: "",
    key: "",
    bgColor: "#3b82f6",
    color: "#3b82f6",
    tipo: "ativo" as "ativo" | "ganho" | "perdido",
    template_id: null as string | null,
    ordem: 1,
    substatus: [] as LeadSubStatus[],
  });
  const [newSubLabel, setNewSubLabel] = useState("");

  const openCreate = () => {
    setEditingStatus(null);
    setFormData({ label: "", key: "", bgColor: "#3b82f6", color: "#3b82f6", tipo: "ativo", template_id: null, ordem: statuses.length + 1, substatus: [] });
    setNewSubLabel("");
    setIsDialogOpen(true);
  };

  const openEdit = (status: LeadStatus) => {
    setEditingStatus(status);
    setFormData({
      label: status.label,
      key: status.key,
      bgColor: status.bgColor,
      color: status.color,
      tipo: status.tipo,
      template_id: status.template_id,
      ordem: status.ordem,
      substatus: status.substatus || [],
    });
    setNewSubLabel("");
    setIsDialogOpen(true);
  };

  const addSubStatus = () => {
    const label = newSubLabel.trim();
    if (!label) return;
    const key = generateKey(label);
    if (formData.substatus.some(s => s.key === key)) {
      toast({ title: "Substatus já existe", variant: "destructive" });
      return;
    }
    setFormData(prev => ({
      ...prev,
      substatus: [...prev.substatus, { id: crypto.randomUUID(), label, key, send_message: false, template_id: null, delay_days: 0, send_time: null }],
    }));
    setNewSubLabel("");
  };

  const updateSubStatus = (id: string, patch: Partial<LeadSubStatus>) => {
    setFormData(prev => ({
      ...prev,
      substatus: prev.substatus.map(s => (s.id === id ? { ...s, ...patch } : s)),
    }));
  };

  const removeSubStatus = (id: string) => {
    setFormData(prev => ({
      ...prev,
      substatus: prev.substatus.filter(s => s.id !== id),
    }));
  };

  const handleSave = () => {
    if (!formData.label.trim() || !formData.key.trim()) return;

    const statusData = {
      label: formData.label,
      key: formData.key,
      bgColor: formData.bgColor,
      color: formData.color,
      tipo: formData.tipo,
      is_final: formData.tipo !== "ativo",
      template_id: formData.template_id,
      ordem: formData.ordem,
      substatus: formData.substatus,
    };

    if (editingStatus) {
      updateStatusMutation.mutate(
        { id: editingStatus.id, data: statusData },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            toast({ title: "Status atualizado com sucesso!" });
          },
          onError: (err) => {
            toast({ title: "Erro ao atualizar status", description: err.message, variant: "destructive" });
          },
        }
      );
    } else {
      createStatusMutation.mutate(
        statusData,
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            toast({ title: "Status criado com sucesso!" });
          },
          onError: (err) => {
            toast({ title: "Erro ao criar status", description: err.message, variant: "destructive" });
          },
        }
      );
    }
  };

  const handleDelete = (id: string) => {
    deleteStatusMutation.mutate(id, {
      onSuccess: () => {
        toast({ title: "Status excluído com sucesso!" });
      },
      onError: (err) => {
        toast({ title: "Erro ao excluir status", description: err.message, variant: "destructive" });
      },
    });
  };

  const moveStatus = (id: string, direction: "up" | "down") => {
    setStatuses(prev => {
      const idx = prev.findIndex(s => s.id === id);
      if ((direction === "up" && idx === 0) || (direction === "down" && idx === prev.length - 1)) return prev;
      const newArr = [...prev];
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      [newArr[idx], newArr[swapIdx]] = [newArr[swapIdx], newArr[idx]];
      return newArr.map((s, i) => ({ ...s, ordem: i + 1 }));
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Gerenciar Status</h2>
            <p className="text-sm text-muted-foreground">Configure os estágios do funil de leads e seus substatus</p>
          </div>
          <Button onClick={openCreate} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="h-4 w-4" /> Novo Status
          </Button>
        </div>

        {/* Pipeline Preview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Visualização do Funil</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 flex-wrap">
              {statuses.map((s, i) => (
                <div key={s.id} className="flex items-center gap-1">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md" style={{ backgroundColor: `${s.bgColor}22` }}>
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: s.bgColor }} />
                    <span className="text-xs font-semibold" style={{ color: s.color }}>{s.label}</span>
                    {s.substatus && s.substatus.length > 0 && (
                      <span className="text-[9px] text-muted-foreground ml-0.5">({s.substatus.length})</span>
                    )}
                  </div>
                  {i < statuses.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Estágios do Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {statuses.map((status, i) => {
              const hasSubstatuses = status.substatus && status.substatus.length > 0;
              const isExpanded = expandedStatus === status.id;

              return (
                <div key={status.id} className="animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                    <GripVertical className="h-4 w-4 text-muted-foreground/40 cursor-grab" />

                    {hasSubstatuses ? (
                      <button onClick={() => setExpandedStatus(isExpanded ? null : status.id)} className="flex-shrink-0">
                        {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                      </button>
                    ) : (
                      <div className="w-4" />
                    )}

                    <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: status.bgColor }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{status.label}</span>
                        <code className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">{status.key}</code>
                        {hasSubstatuses && (
                          <Badge variant="outline" className="text-[9px]">
                            {status.substatus!.length} substatus
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant={status.tipo === "ganho" ? "default" : status.tipo === "perdido" ? "destructive" : "secondary"} className="text-[9px]">
                          {status.tipo === "ativo" ? "Em Andamento" : status.tipo === "ganho" ? "Ganho" : "Perdido"}
                        </Badge>
                        {status.template_id ? (
                          <Badge variant="outline" className="text-[9px] gap-1 border-accent text-accent">
                            <MessageSquare className="h-2.5 w-2.5" />
                            {templates.find(t => t.id === status.template_id)?.nome || "Template"}
                          </Badge>
                        ) : (
                          <span className="text-[10px] text-muted-foreground italic">Sem template</span>
                        )}
                        <span className="text-[10px] text-muted-foreground">Ordem: {status.ordem}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveStatus(status.id, "up")} disabled={i === 0}>
                        <span className="text-xs">↑</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveStatus(status.id, "down")} disabled={i === statuses.length - 1}>
                        <span className="text-xs">↓</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(status)}>
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(status.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded substatus list */}
                  {isExpanded && hasSubstatuses && (
                    <div className="ml-12 mt-1 space-y-1 pb-1">
                      {status.substatus!.map((sub) => (
                        <div key={sub.id} className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/40 border border-border/50">
                          <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: status.bgColor }} />
                          <span className="text-xs text-foreground">{sub.label}</span>
                          <code className="text-[9px] px-1 py-0.5 rounded bg-muted text-muted-foreground font-mono">{sub.key}</code>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingStatus ? "Editar Status" : "Novo Status"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Nome do Status</Label>
                <Input
                  value={formData.label}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      label: e.target.value,
                      key: editingStatus ? prev.key : generateKey(e.target.value),
                    }));
                  }}
                  placeholder="Ex: Negociação"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Chave (identificador)</Label>
                <Input
                  value={formData.key}
                  onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                  placeholder="Ex: negociacao"
                  className="h-9 text-sm font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Ordem</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.ordem}
                  onChange={(e) => setFormData(prev => ({ ...prev, ordem: Number(e.target.value) || 1 }))}
                  placeholder="Ex: 1"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Cor</Label>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="color"
                      value={formData.bgColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, bgColor: e.target.value, color: e.target.value }))}
                      className="absolute inset-0 w-10 h-10 opacity-0 cursor-pointer"
                    />
                    <div
                      className="h-10 w-10 rounded-full border-2 border-border shadow-sm cursor-pointer"
                      style={{ backgroundColor: formData.bgColor }}
                    />
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setFormData(prev => ({ ...prev, bgColor: c, color: c }))}
                        className={`h-6 w-6 rounded-full transition-all border ${
                          formData.bgColor === c ? "ring-2 ring-ring ring-offset-2 border-transparent" : "border-border"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <Input
                  value={formData.bgColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, bgColor: e.target.value, color: e.target.value }))}
                  placeholder="#3b82f6"
                  className="h-8 text-xs font-mono w-28 mt-1"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Tipo</Label>
                <div className="flex gap-2">
                  {(["ativo", "ganho", "perdido"] as const).map((t) => (
                    <Button
                      key={t}
                      variant={formData.tipo === t ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, tipo: t }))}
                      className="text-xs"
                    >
                      {t === "ativo" ? "Em Andamento" : t === "ganho" ? "Ganho" : "Perdido"}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Substatus section */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Substatus (categorias internas)</Label>
                <p className="text-[10px] text-muted-foreground">
                  Adicione subcategorias para organizar leads dentro deste estágio.
                </p>
                
                {formData.substatus.length > 0 && (
                  <div className="space-y-2">
                    {formData.substatus.map((sub) => (
                      <div key={sub.id} className="space-y-2 px-3 py-2 rounded-md bg-muted/50 border border-border/50">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: formData.bgColor }} />
                          <span className="text-xs text-foreground flex-1">{sub.label}</span>
                          <code className="text-[9px] px-1 py-0.5 rounded bg-muted text-muted-foreground font-mono">{sub.key}</code>
                          <button onClick={() => removeSubStatus(sub.id!)} className="text-destructive hover:text-destructive/80">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between gap-2 pl-3">
                          <Label className="text-[10px] flex items-center gap-1.5 text-muted-foreground">
                            <MessageSquare className="h-3 w-3 text-accent" />
                            Enviar mensagem ao entrar
                          </Label>
                          <Switch
                            checked={!!sub.send_message}
                            onCheckedChange={(v) => updateSubStatus(sub.id!, { send_message: v, ...(v ? {} : { template_id: null }) })}
                          />
                        </div>
                        {sub.send_message && (
                          <div className="pl-3 space-y-2">
                            <Select
                              value={sub.template_id || "none"}
                              onValueChange={(v) => updateSubStatus(sub.id!, { template_id: v === "none" ? null : v })}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Selecione um template" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Nenhum template</SelectItem>
                                {templates.filter(t => t.status === "aprovado").map(t => (
                                  <SelectItem key={t.id} value={t.id}>
                                    <span className="flex items-center gap-2">
                                      {t.nome}
                                      <span className="text-muted-foreground text-[10px]">({t.categoria})</span>
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <Label className="text-[10px] text-muted-foreground">Após (dias)</Label>
                                <Input
                                  type="number"
                                  min={0}
                                  value={sub.delay_days ?? 0}
                                  onChange={(e) => updateSubStatus(sub.id!, { delay_days: Math.max(0, Number(e.target.value) || 0) })}
                                  className="h-8 text-xs"
                                  placeholder="0"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[10px] text-muted-foreground">Horário</Label>
                                <Input
                                  type="time"
                                  value={sub.send_time ?? ""}
                                  onChange={(e) => updateSubStatus(sub.id!, { send_time: e.target.value || null })}
                                  className="h-8 text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    value={newSubLabel}
                    onChange={(e) => setNewSubLabel(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSubStatus(); } }}
                    placeholder="Nome do substatus"
                    className="h-8 text-xs flex-1"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addSubStatus} className="h-8 text-xs gap-1">
                    <Plus className="h-3 w-3" /> Adicionar
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-accent" />
                  Template WhatsApp ao entrar neste status
                </Label>
                <Select
                  value={formData.template_id || "none"}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, template_id: v === "none" ? null : v }))}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Nenhum template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum template</SelectItem>
                    {templates.filter(t => t.status === "aprovado").map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        <span className="flex items-center gap-2">
                          {t.nome}
                          <span className="text-muted-foreground text-[10px]">({t.categoria})</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground">
                  Ao mover um lead para este status, será sugerido enviar esta mensagem via WhatsApp.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90">
                {editingStatus ? "Salvar" : "Criar Status"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default GerenciarStatus;