import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertCircle, Search, ChevronRight, ChevronLeft,
  CheckCircle2, XCircle, User,
} from "lucide-react";

// ── Mock Data ──────────────────────────────────────────────

interface ClientePendencia {
  id: number;
  nome: string;
  apolice: string;
  totalParcelas: number;
  parcelas: { mes: string; status: "pago" | "pendente" }[];
}

const clientesMock: ClientePendencia[] = [
  {
    id: 1, nome: "João Silva", apolice: "#4521", totalParcelas: 12,
    parcelas: [
      { mes: "Abr/25", status: "pago" }, { mes: "Mai/25", status: "pago" },
      { mes: "Jun/25", status: "pago" }, { mes: "Jul/25", status: "pago" },
      { mes: "Ago/25", status: "pago" }, { mes: "Set/25", status: "pago" },
      { mes: "Out/25", status: "pago" }, { mes: "Nov/25", status: "pago" },
      { mes: "Dez/25", status: "pago" }, { mes: "Jan/26", status: "pago" },
      { mes: "Fev/26", status: "pendente" }, { mes: "Mar/26", status: "pendente" },
    ],
  },
  {
    id: 2, nome: "Empresa ABC Ltda", apolice: "#4520", totalParcelas: 12,
    parcelas: [
      { mes: "Jun/25", status: "pago" }, { mes: "Jul/25", status: "pago" },
      { mes: "Ago/25", status: "pago" }, { mes: "Set/25", status: "pago" },
      { mes: "Out/25", status: "pago" }, { mes: "Nov/25", status: "pendente" },
      { mes: "Dez/25", status: "pago" }, { mes: "Jan/26", status: "pago" },
      { mes: "Fev/26", status: "pendente" }, { mes: "Mar/26", status: "pendente" },
      { mes: "Abr/26", status: "pendente" }, { mes: "Mai/26", status: "pendente" },
    ],
  },
  {
    id: 3, nome: "Maria Santos", apolice: "#4519", totalParcelas: 6,
    parcelas: [
      { mes: "Out/25", status: "pago" }, { mes: "Nov/25", status: "pago" },
      { mes: "Dez/25", status: "pendente" }, { mes: "Jan/26", status: "pendente" },
      { mes: "Fev/26", status: "pendente" }, { mes: "Mar/26", status: "pendente" },
    ],
  },
  {
    id: 4, nome: "Carlos Mendes", apolice: "#4518", totalParcelas: 12,
    parcelas: [
      { mes: "Abr/25", status: "pago" }, { mes: "Mai/25", status: "pago" },
      { mes: "Jun/25", status: "pago" }, { mes: "Jul/25", status: "pago" },
      { mes: "Ago/25", status: "pago" }, { mes: "Set/25", status: "pago" },
      { mes: "Out/25", status: "pago" }, { mes: "Nov/25", status: "pago" },
      { mes: "Dez/25", status: "pago" }, { mes: "Jan/26", status: "pago" },
      { mes: "Fev/26", status: "pago" }, { mes: "Mar/26", status: "pendente" },
    ],
  },
  {
    id: 5, nome: "Fernanda Costa", apolice: "#4517", totalParcelas: 12,
    parcelas: [
      { mes: "Abr/25", status: "pago" }, { mes: "Mai/25", status: "pago" },
      { mes: "Jun/25", status: "pago" }, { mes: "Jul/25", status: "pendente" },
      { mes: "Ago/25", status: "pendente" }, { mes: "Set/25", status: "pago" },
      { mes: "Out/25", status: "pago" }, { mes: "Nov/25", status: "pago" },
      { mes: "Dez/25", status: "pago" }, { mes: "Jan/26", status: "pago" },
      { mes: "Fev/26", status: "pago" }, { mes: "Mar/26", status: "pendente" },
    ],
  },
  {
    id: 6, nome: "Indústria XYZ S/A", apolice: "#4514", totalParcelas: 12,
    parcelas: [
      { mes: "Abr/25", status: "pago" }, { mes: "Mai/25", status: "pago" },
      { mes: "Jun/25", status: "pago" }, { mes: "Jul/25", status: "pago" },
      { mes: "Ago/25", status: "pago" }, { mes: "Set/25", status: "pago" },
      { mes: "Out/25", status: "pago" }, { mes: "Nov/25", status: "pago" },
      { mes: "Dez/25", status: "pago" }, { mes: "Jan/26", status: "pago" },
      { mes: "Fev/26", status: "pago" }, { mes: "Mar/26", status: "pago" },
    ],
  },
];

