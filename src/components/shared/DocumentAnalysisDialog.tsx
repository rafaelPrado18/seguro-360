import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start gap-2 py-1">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-xs text-foreground text-right font-medium">{value}</span>
    </div>
  );
}

export function DocumentAnalysisDialog({ open, onOpenChange, data, onConfirm }: DocumentAnalysisDialogProps) {
  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <DialogTitle>Dados Extraídos do Documento</DialogTitle>
          </div>
          <DialogDescription className="flex items-center gap-2">
            Confira os dados extraídos e confirme para prosseguir.
            <Badge variant="outline" className="ml-1">
              {data.tipo === "apolice" ? "Apólice" : "Proposta"}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[60vh] pr-3">
          <div className="space-y-4">
            {/* Dados do Seguro */}
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <SectionTitle icon={Shield} title="Dados do Seguro" />
              <div className="grid grid-cols-2 gap-x-4">
                <Field label="Seguradora" value={data.seguradora} />
                <Field label="Nº Proposta" value={data.numero_proposta} />
                {data.numero_apolice && <Field label="Nº Apólice" value={data.numero_apolice} />}
                <Field label="CI" value={data.ci} />
                <Field label="Vigência Início" value={data.vigencia_inicio} />
                <Field label="Vigência Fim" value={data.vigencia_fim} />
                <Field label="Classe de Bônus" value={data.classe_bonus} />
              </div>
            </div>

            {/* Segurado */}
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <SectionTitle icon={User} title="Segurado" />
              <div className="grid grid-cols-2 gap-x-4">
                <Field label="Nome" value={data.segurado_nome} />
                <Field label="CPF" value={data.segurado_cpf} />
                <Field label="Endereço" value={data.segurado_endereco} />
                <Field label="Bairro" value={data.segurado_bairro} />
                <Field label="Cidade" value={data.segurado_cidade} />
                <Field label="UF" value={data.segurado_uf} />
                <Field label="CEP" value={data.segurado_cep} />
                <Field label="Telefone" value={data.segurado_telefone} />
                <Field label="Celular" value={data.segurado_celular} />
                <Field label="Email" value={data.segurado_email} />
              </div>
            </div>

            {/* Veículo */}
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <SectionTitle icon={Car} title="Veículo" />
              <div className="grid grid-cols-2 gap-x-4">
                <Field label="Fabricante" value={data.veiculo_fabricante} />
                <Field label="Modelo" value={data.veiculo_modelo} />
                <Field label="Ano" value={data.veiculo_ano} />
                <Field label="Placa" value={data.veiculo_placa} />
                <Field label="Chassi" value={data.veiculo_chassi} />
                <Field label="Combustível" value={data.veiculo_combustivel} />
                <Field label="FIPE" value={data.veiculo_codigo_fipe} />
                <Field label="Utilização" value={data.veiculo_utilizacao} />
              </div>
            </div>

            {/* Financeiro */}
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <SectionTitle icon={DollarSign} title="Financeiro" />
              <div className="grid grid-cols-2 gap-x-4">
                <Field label="Prêmio Líquido" value={data.premio_liquido} />
                <Field label="IOF" value={data.iof} />
                <Field label="Prêmio Total" value={data.premio_total} />
                <Field label="Parcelas" value={data.parcelas} />
                <Field label="Valor Parcela" value={data.valor_parcela} />
                <Field label="Pagamento" value={data.forma_pagamento} />
                <Field label="Franquia" value={data.franquia} />
              </div>
            </div>

            {/* Coberturas */}
            {data.coberturas.length > 0 && (
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <SectionTitle icon={Shield} title="Coberturas" />
                <div className="space-y-1">
                  <div className="grid grid-cols-[1fr_auto_auto] gap-2 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider pb-1 border-b border-border">
                    <span>Descrição</span>
                    <span className="text-right w-28">Limite</span>
                    <span className="text-right w-24">Prêmio</span>
                  </div>
                  {data.coberturas.map((c, i) => (
                    <div key={i} className="grid grid-cols-[1fr_auto_auto] gap-2 text-xs py-1">
                      <span className="text-foreground">{c.descricao}</span>
                      <span className="text-muted-foreground text-right w-28">{c.limite}</span>
                      <span className="text-foreground font-medium text-right w-24">{c.premio}</span>
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
              onConfirm(data);
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
