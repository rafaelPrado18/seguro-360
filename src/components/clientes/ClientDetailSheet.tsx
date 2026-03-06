import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Car, DollarSign, User, Shield, ChevronDown, Clock, FileText,
  MessageSquare, Target, CheckCircle2, ArrowRight, StickyNote, Upload,
  Send, Loader2, Download,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Client, VehiclePolicy } from "@/services/clientService";
import type { Lead } from "@/services/leadsService";
import { leadsService } from "@/services/leadsService";
import { useLeadHistory } from "@/hooks/useLeads";

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

// ── Timeline helpers ──

interface TimelineEvent {
  date: string;
  description: string;
  icon: string;
  type: string;
}

const statusLabels: Record<string, string> = {
  novo: "Novo", em_contato: "Em Contato", qualificado: "Qualificado",
  proposta_enviada: "Proposta Enviada", convertido: "Convertido", perdido: "Perdido",
};

function generateTimeline(lead: Lead): TimelineEvent[] {
  const events: TimelineEvent[] = [
    { date: lead.created_at, type: "criado", description: "Lead cadastrado no sistema", icon: "create" },
  ];

  if (lead.status !== "novo") {
    events.push({
      date: new Date(new Date(lead.created_at).getTime() + 86400000).toISOString(),
      type: "contato", description: "Primeiro contato realizado", icon: "contact",
    });
  }
  if (["qualificado", "proposta_enviada", "convertido"].includes(lead.status)) {
    events.push({
      date: new Date(new Date(lead.created_at).getTime() + 172800000).toISOString(),
      type: "qualificado", description: "Lead qualificado após reunião", icon: "qualified",
    });
  }
  if (["proposta_enviada", "convertido"].includes(lead.status)) {
    events.push({
      date: new Date(new Date(lead.created_at).getTime() + 259200000).toISOString(),
      type: "proposta", description: `Proposta enviada — R$ ${lead.valor_estimado?.toLocaleString?.() ?? lead.valor_estimado}`, icon: "proposal",
    });
  }
  if (lead.status === "convertido") {
    events.push({ date: lead.updated_at, type: "convertido", description: "Lead convertido em cliente", icon: "converted" });
  }
  if (lead.status === "perdido") {
    events.push({ date: lead.updated_at, type: "perdido", description: "Lead perdido", icon: "lost" });
  }

  return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const timelineIconMap: Record<string, React.ReactNode> = {
  create: <FileText className="h-3.5 w-3.5 text-info" />,
  contact: <MessageSquare className="h-3.5 w-3.5 text-warning" />,
  qualified: <Target className="h-3.5 w-3.5 text-primary" />,
  proposal: <DollarSign className="h-3.5 w-3.5 text-accent" />,
  converted: <CheckCircle2 className="h-3.5 w-3.5 text-success" />,
  lost: <ArrowRight className="h-3.5 w-3.5 text-destructive" />,
  note: <StickyNote className="h-3.5 w-3.5 text-muted-foreground" />,
};

// ── Vehicle / Policy Card ──

function VehiclePolicyCard({ vp, index }: { vp: VehiclePolicy; index: number; total: number }) {
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

// ── Main Component ──

export function ClientDetailSheet({ open, onOpenChange, client }: ClientDetailSheetProps) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [loadingLead, setLoadingLead] = useState(false);

  useEffect(() => {
    if (!open || !client?.lead_id) {
      setLead(null);
      return;
    }

    let cancelled = false;
    setLoadingLead(true);
    leadsService.getLeadByPhone(client.telefone || client.celular)
      .then((found) => {
        if (!cancelled) setLead(found);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingLead(false); });

    return () => { cancelled = true; };
  }, [open, client?.lead_id, client?.telefone, client?.celular]);

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

  const timeline = lead ? generateTimeline(lead) : [];

  // Build documents list from vehicle policies
  const documents = client.vehicles
    .flatMap((vp, idx) => {
      const docs: { label: string; detail: string; vehicle: string }[] = [];
      const vName = `${vp.vehicle.veiculo_fabricante} ${vp.vehicle.veiculo_modelo}`.trim() || `Veículo ${idx + 1}`;
      if (vp.financial.numero_apolice) {
        docs.push({
          label: `Apólice ${vp.financial.numero_apolice}`,
          detail: `${vp.financial.seguradora || "—"} · Vigência: ${vp.financial.vigencia_inicio || "—"} a ${vp.financial.vigencia_fim || "—"}`,
          vehicle: vName,
        });
      }
      if (vp.financial.numero_proposta) {
        docs.push({
          label: `Proposta ${vp.financial.numero_proposta}`,
          detail: `${vp.financial.seguradora || "—"} · Prêmio: ${vp.financial.premio_total || "—"}`,
          vehicle: vName,
        });
      }
      return docs;
    });

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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dados" className="text-[11px] gap-1">
                <User className="h-3 w-3" /> Dados
              </TabsTrigger>
              <TabsTrigger value="veiculos" className="text-[11px] gap-1">
                <Car className="h-3 w-3" /> Veículos
              </TabsTrigger>
              <TabsTrigger value="historico" className="text-[11px] gap-1">
                <Clock className="h-3 w-3" /> Histórico
              </TabsTrigger>
              <TabsTrigger value="documentos" className="text-[11px] gap-1">
                <FileText className="h-3 w-3" /> Docs
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[calc(100vh-200px)]">
            {/* Dados Pessoais */}
            <TabsContent value="dados" className="px-6 pb-6 mt-4">
              <div className="space-y-0.5">
                {personalFields.map((f) => (
                  <FieldRow key={f.label} label={f.label} value={f.value} />
                ))}
              </div>
            </TabsContent>

            {/* Veículos & Apólices */}
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

            {/* Histórico */}
            <TabsContent value="historico" className="px-6 pb-6 mt-4">
              {loadingLead ? (
                <p className="text-sm text-muted-foreground text-center py-8">Carregando histórico...</p>
              ) : timeline.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum histórico disponível.</p>
              ) : (
                <div className="relative">
                  <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
                  <div className="space-y-4">
                    {timeline.map((event, i) => (
                      <div key={i} className="flex gap-3 relative">
                        <div className={`h-6 w-6 rounded-full bg-background border flex items-center justify-center flex-shrink-0 z-10 ${
                          event.type === "nota" ? "border-accent/50" : "border-border"
                        }`}>
                          {timelineIconMap[event.icon]}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className="text-sm text-foreground">{event.description}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{formatDateTime(event.date)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Datas do cliente */}
              {(client.created_at || client.updated_at) && (
                <div className="mt-6 rounded-lg border border-border/50 p-3 space-y-0.5">
                  <h5 className="text-xs font-semibold text-muted-foreground mb-2">Registro do Cliente</h5>
                  {client.created_at && <FieldRow label="Criado em" value={formatDateTime(client.created_at)} />}
                  {client.updated_at && <FieldRow label="Atualizado em" value={formatDateTime(client.updated_at)} />}
                </div>
              )}
            </TabsContent>

            {/* Documentos */}
            <TabsContent value="documentos" className="px-6 pb-6 mt-4">
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <Upload className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhum documento vinculado.</p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Documentos são importados ao analisar apólices/propostas no lead.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc, i) => (
                    <div key={i} className="rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex items-start gap-2.5">
                        <FileText className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{doc.label}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{doc.detail}</p>
                          <Badge variant="secondary" className="text-[10px] mt-1.5">{doc.vehicle}</Badge>
                        </div>
                      </div>
                    </div>
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
