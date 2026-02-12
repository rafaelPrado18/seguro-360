import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Car } from "lucide-react";

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
  endereco?: string;
  cep?: string;
  premioLiquido?: string;
  numeroParcelas?: number;
  valorParcela?: string;
  numeroProposta?: string;
  numeroApolice?: string;
  codigoCi?: string;
  vigencia?: string;
  comissao?: string;
}

interface ClientDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: ClientData | null;
}

export function ClientDetailSheet({ open, onOpenChange, client }: ClientDetailSheetProps) {
  if (!client) return null;

  const fields = [
    { label: "Nome", value: client.nome },
    { label: "CPF/CNPJ", value: client.cpf },
    { label: "Telefone", value: client.telefone },
    { label: "Endereço", value: client.endereco || "—" },
    { label: "CEP", value: client.cep || "—" },
    { label: "Prêmio", value: client.premio },
    { label: "Prêmio Líquido", value: client.premioLiquido || "—" },
    { label: "Nº de Parcelas", value: client.numeroParcelas?.toString() || "—" },
    { label: "Valor da Parcela", value: client.valorParcela || "—" },
    { label: "Nº da Proposta", value: client.numeroProposta || "—" },
    { label: "Nº da Apólice", value: client.numeroApolice || "—" },
    { label: "Código C.I", value: client.codigoCi || "—" },
    { label: "Vigência", value: client.vigencia || "—" },
    { label: "Comissão", value: client.comissao || "—" },
  ];

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
            <h4 className="text-sm font-semibold text-foreground mb-3">Dados do Cliente</h4>
            <div className="space-y-2 text-sm">
              {fields.map((f) => (
                <div key={f.label} className="flex justify-between py-1">
                  <span className="text-muted-foreground">{f.label}</span>
                  <span className="font-medium text-right max-w-[60%]">{f.value}</span>
                </div>
              ))}
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
