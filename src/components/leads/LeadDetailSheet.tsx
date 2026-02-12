import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Phone, Mail, MessageSquare, MapPin, Calendar, Clock, User,
  Target, DollarSign, FileText, ArrowRight, CheckCircle2
} from "lucide-react";
import type { Lead } from "@/services/leadsService";

const statusLabels: Record<Lead["status"], string> = {
  novo: "Novo", em_contato: "Em Contato", qualificado: "Qualificado",
  proposta_enviada: "Proposta Enviada", convertido: "Convertido", perdido: "Perdido",
};

const statusColors: Record<Lead["status"], string> = {
  novo: "bg-info text-info-foreground",
  em_contato: "border-warning text-warning",
  qualificado: "border-primary text-primary",
  proposta_enviada: "border-accent text-accent",
  convertido: "border-success text-success",
  perdido: "border-destructive text-destructive",
};

const origemLabels: Record<string, string> = {
  whatsapp: "WhatsApp", site: "Site", indicacao: "Indicação",
  facebook: "Facebook", instagram: "Instagram", google_ads: "Google Ads", outro: "Outro",
};

// Mock timeline for demonstration
function generateTimeline(lead: Lead) {
  const events = [
    { date: lead.created_at, type: "criado", description: "Lead cadastrado no sistema", icon: "create" },
  ];

  if (lead.status !== "novo") {
    events.push({
      date: new Date(new Date(lead.created_at).getTime() + 86400000).toISOString(),
      type: "contato",
      description: "Primeiro contato realizado via WhatsApp",
      icon: "contact",
    });
  }

  if (["qualificado", "proposta_enviada", "convertido"].includes(lead.status)) {
    events.push({
      date: new Date(new Date(lead.created_at).getTime() + 172800000).toISOString(),
      type: "qualificado",
      description: "Lead qualificado após reunião de apresentação",
      icon: "qualified",
    });
  }

  if (["proposta_enviada", "convertido"].includes(lead.status)) {
    events.push({
      date: new Date(new Date(lead.created_at).getTime() + 259200000).toISOString(),
      type: "proposta",
      description: `Proposta enviada — R$ ${lead.valor_estimado.toLocaleString()}`,
      icon: "proposal",
    });
  }

  if (lead.status === "convertido") {
    events.push({
      date: lead.updated_at,
      type: "convertido",
      description: "Lead convertido em cliente",
      icon: "converted",
    });
  }

  if (lead.status === "perdido") {
    events.push({
      date: lead.updated_at,
      type: "perdido",
      description: "Lead perdido — sem retorno",
      icon: "lost",
    });
  }

  return events.reverse();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

const timelineIconMap: Record<string, React.ReactNode> = {
  create: <FileText className="h-3.5 w-3.5 text-info" />,
  contact: <MessageSquare className="h-3.5 w-3.5 text-warning" />,
  qualified: <Target className="h-3.5 w-3.5 text-primary" />,
  proposal: <DollarSign className="h-3.5 w-3.5 text-accent" />,
  converted: <CheckCircle2 className="h-3.5 w-3.5 text-success" />,
  lost: <ArrowRight className="h-3.5 w-3.5 text-destructive" />,
};

interface LeadDetailSheetProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadDetailSheet({ lead, open, onOpenChange }: LeadDetailSheetProps) {
  if (!lead) return null;

  const timeline = generateTimeline(lead);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[440px] p-0">
        <SheetHeader className="px-6 pt-6 pb-4">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-full bg-accent/15 flex items-center justify-center text-sm font-bold text-accent flex-shrink-0">
              {lead.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg text-left">{lead.nome}</SheetTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={lead.status === "novo" ? "default" : "outline"}
                  className={`text-[10px] ${statusColors[lead.status]}`}
                >
                  {statusLabels[lead.status]}
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  {origemLabels[lead.origem] || lead.origem}
                </Badge>
              </div>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-160px)]">
          <div className="px-6 space-y-5 pb-6">
            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs">
                <Phone className="h-3.5 w-3.5" /> Ligar
              </Button>
              <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs">
                <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
              </Button>
              <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs">
                <Mail className="h-3.5 w-3.5" /> Email
              </Button>
            </div>

            <Separator />

            {/* Lead Info */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Informações</h4>
              <div className="space-y-3">
                <InfoRow icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={lead.email} />
                <InfoRow icon={<Phone className="h-3.5 w-3.5" />} label="Telefone" value={lead.telefone} />
                <InfoRow icon={<Target className="h-3.5 w-3.5" />} label="Ramo de Interesse" value={lead.ramo_interesse} />
                <InfoRow icon={<DollarSign className="h-3.5 w-3.5" />} label="Valor Estimado" value={`R$ ${lead.valor_estimado.toLocaleString()}`} />
                <InfoRow
                  icon={<User className="h-3.5 w-3.5" />}
                  label="Corretor"
                  value={lead.corretor_responsavel || "Não atribuído"}
                  muted={!lead.corretor_responsavel}
                />
                <InfoRow icon={<Calendar className="h-3.5 w-3.5" />} label="Criado em" value={formatDate(lead.created_at)} />
                <InfoRow icon={<Clock className="h-3.5 w-3.5" />} label="Última atualização" value={formatDate(lead.updated_at)} />
              </div>
            </div>

            {lead.observacoes && (
              <>
                <Separator />
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Observações</h4>
                  <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3">{lead.observacoes}</p>
                </div>
              </>
            )}

            <Separator />

            {/* Timeline */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Histórico</h4>
              <div className="relative">
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
                <div className="space-y-4">
                  {timeline.map((event, i) => (
                    <div key={i} className="flex gap-3 relative">
                      <div className="h-6 w-6 rounded-full bg-background border border-border flex items-center justify-center flex-shrink-0 z-10">
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
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function InfoRow({ icon, label, value, muted }: { icon: React.ReactNode; label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-muted-foreground">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className={`text-sm font-medium truncate ${muted ? "text-muted-foreground italic" : "text-foreground"}`}>{value}</p>
      </div>
    </div>
  );
}
