import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, User, Car, DollarSign, Shield, FileText } from "lucide-react";
import type { ExtractedDocumentData } from "@/services/documentAnalysisService";

interface DocumentAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ExtractedDocumentData | null;
  onConfirm: (data: ExtractedDocumentData) => void;
}

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <Icon className="h-4 w-4 text-primary" />
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
    </div>
  );
}

function EditableField({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1 py-1">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <Input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 text-xs"
      />
    </div>
  );
}

export function DocumentAnalysisDialog({ open, onOpenChange, data, onConfirm }: DocumentAnalysisDialogProps) {
  const [editData, setEditData] = useState<ExtractedDocumentData | null>(null);

  useEffect(() => {
    if (data) setEditData({ ...data, coberturas: data.coberturas.map(c => ({ ...c })) });
  }, [data]);

  if (!editData) return null;

  const set = (key: keyof ExtractedDocumentData, value: string) => {
    setEditData(prev => prev ? { ...prev, [key]: value } : prev);
  };

  const setCob = (index: number, key: keyof ExtractedDocumentData["coberturas"][0], value: string) => {
    setEditData(prev => {
      if (!prev) return prev;
      const coberturas = [...prev.coberturas];
      coberturas[index] = { ...coberturas[index], [key]: value };
      return { ...prev, coberturas };
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <DialogTitle>Dados Extraídos do Documento</DialogTitle>
          </div>
          <DialogDescription className="flex items-center gap-2">
            Edite os dados se necessário e confirme para prosseguir.
            <Badge variant="outline" className="ml-1">
              {editData.tipo === "apolice" ? "Apólice" : "Proposta"}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[60vh] pr-3 [&>[data-radix-scroll-area-viewport]]:!overflow-y-auto [&_[data-radix-scroll-area-scrollbar]]:!opacity-100">
          <div className="space-y-4">
            {/* Dados do Seguro */}
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <SectionTitle icon={Shield} title="Dados do Seguro" />
              <div className="grid grid-cols-2 gap-x-4">
                <EditableField label="Seguradora" value={editData.seguradora} onChange={v => set("seguradora", v)} />
                <EditableField label="Nº Proposta" value={editData.numero_proposta} onChange={v => set("numero_proposta", v)} />
                <EditableField label="Nº Apólice" value={editData.numero_apolice} onChange={v => set("numero_apolice", v)} />
                <EditableField label="CI" value={editData.ci} onChange={v => set("ci", v)} />
                <EditableField label="Vigência Início" value={editData.vigencia_inicio} onChange={v => set("vigencia_inicio", v)} />
                <EditableField label="Vigência Fim" value={editData.vigencia_fim} onChange={v => set("vigencia_fim", v)} />
                <EditableField label="Classe de Bônus" value={editData.classe_bonus} onChange={v => set("classe_bonus", v)} />
              </div>
            </div>

            {/* Segurado */}
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <SectionTitle icon={User} title="Segurado" />
              <div className="grid grid-cols-2 gap-x-4">
                <EditableField label="Nome" value={editData.segurado_nome} onChange={v => set("segurado_nome", v)} />
                <EditableField label="CPF" value={editData.segurado_cpf} onChange={v => set("segurado_cpf", v)} />
                <EditableField label="Endereço" value={editData.segurado_endereco} onChange={v => set("segurado_endereco", v)} />
                <EditableField label="Bairro" value={editData.segurado_bairro} onChange={v => set("segurado_bairro", v)} />
                <EditableField label="Cidade" value={editData.segurado_cidade} onChange={v => set("segurado_cidade", v)} />
                <EditableField label="UF" value={editData.segurado_uf} onChange={v => set("segurado_uf", v)} />
                <EditableField label="CEP" value={editData.segurado_cep} onChange={v => set("segurado_cep", v)} />
                <EditableField label="Telefone" value={editData.segurado_telefone} onChange={v => set("segurado_telefone", v)} />
                <EditableField label="Celular" value={editData.segurado_celular} onChange={v => set("segurado_celular", v)} />
                <EditableField label="Email" value={editData.segurado_email} onChange={v => set("segurado_email", v)} />
              </div>
            </div>

            {/* Veículo */}
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <SectionTitle icon={Car} title="Veículo" />
              <div className="grid grid-cols-2 gap-x-4">
                <EditableField label="Fabricante" value={editData.veiculo_fabricante} onChange={v => set("veiculo_fabricante", v)} />
                <EditableField label="Modelo" value={editData.veiculo_modelo} onChange={v => set("veiculo_modelo", v)} />
                <EditableField label="Ano" value={editData.veiculo_ano} onChange={v => set("veiculo_ano", v)} />
                <EditableField label="Placa" value={editData.veiculo_placa} onChange={v => set("veiculo_placa", v)} />
                <EditableField label="Chassi" value={editData.veiculo_chassi} onChange={v => set("veiculo_chassi", v)} />
                <EditableField label="Combustível" value={editData.veiculo_combustivel} onChange={v => set("veiculo_combustivel", v)} />
                <EditableField label="FIPE" value={editData.veiculo_codigo_fipe} onChange={v => set("veiculo_codigo_fipe", v)} />
                <EditableField label="Utilização" value={editData.veiculo_utilizacao} onChange={v => set("veiculo_utilizacao", v)} />
              </div>
            </div>

            {/* Financeiro */}
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <SectionTitle icon={DollarSign} title="Financeiro" />
              <div className="grid grid-cols-2 gap-x-4">
                <EditableField label="Prêmio Líquido" value={editData.premio_liquido} onChange={v => set("premio_liquido", v)} />
                <EditableField label="IOF" value={editData.iof} onChange={v => set("iof", v)} />
                <EditableField label="Prêmio Total" value={editData.premio_total} onChange={v => set("premio_total", v)} />
                <EditableField label="Parcelas" value={editData.parcelas} onChange={v => set("parcelas", v)} />
                <EditableField label="Valor Parcela" value={editData.valor_parcela} onChange={v => set("valor_parcela", v)} />
                <EditableField label="Pagamento" value={editData.forma_pagamento} onChange={v => set("forma_pagamento", v)} />
                <EditableField label="Franquia" value={editData.franquia} onChange={v => set("franquia", v)} />
              </div>
            </div>

            {/* Coberturas */}
            {editData.coberturas.length > 0 && (
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <SectionTitle icon={Shield} title="Coberturas" />
                <div className="space-y-2">
                  {editData.coberturas.map((c, i) => (
                    <div key={i} className="grid grid-cols-[1fr_auto_auto] gap-2 items-end">
                      <EditableField label="Descrição" value={c.descricao} onChange={v => setCob(i, "descricao", v)} />
                      <EditableField label="Limite" value={c.limite} onChange={v => setCob(i, "limite", v)} />
                      <EditableField label="Prêmio" value={c.premio} onChange={v => setCob(i, "premio", v)} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <Separator />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => {
              onConfirm(editData);
              onOpenChange(false);
            }}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Confirmar Dados
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
