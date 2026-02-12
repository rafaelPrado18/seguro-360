import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Car, Mail, Phone, MapPin } from "lucide-react";

interface ClientData {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  tipo: string;
  apolices: number;
  status: string;
  premio: string;
  veiculos: { modelo: string; ano: string; placa: string }[];
}

interface ClientDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: ClientData | null;
}

export function ClientDetailSheet({ open, onOpenChange, client }: ClientDetailSheetProps) {
  if (!client) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[480px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
              {client.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <SheetTitle className="text-lg">{client.nome}</SheetTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={client.tipo === "PJ" ? "default" : "secondary"} className="text-[10px]">{client.tipo}</Badge>
                <Badge variant="outline" className={`text-[10px] ${
                  client.status === "Ativo" ? "border-success text-success" :
                  client.status === "Inativo" ? "border-destructive text-destructive" :
                  "border-info text-info"
                }`}>{client.status}</Badge>
              </div>
            </div>
          </div>
        </SheetHeader>

        <Separator />

        <div className="space-y-5 py-5">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Dados Pessoais</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">CPF/CNPJ</span>
                <span className="font-mono">{client.cpf}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> Email</span>
                <span>{client.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> Telefone</span>
                <span>{client.telefone}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Resumo do Seguro</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border p-3 text-center">
                <p className="text-2xl font-bold text-primary">{client.apolices}</p>
                <p className="text-xs text-muted-foreground">Apólices</p>
              </div>
              <div className="rounded-lg border border-border p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{client.premio}</p>
                <p className="text-xs text-muted-foreground">Prêmio Total</p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Car className="h-4 w-4" /> Veículos ({client.veiculos.length})
            </h4>
            {client.veiculos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum veículo cadastrado.</p>
            ) : (
              <div className="space-y-2">
                {client.veiculos.map((v, i) => (
                  <div key={i} className="rounded-lg border border-border bg-muted/30 p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{v.modelo}</p>
                      <p className="text-xs text-muted-foreground">Ano: {v.ano}</p>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs">{v.placa}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
