import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle, Search, ChevronRight, ChevronLeft,
  CheckCircle2, XCircle, User, FileText, Car, Mail, Phone, MapPin,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────

interface Parcela {
  mes: string;
  status: "pago" | "pendente";
}

interface DadosCliente {
  cpfCnpj: string;
  email: string;
  telefone: string;
  celular: string;
  endereco: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
}

interface DadosApolice {
  numeroApolice: string;
  numeroProposta: string;
  seguradora: string;
  ramo: string;
  vigenciaInicio: string;
  vigenciaFim: string;
  premioTotal: string;
  premioLiquido: string;
  iof: string;
  comissao: string;
  formaPagamento: string;
  franquia: string;
  classeBonus: string;
  veiculo?: {
    fabricante: string;
    modelo: string;
    ano: string;
    placa: string;
    chassi: string;
    combustivel: string;
    fipe: string;
  };
}

interface ClientePendencia {
  id: number;
  nome: string;
  apolice: string;
  totalParcelas: number;
  parcelas: Parcela[];
  dadosCliente: DadosCliente;
  dadosApolice: DadosApolice;
}

// ── Mock Data ──────────────────────────────────────────────

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
    dadosCliente: {
      cpfCnpj: "123.456.789-00", email: "joao.silva@email.com", telefone: "(11) 3456-7890",
      celular: "(11) 99876-5432", endereco: "Rua das Flores, 123", bairro: "Centro",
      cidade: "São Paulo", uf: "SP", cep: "01001-000",
    },
    dadosApolice: {
      numeroApolice: "4521", numeroProposta: "P-8890", seguradora: "Porto Seguro",
      ramo: "Automóvel", vigenciaInicio: "01/04/2025", vigenciaFim: "01/04/2026",
      premioTotal: "R$ 3.200,00", premioLiquido: "R$ 2.800,00", iof: "R$ 220,00",
      comissao: "20%", formaPagamento: "12x cartão", franquia: "R$ 2.500,00", classeBonus: "5",
      veiculo: {
        fabricante: "Volkswagen", modelo: "Polo 1.0 TSI", ano: "2023",
        placa: "ABC-1D23", chassi: "9BWAA05U5LT000001", combustivel: "Flex", fipe: "R$ 85.000,00",
      },
    },
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
    dadosCliente: {
      cpfCnpj: "12.345.678/0001-90", email: "contato@abc.com.br", telefone: "(11) 2222-3333",
      celular: "(11) 98765-4321", endereco: "Av. Paulista, 1000, Sala 501", bairro: "Bela Vista",
      cidade: "São Paulo", uf: "SP", cep: "01310-100",
    },
    dadosApolice: {
      numeroApolice: "4520", numeroProposta: "P-8875", seguradora: "Tokio Marine",
      ramo: "Empresarial", vigenciaInicio: "01/06/2025", vigenciaFim: "01/06/2026",
      premioTotal: "R$ 8.500,00", premioLiquido: "R$ 7.200,00", iof: "R$ 540,00",
      comissao: "15%", formaPagamento: "12x boleto", franquia: "R$ 5.000,00", classeBonus: "-",
    },
  },
  {
    id: 3, nome: "Maria Santos", apolice: "#4519", totalParcelas: 6,
    parcelas: [
      { mes: "Out/25", status: "pago" }, { mes: "Nov/25", status: "pago" },
      { mes: "Dez/25", status: "pendente" }, { mes: "Jan/26", status: "pendente" },
      { mes: "Fev/26", status: "pendente" }, { mes: "Mar/26", status: "pendente" },
    ],
    dadosCliente: {
      cpfCnpj: "987.654.321-00", email: "maria.santos@email.com", telefone: "(21) 3333-4444",
      celular: "(21) 97654-3210", endereco: "Rua Copacabana, 456", bairro: "Copacabana",
      cidade: "Rio de Janeiro", uf: "RJ", cep: "22050-002",
    },
    dadosApolice: {
      numeroApolice: "4519", numeroProposta: "P-8860", seguradora: "Bradesco Seguros",
      ramo: "Automóvel", vigenciaInicio: "01/10/2025", vigenciaFim: "01/04/2026",
      premioTotal: "R$ 1.800,00", premioLiquido: "R$ 1.550,00", iof: "R$ 120,00",
      comissao: "18%", formaPagamento: "6x cartão", franquia: "R$ 3.000,00", classeBonus: "3",
      veiculo: {
        fabricante: "Honda", modelo: "Civic EXL", ano: "2022",
        placa: "DEF-5G67", chassi: "93HFC6830PZ000002", combustivel: "Flex", fipe: "R$ 130.000,00",
      },
    },
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
    dadosCliente: {
      cpfCnpj: "456.789.123-00", email: "carlos.mendes@email.com", telefone: "(31) 3555-6666",
      celular: "(31) 96543-2109", endereco: "Rua Savassi, 789", bairro: "Savassi",
      cidade: "Belo Horizonte", uf: "MG", cep: "30130-000",
    },
    dadosApolice: {
      numeroApolice: "4518", numeroProposta: "P-8845", seguradora: "SulAmérica",
      ramo: "Automóvel", vigenciaInicio: "01/04/2025", vigenciaFim: "01/04/2026",
      premioTotal: "R$ 4.100,00", premioLiquido: "R$ 3.600,00", iof: "R$ 280,00",
      comissao: "22%", formaPagamento: "12x débito", franquia: "R$ 2.000,00", classeBonus: "7",
      veiculo: {
        fabricante: "Toyota", modelo: "Corolla XEi", ano: "2024",
        placa: "GHI-8J01", chassi: "9BR53ZEC5R0000003", combustivel: "Flex", fipe: "R$ 155.000,00",
      },
    },
  },
];

