import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ApoliceData {
  id: string;
  cliente: string;
  ramo: string;
  seguradora: string;
  inicio: string;
  fim: string;
  premio: string;
  comissao: string;
  status: string;
}

interface ApoliceDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apolice: ApoliceData | null;
}

export function ApoliceDetailSheet({ open, onOpenChange, apolice }: ApoliceDetailSheetProps) {
  if (!apolice) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[480px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <div>
            <SheetTitle className="text-lg">Apólice {apolice.id}</SheetTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-[10px]">{apolice.ramo}</Badge>
              <Badge variant="outline" className={`text-[10px] ${
                apolice.status === "Vigente" ? "border-success text-success" : "border-destructive text-destructive"
              }`}>{apolice.status}</Badge>
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
                <span className="font-medium">{apolice.cliente}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seguradora</span>
                <span>{apolice.seguradora}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ramo</span>
                <span>{apolice.ramo}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Vigência</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Início</span>
                <span>{apolice.inicio}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fim</span>
                <span>{apolice.fim}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Valores</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border p-3 text-center">
                <p className="text-xl font-bold text-foreground">{apolice.premio}</p>
                <p className="text-xs text-muted-foreground">Prêmio</p>
              </div>
              <div className="rounded-lg border border-border p-3 text-center">
                <p className="text-xl font-bold text-success">{apolice.comissao}</p>
                <p className="text-xs text-muted-foreground">Comissão</p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
