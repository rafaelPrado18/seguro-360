import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface SinistroData {
  id: string;
  apolice: string;
  cliente: string;
  tipo: string;
  dataAbertura: string;
  valor: string;
  status: string;
  prioridade: string;
  telefone: string;
}

interface SinistroDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sinistro: SinistroData | null;
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

export function SinistroDetailSheet({ open, onOpenChange, sinistro }: SinistroDetailSheetProps) {
  if (!sinistro) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[480px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <div>
            <SheetTitle className="text-lg">Sinistro {sinistro.id}</SheetTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={`text-[10px] ${prioridadeColor(sinistro.prioridade)}`}>{sinistro.prioridade}</Badge>
              <Badge variant="outline" className={`text-[10px] ${statusColor(sinistro.status)}`}>{sinistro.status}</Badge>
            </div>
          </div>
        </SheetHeader>

        <Separator />

        <div className="space-y-5 py-5">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Informações Gerais</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cliente</span>
                <span className="font-medium">{sinistro.cliente}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Apólice</span>
                <span className="font-mono">{sinistro.apolice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo</span>
                <span>{sinistro.tipo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data de Abertura</span>
                <span>{sinistro.dataAbertura}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Telefone</span>
                <span>{sinistro.telefone}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Valores</h4>
            <div className="rounded-lg border border-border p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{sinistro.valor}</p>
              <p className="text-xs text-muted-foreground">Valor Estimado</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
