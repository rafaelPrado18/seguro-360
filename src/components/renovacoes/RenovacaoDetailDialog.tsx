import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Car, Save, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { DocumentUploadSection } from "@/components/shared/DocumentUploadSection";
import { HistorySection } from "@/components/shared/HistorySection";

export interface Veiculo {
  id: string;
  marca: string;
  modelo: string;
  ano: string;
  placa: string;
  chassi: string;
}

export interface RenovacaoData {
  id: number;
  apolice: string;
  cliente: string;
  ramo: string;
  seguradora: string;
  vencimento: string;
  premio: string;
  dias: number;
  status: string;
  observacoes?: string;
  veiculos: Veiculo[];
}

interface RenovacaoDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  renovacao: RenovacaoData | null;
  onSave: (updated: RenovacaoData) => void;
}

export function RenovacaoDetailDialog({ open, onOpenChange, renovacao, onSave }: RenovacaoDetailDialogProps) {
  const [form, setForm] = useState<RenovacaoData | null>(null);
  const [arquivoApolice, setArquivoApolice] = useState<File | null>(null);
  const [arquivoProposta, setArquivoProposta] = useState<File | null>(null);
  useEffect(() => {
    if (renovacao) setForm({ ...renovacao, veiculos: renovacao.veiculos.map(v => ({ ...v })) });
  }, [renovacao]);

  if (!form) return null;

  const updateField = (field: keyof RenovacaoData, value: string) => {
    setForm(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const updateVeiculo = (veiculoId: string, field: keyof Veiculo, value: string) => {
    setForm(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        veiculos: prev.veiculos.map(v => v.id === veiculoId ? { ...v, [field]: value } : v),
      };
    });
  };

  const addVeiculo = () => {
    setForm(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        veiculos: [...prev.veiculos, { id: uuidv4(), marca: "", modelo: "", ano: "", placa: "", chassi: "" }],
      };
    });
  };

  const removeVeiculo = (veiculoId: string) => {
    setForm(prev => {
      if (!prev) return prev;
      return { ...prev, veiculos: prev.veiculos.filter(v => v.id !== veiculoId) };
    });
  };

  const handleSave = () => {
    if (!form) return;
    onSave(form);
    toast.success(`Renovação ${form.apolice} atualizada com sucesso!`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Renovação {form.apolice}
            <Badge variant={form.status === "Urgente" ? "default" : "outline"} className={`text-[10px] ml-2 ${
              form.status === "Urgente" ? "bg-destructive text-destructive-foreground" :
              form.status === "Renovado" ? "border-success text-success" :
              form.status === "Em Contato" ? "border-info text-info" : "border-warning text-warning"
            }`}>
              {form.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>Edite as informações da renovação e os veículos do cliente.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Info básica */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Cliente</Label>
              <Input className="h-9 text-sm" value={form.cliente} onChange={(e) => updateField("cliente", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Seguradora</Label>
              <Input className="h-9 text-sm" value={form.seguradora} onChange={(e) => updateField("seguradora", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Ramo</Label>
              <Input className="h-9 text-sm" value={form.ramo} onChange={(e) => updateField("ramo", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Prêmio</Label>
              <Input className="h-9 text-sm" value={form.premio} onChange={(e) => updateField("premio", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Vencimento</Label>
              <Input className="h-9 text-sm" value={form.vencimento} onChange={(e) => updateField("vencimento", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Status</Label>
              <Select value={form.status} onValueChange={(v) => updateField("status", v)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Urgente">Urgente</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Em Contato">Em Contato</SelectItem>
                  <SelectItem value="Renovado">Renovado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Observações</Label>
            <Textarea
              className="text-sm min-h-[60px]"
              placeholder="Observações sobre a renovação..."
              value={form.observacoes || ""}
              onChange={(e) => updateField("observacoes", e.target.value)}
            />
          </div>

          <Separator />

          {/* Veículos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Car className="h-4 w-4 text-accent" />
                Veículos do Cliente ({form.veiculos.length})
              </h4>
              <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs" onClick={addVeiculo}>
                <Plus className="h-3 w-3" /> Adicionar Veículo
              </Button>
            </div>

            {form.veiculos.length === 0 && (
              <div className="text-center py-6 border-2 border-dashed border-border rounded-lg">
                <Car className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Nenhum veículo cadastrado</p>
                <Button variant="link" size="sm" className="text-xs mt-1" onClick={addVeiculo}>Adicionar veículo</Button>
              </div>
            )}

            {form.veiculos.map((v, idx) => (
              <div key={v.id} className="border border-border rounded-lg p-3 space-y-2 bg-muted/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Veículo {idx + 1}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeVeiculo(v.id)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Marca</Label>
                    <Input className="h-8 text-xs" placeholder="Ex: Toyota" value={v.marca} onChange={(e) => updateVeiculo(v.id, "marca", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Modelo</Label>
                    <Input className="h-8 text-xs" placeholder="Ex: Corolla" value={v.modelo} onChange={(e) => updateVeiculo(v.id, "modelo", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Ano</Label>
                    <Input className="h-8 text-xs" placeholder="Ex: 2024" value={v.ano} onChange={(e) => updateVeiculo(v.id, "ano", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Placa</Label>
                    <Input className="h-8 text-xs" placeholder="Ex: ABC-1234" value={v.placa} onChange={(e) => updateVeiculo(v.id, "placa", e.target.value)} />
                  </div>
                  <div className="space-y-1 col-span-2 sm:col-span-2">
                    <Label className="text-[10px] text-muted-foreground">Chassi</Label>
                    <Input className="h-8 text-xs" placeholder="Número do chassi" value={v.chassi} onChange={(e) => updateVeiculo(v.id, "chassi", e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          <DocumentUploadSection
            arquivoApolice={arquivoApolice}
            setArquivoApolice={setArquivoApolice}
            arquivoProposta={arquivoProposta}
            setArquivoProposta={setArquivoProposta}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
            <Save className="h-4 w-4" /> Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