// ── Page ────────────────────────────────────────────────────

const Financeiro = () => {
  const [search, setSearch] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  const filtered = clientesMock.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.apolice.toLowerCase().includes(search.toLowerCase())
  );

  const selectedClient = clientesMock.find((c) => c.id === selectedClientId);

  const getPendentesCount = (c: ClientePendencia) =>
    c.parcelas.filter((p) => p.status === "pendente").length;

  const getPagosCount = (c: ClientePendencia) =>
    c.parcelas.filter((p) => p.status === "pago").length;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-foreground">Financeiro</h2>
          <p className="text-sm text-muted-foreground">Pendências de pagamento dos clientes</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Clientes</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{clientesMock.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Com Pendências</p>
              <p className="mt-1 text-2xl font-bold text-destructive">
                {clientesMock.filter((c) => getPendentesCount(c) > 0).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Em Dia</p>
              <p className="mt-1 text-2xl font-bold text-success">
                {clientesMock.filter((c) => getPendentesCount(c) === 0).length}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de clientes */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Clientes
              </CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar cliente..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 max-h-[500px] overflow-y-auto">
              {filtered.map((c) => {
                const pendentes = getPendentesCount(c);
                const isSelected = selectedClientId === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedClientId(c.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left border-b border-border transition-colors hover:bg-muted/50 ${
                      isSelected ? "bg-primary/5 border-l-2 border-l-primary" : ""
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{c.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        Apólice {c.apolice} · {c.totalParcelas}x
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {pendentes > 0 ? (
                        <Badge variant="outline" className="text-[10px] border-destructive text-destructive">
                          {pendentes} pendente{pendentes > 1 ? "s" : ""}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] border-success text-success">
                          Em dia
                        </Badge>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  Nenhum cliente encontrado
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline de parcelas */}
          <Card className="lg:col-span-2">
            {selectedClient ? (
              <>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 lg:hidden"
                      onClick={() => setSelectedClientId(null)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                      <CardTitle className="text-base font-semibold">{selectedClient.nome}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Apólice {selectedClient.apolice} · {selectedClient.totalParcelas} parcelas ·{" "}
                        <span className="text-success">{getPagosCount(selectedClient)} pagas</span> ·{" "}
                        <span className="text-destructive">{getPendentesCount(selectedClient)} pendentes</span>
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Progress bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                      <span>Progresso de pagamento</span>
                      <span>{Math.round((getPagosCount(selectedClient) / selectedClient.totalParcelas) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-success rounded-full transition-all"
                        style={{ width: `${(getPagosCount(selectedClient) / selectedClient.totalParcelas) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-0">
                    {selectedClient.parcelas.map((p, i) => (
                      <div key={i} className="flex items-center gap-4 group">
                        {/* Linha vertical + ícone */}
                        <div className="flex flex-col items-center">
                          {i > 0 && (
                            <div className={`w-0.5 h-4 ${
                              selectedClient.parcelas[i - 1].status === "pago" ? "bg-success/30" : "bg-destructive/30"
                            }`} />
                          )}
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                            p.status === "pago"
                              ? "bg-success/10 text-success"
                              : "bg-destructive/10 text-destructive"
                          }`}>
                            {p.status === "pago" ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                          </div>
                          {i < selectedClient.parcelas.length - 1 && (
                            <div className={`w-0.5 h-4 ${
                              p.status === "pago" ? "bg-success/30" : "bg-destructive/30"
                            }`} />
                          )}
                        </div>

                        {/* Info */}
                        <div className={`flex-1 flex items-center justify-between py-2 px-3 rounded-lg transition-colors ${
                          p.status === "pago"
                            ? "group-hover:bg-success/5"
                            : "group-hover:bg-destructive/5"
                        }`}>
                          <div>
                            <p className="text-sm font-medium">Parcela {i + 1}/{selectedClient.totalParcelas}</p>
                            <p className="text-xs text-muted-foreground">{p.mes}</p>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              p.status === "pago"
                                ? "border-success text-success bg-success/5"
                                : "border-destructive text-destructive bg-destructive/5"
                            }`}
                          >
                            {p.status === "pago" ? "Pago" : "Não pago"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground">
                <AlertCircle className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm">Selecione um cliente para ver a timeline de parcelas</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Financeiro;