// ── Detail Field Component ─────────────────────────────────

const DetailField = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1">
    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
    <p className="text-sm font-medium text-foreground">{value}</p>
  </div>
);

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

          {/* Painel de detalhes com Tabs */}
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
                  <Tabs defaultValue="pendencias" className="w-full">
                    <TabsList className="w-full grid grid-cols-3">
                      <TabsTrigger value="pendencias" className="text-xs gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5" /> Pendências
                      </TabsTrigger>
                      <TabsTrigger value="cliente" className="text-xs gap-1.5">
                        <User className="h-3.5 w-3.5" /> Cliente
                      </TabsTrigger>
                      <TabsTrigger value="apolice" className="text-xs gap-1.5">
                        <FileText className="h-3.5 w-3.5" /> Apólice
                      </TabsTrigger>
                    </TabsList>

                    {/* ── Tab: Pendências ── */}
                    <TabsContent value="pendencias">
                      {/* Progress bar */}
                      <div className="mb-6 mt-2">
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
                            <div className={`flex-1 flex items-center justify-between py-2 px-3 rounded-lg transition-colors ${
                              p.status === "pago" ? "group-hover:bg-success/5" : "group-hover:bg-destructive/5"
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
                    </TabsContent>

                    {/* ── Tab: Cliente ── */}
                    <TabsContent value="cliente">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-2">
                        <DetailField label="CPF / CNPJ" value={selectedClient.dadosCliente.cpfCnpj} />
                        <DetailField label="E-mail" value={selectedClient.dadosCliente.email} />
                        <DetailField label="Telefone" value={selectedClient.dadosCliente.telefone} />
                        <DetailField label="Celular" value={selectedClient.dadosCliente.celular} />
                        <div className="sm:col-span-2">
                          <DetailField
                            label="Endereço"
                            value={`${selectedClient.dadosCliente.endereco}, ${selectedClient.dadosCliente.bairro}`}
                          />
                        </div>
                        <DetailField label="Cidade / UF" value={`${selectedClient.dadosCliente.cidade} - ${selectedClient.dadosCliente.uf}`} />
                        <DetailField label="CEP" value={selectedClient.dadosCliente.cep} />
                      </div>
                    </TabsContent>

                    {/* ── Tab: Apólice ── */}
                    <TabsContent value="apolice">
                      <div className="space-y-6 mt-2">
                        {/* Dados da apólice */}
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5" /> Dados da Apólice
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            <DetailField label="Nº Apólice" value={selectedClient.dadosApolice.numeroApolice} />
                            <DetailField label="Nº Proposta" value={selectedClient.dadosApolice.numeroProposta} />
                            <DetailField label="Seguradora" value={selectedClient.dadosApolice.seguradora} />
                            <DetailField label="Ramo" value={selectedClient.dadosApolice.ramo} />
                            <DetailField label="Vigência Início" value={selectedClient.dadosApolice.vigenciaInicio} />
                            <DetailField label="Vigência Fim" value={selectedClient.dadosApolice.vigenciaFim} />
                            <DetailField label="Prêmio Total" value={selectedClient.dadosApolice.premioTotal} />
                            <DetailField label="Prêmio Líquido" value={selectedClient.dadosApolice.premioLiquido} />
                            <DetailField label="IOF" value={selectedClient.dadosApolice.iof} />
                            <DetailField label="Comissão" value={selectedClient.dadosApolice.comissao} />
                            <DetailField label="Forma de Pagamento" value={selectedClient.dadosApolice.formaPagamento} />
                            <DetailField label="Franquia" value={selectedClient.dadosApolice.franquia} />
                            <DetailField label="Classe de Bônus" value={selectedClient.dadosApolice.classeBonus} />
                          </div>
                        </div>

                        {/* Dados do veículo */}
                        {selectedClient.dadosApolice.veiculo && (
                          <div>
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                              <Car className="h-3.5 w-3.5" /> Veículo
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                              <DetailField label="Fabricante" value={selectedClient.dadosApolice.veiculo.fabricante} />
                              <DetailField label="Modelo" value={selectedClient.dadosApolice.veiculo.modelo} />
                              <DetailField label="Ano" value={selectedClient.dadosApolice.veiculo.ano} />
                              <DetailField label="Placa" value={selectedClient.dadosApolice.veiculo.placa} />
                              <DetailField label="Chassi" value={selectedClient.dadosApolice.veiculo.chassi} />
                              <DetailField label="Combustível" value={selectedClient.dadosApolice.veiculo.combustivel} />
                              <DetailField label="Valor FIPE" value={selectedClient.dadosApolice.veiculo.fipe} />
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground">
                <AlertCircle className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm">Selecione um cliente para ver os detalhes</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Financeiro;
