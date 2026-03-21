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
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, GripVertical, ArrowRight, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { WhatsAppTemplate } from "@/services/whatsappService";

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
}

const COLOR_OPTIONS = [
  { label: "Azul", value: "bg-info", text: "text-info" },
  { label: "Amarelo", value: "bg-warning", text: "text-warning" },
  { label: "Primário", value: "bg-primary", text: "text-primary" },
  { label: "Destaque", value: "bg-accent", text: "text-accent" },
  { label: "Verde", value: "bg-success", text: "text-success" },
  { label: "Vermelho", value: "bg-destructive", text: "text-destructive" },
];

const GerenciarStatus = () => {
  const { data: apiStatuses, isLoading } = useLeadStatuses();
  const createStatusMutation = useCreateLeadStatus();
  const updateStatusMutation = useUpdateLeadStatusMutation();
  const deleteStatusMutation = useDeleteLeadStatusMutation();
  const { data: templates = [] } = useWhatsAppTemplates();
  const [statuses, setStatuses] = useState<LeadStatus[]>([]);

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
    bgColor: "bg-info",
    color: "text-info",
    tipo: "ativo" as "ativo" | "ganho" | "perdido",
    template_id: null as string | null,
    ordem: 1,
  });

  const openCreate = () => {
    setEditingStatus(null);
    setFormData({ label: "", key: "", bgColor: "bg-info", color: "text-info", tipo: "ativo", template_id: null, ordem: statuses.length + 1 });
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
    });
    setIsDialogOpen(true);
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

  const generateKey = (label: string) => {
    return label.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Gerenciar Status</h2>
            <p className="text-sm text-muted-foreground">Configure os estágios do funil de leads</p>
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
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md ${s.bgColor}/15`}>
                    <div className={`h-2 w-2 rounded-full ${s.bgColor}`} />
                    <span className={`text-xs font-semibold ${s.color}`}>{s.label}</span>
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
            {statuses.map((status, i) => (
              <div
                key={status.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors animate-fade-in"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground/40 cursor-grab" />
                <div className={`h-3 w-3 rounded-full ${status.bgColor} flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{status.label}</span>
                    <code className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">{status.key}</code>
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
            ))}
          </CardContent>
        </Card>

        {/* Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
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
                <div className="flex gap-2 flex-wrap">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setFormData(prev => ({ ...prev, bgColor: c.value, color: c.text }))}
                      className={`h-8 w-8 rounded-full ${c.value} transition-all ${
                        formData.bgColor === c.value ? "ring-2 ring-ring ring-offset-2" : ""
                      }`}
                      title={c.label}
                    />
                  ))}
                </div>
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
                    {AVAILABLE_TEMPLATES.filter(t => t.status === "aprovado").map(t => (
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
