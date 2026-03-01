import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Car, FileText, Clock, DollarSign, User, Shield,
} from "lucide-react";
import type { Client } from "@/services/clientService";

interface ClientDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
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

  const vehicleFields = [
    { label: "Fabricante", value: client.veiculo_fabricante },
    { label: "Modelo", value: client.veiculo_modelo },
    { label: "Ano", value: client.veiculo_ano },
    { label: "Placa", value: client.veiculo_placa },
    { label: "Chassi", value: client.veiculo_chassi },
    { label: "Combustível", value: client.veiculo_combustivel },
    { label: "Código FIPE", value: client.veiculo_codigo_fipe },
    { label: "Zero KM", value: client.veiculo_zero_km },
    { label: "Utilização", value: client.veiculo_utilizacao },
  ];

  const financialFields = [
    { label: "Seguradora", value: client.seguradora },
    { label: "Prêmio Total", value: client.premio_total },
    { label: "Prêmio Líquido", value: client.premio_liquido },
    { label: "Parcelas", value: client.parcelas },
    { label: "Valor Parcela", value: client.valor_parcela },
    { label: "Nº Proposta", value: client.numero_proposta },
    { label: "Nº Apólice", value: client.numero_apolice },
    { label: "Código C.I", value: client.ci },
    { label: "Vigência Início", value: client.vigencia_inicio },
    { label: "Vigência Fim", value: client.vigencia_fim },
    { label: "Comissão", value: client.comissao },
    { label: "Classe Bônus", value: client.classe_bonus },
    { label: "IOF", value: client.iof },
    { label: "Forma Pagamento", value: client.forma_pagamento },
    { label: "Franquia", value: client.franquia },
  ];

  const renderFields = (fields: { label: string; value: string }[]) => (
    <div className="space-y-2 text-sm">
      {fields.map((f) => (
        <div key={f.label} className="flex justify-between py-1.5 border-b border-border/50 last:border-0">
          <span className="text-muted-foreground text-xs">{f.label}</span>
          <span className="font-medium text-right max-w-[60%] text-xs">{f.value || "—"}</span>
        </div>
      ))}
    </div>
  );

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
                  client.status === "Ativo" ? "border-success text-success" :
                  client.status === "Inativo" ? "border-destructive text-destructive" :
                  "border-info text-info"
                }`}>{client.status || "—"}</Badge>
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
              <TabsTrigger value="veiculo" className="text-xs gap-1">
                <Car className="h-3 w-3" /> Veículo
              </TabsTrigger>
              <TabsTrigger value="seguro" className="text-xs gap-1">
                <DollarSign className="h-3 w-3" /> Seguro
              </TabsTrigger>
              <TabsTrigger value="coberturas" className="text-xs gap-1">
                <Shield className="h-3 w-3" /> Coberturas
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[calc(100vh-200px)]">
            <TabsContent value="dados" className="px-6 pb-6 mt-4">
              {renderFields(personalFields)}
            </TabsContent>

            <TabsContent value="veiculo" className="px-6 pb-6 mt-4">
              {renderFields(vehicleFields)}
            </TabsContent>

            <TabsContent value="seguro" className="px-6 pb-6 mt-4">
              {renderFields(financialFields)}
            </TabsContent>

            <TabsContent value="coberturas" className="px-6 pb-6 mt-4">
              {client.coberturas && client.coberturas.length > 0 ? (
                <div className="space-y-3">
                  {client.coberturas.map((cob, i) => (
                    <div key={i} className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
                      <p className="text-sm font-medium">{cob.descricao}</p>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Limite: {cob.limite}</span>
                        <span className="font-medium text-foreground">{cob.premio}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma cobertura cadastrada.</p>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
