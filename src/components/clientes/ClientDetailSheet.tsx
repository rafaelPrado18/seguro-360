import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Car, DollarSign, User, Shield, ChevronDown,
} from "lucide-react";
import type { Client, VehiclePolicy } from "@/services/clientService";

interface ClientDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
}

function FieldRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-border/50 last:border-0">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-medium text-right max-w-[60%] text-xs">{value || "—"}</span>
    </div>
  );
}

function VehiclePolicyCard({ vp, index, total }: { vp: VehiclePolicy; index: number; total: number }) {
  const [isOpen, setIsOpen] = useState(index === 0);
  const { vehicle: v, financial: f } = vp;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full rounded-lg border border-border bg-muted/30 px-3 py-2.5 hover:bg-muted/50 transition-colors text-left">
        <div className="flex items-center gap-2">
          <Car className="h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">
              {v.veiculo_fabricante} {v.veiculo_modelo}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {v.veiculo_placa} · {v.veiculo_ano} · {f.numero_apolice ? `Apólice ${f.numero_apolice}` : "Sem apólice"}
            </p>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-3 pl-1">
        {/* Vehicle details */}
        <div className="rounded-lg border border-border/50 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Car className="h-3.5 w-3.5 text-primary" />
            <h5 className="text-xs font-semibold text-foreground">Dados do Veículo</h5>
          </div>
          <div className="space-y-0.5">
            <FieldRow label="Fabricante" value={v.veiculo_fabricante} />
            <FieldRow label="Modelo" value={v.veiculo_modelo} />
            <FieldRow label="Ano" value={v.veiculo_ano} />
            <FieldRow label="Placa" value={v.veiculo_placa} />
            <FieldRow label="Chassi" value={v.veiculo_chassi} />
            <FieldRow label="Combustível" value={v.veiculo_combustivel} />
            <FieldRow label="Código FIPE" value={v.veiculo_codigo_fipe} />
            <FieldRow label="Zero KM" value={v.veiculo_zero_km} />
            <FieldRow label="Utilização" value={v.veiculo_utilizacao} />
          </div>
        </div>

        {/* Financial / policy details */}
        <div className="rounded-lg border border-border/50 p-3">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-3.5 w-3.5 text-primary" />
            <h5 className="text-xs font-semibold text-foreground">Dados do Seguro</h5>
          </div>
          <div className="space-y-0.5">
            <FieldRow label="Seguradora" value={f.seguradora} />
            <FieldRow label="Prêmio Total" value={f.premio_total} />
            <FieldRow label="Prêmio Líquido" value={f.premio_liquido} />
            <FieldRow label="Parcelas" value={f.parcelas} />
            <FieldRow label="Valor Parcela" value={f.valor_parcela} />
            <FieldRow label="Nº Proposta" value={f.numero_proposta} />
            <FieldRow label="Nº Apólice" value={f.numero_apolice} />
            <FieldRow label="Código C.I" value={f.ci} />
            <FieldRow label="Vigência Início" value={f.vigencia_inicio} />
            <FieldRow label="Vigência Fim" value={f.vigencia_fim} />
            <FieldRow label="Comissão" value={f.comissao} />
            <FieldRow label="Classe Bônus" value={f.classe_bonus} />
            <FieldRow label="IOF" value={f.iof} />
            <FieldRow label="Forma Pagamento" value={f.forma_pagamento} />
            <FieldRow label="Franquia" value={f.franquia} />
          </div>
        </div>

        {/* Coverages */}
        {f.coberturas && f.coberturas.length > 0 && (
          <div className="rounded-lg border border-border/50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <h5 className="text-xs font-semibold text-foreground">Coberturas</h5>
            </div>
            <div className="space-y-2">
              {f.coberturas.map((cob, i) => (
                <div key={i} className="rounded-md border border-border bg-background p-2 space-y-0.5">
                  <p className="text-xs font-medium">{cob.descricao}</p>
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>Limite: {cob.limite}</span>
                    <span className="font-medium text-foreground">{cob.premio}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function ClientDetailSheet({ open, onOpenChange, client }: ClientDetailSheetProps) {
  if (!client) return null;

  const getInitials = (nome: string) =>
    (nome || "").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const personalFields = [
    { label: "CPF/CNPJ", value: client.cpf },
    { label: "Email", value: client.email },
    { label: "Telefone", value: client.telefone },
    { label: "Celular", value: client.celular },
    { label: "Endereço", value: client.endereco },
    { label: "Bairro", value: client.bairro },
    { label: "Cidade", value: client.cidade },
    { label: "UF", value: client.uf },
    { label: "CEP", value: client.cep },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[520px] p-0">
        <SheetHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
              {getInitials(client.nome)}
            </div>
            <div>
              <SheetTitle className="text-lg">{client.nome}</SheetTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={`text-[10px] ${
                  client.lead_status === "Ativo" ? "border-success text-success" :
                  client.lead_status === "Inativo" ? "border-destructive text-destructive" :
                  "border-info text-info"
                }`}>{client.lead_status || "—"}</Badge>
                {client.vehicles.length > 0 && (
                  <Badge variant="secondary" className="text-[10px]">
                    {client.vehicles.length} veículo{client.vehicles.length > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="dados" className="flex-1">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dados" className="text-xs gap-1">
                <User className="h-3 w-3" /> Dados Pessoais
              </TabsTrigger>
              <TabsTrigger value="veiculos" className="text-xs gap-1">
                <Car className="h-3 w-3" /> Veículos & Apólices
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[calc(100vh-200px)]">
            <TabsContent value="dados" className="px-6 pb-6 mt-4">
              <div className="space-y-0.5">
                {personalFields.map((f) => (
                  <FieldRow key={f.label} label={f.label} value={f.value} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="veiculos" className="px-6 pb-6 mt-4">
              {client.vehicles.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum veículo cadastrado.</p>
              ) : (
                <div className="space-y-3">
                  {client.vehicles.map((vp, i) => (
                    <VehiclePolicyCard key={i} vp={vp} index={i} total={client.vehicles.length} />
                  ))}
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
