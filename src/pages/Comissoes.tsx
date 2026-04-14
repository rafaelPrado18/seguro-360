import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Users, FileText, Download, Loader2 } from "lucide-react";
import { useComissoes } from "@/hooks/useComissoes";

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const Comissoes = () => {
  const { data, loading, filtroResponsavel, setFiltroResponsavel } = useComissoes();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Comissões</h2>
            <p className="text-sm text-muted-foreground">Acompanhamento de comissões por consultor</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={filtroResponsavel} onValueChange={(v) => setFiltroResponsavel(v === "todos" ? "" : v)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todos os consultores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os consultores</SelectItem>
                {data?.por_usuario.map((u) => (
                  <SelectItem key={u.responsavel} value={u.responsavel}>{u.responsavel}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Exportar</Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !data ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground">Nenhum dado encontrado.</CardContent></Card>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card className="kpi-card-shadow">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Comissão</p>
                      <p className="mt-1 text-2xl font-bold">{formatCurrency(data.resumo_geral.total_comissao)}</p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card-shadow">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Prêmio Líquido</p>
                      <p className="mt-1 text-2xl font-bold">{formatCurrency(data.resumo_geral.total_premio_liquido)}</p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card-shadow">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Registros</p>
                      <p className="mt-1 text-2xl font-bold">{data.resumo_geral.total_registros}</p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-secondary/50 flex items-center justify-center">
                      <Users className="h-5 w-5 text-secondary-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Por Consultor */}
            {!filtroResponsavel && data.por_usuario.length > 1 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Comissão por Consultor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {data.por_usuario.map((u) => (
                      <div
                        key={u.responsavel}
                        className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => setFiltroResponsavel(u.responsavel)}
                      >
                        <p className="font-semibold text-sm">{u.responsavel}</p>
                        <p className="text-xs text-muted-foreground">{u.total_clientes} cliente(s)</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Comissão</span>
                          <span className="font-bold text-sm text-accent">{formatCurrency(u.total_comissao)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Prêmio Líq.</span>
                          <span className="text-sm">{formatCurrency(u.total_premio_liquido)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tabela */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Detalhamento</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cliente</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">CPF</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Responsável</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Apólice</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Seguradora</th>
                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Prêmio Líq.</th>
                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">%</th>
                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Comissão</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.registros.map((c, i) => (
                        <tr key={c.client_id + c.numero_apolice} className="border-b border-border hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                          <td className="px-4 py-3 font-medium">{c.cliente}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs font-mono">{c.cpf}</td>
                          <td className="px-4 py-3"><Badge variant="secondary" className="text-[10px]">{c.responsavel}</Badge></td>
                          <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">{c.numero_apolice}</td>
                          <td className="px-4 py-3 text-muted-foreground">{c.seguradora}</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(c.premio_liquido)}</td>
                          <td className="px-4 py-3 text-center text-muted-foreground">{c.comissao_percentual}%</td>
                          <td className="px-4 py-3 text-right font-semibold text-accent">{formatCurrency(c.comissao_valor)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Comissoes;
