import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Plus, Filter, MoreHorizontal, Eye, Pencil, Trash2, FileText, Download, RefreshCw, Loader2 } from "lucide-react";
import { ApoliceDetailSheet } from "@/components/apolices/ApoliceDetailSheet";
import { NovaApoliceDialog } from "@/components/apolices/NovaApoliceDialog";
import { toast } from "@/hooks/use-toast";
import { useApolices } from "@/hooks/useApolices";
import type { ApoliceFormatted } from "@/services/apolicesService";

const Apolices = () => {
  const [search, setSearch] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedApolice, setSelectedApolice] = useState<ApoliceFormatted | null>(null);
  const [novaOpen, setNovaOpen] = useState(false);

  const { data: apolices = [], isLoading, isError } = useApolices();

  const filtered = apolices.filter(a =>
    a.cliente.toLowerCase().includes(search.toLowerCase()) ||
    a.id.includes(search) ||
    a.placa.toLowerCase().includes(search.toLowerCase()) ||
    a.seguradora.toLowerCase().includes(search.toLowerCase())
  );

  const handleView = (a: ApoliceFormatted) => {
    setSelectedApolice(a);
    setDetailOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Apólices</h2>
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Carregando..." : `${apolices.length} apólices registradas`}
            </p>
          </div>
          <Button onClick={() => setNovaOpen(true)} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="h-4 w-4" />
            Nova Apólice
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar por cliente, nº, placa ou seguradora..." className="pl-9 h-9 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-3.5 w-3.5" /> Filtros
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Carregando apólices...</span>
              </div>
            ) : isError ? (
              <div className="flex items-center justify-center py-16 text-destructive text-sm">
                Erro ao carregar apólices. Tente novamente.
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
                Nenhuma apólice encontrada.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nº Apólice</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cliente</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Placa</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Seguradora</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Vigência</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Prêmio</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Comissão</th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((a, i) => (
                      <tr key={`${a.id}-${i}`} className="border-b border-border hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">{a.id}</td>
                        <td className="px-4 py-3 font-medium">{a.cliente}</td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{a.placa}</td>
                        <td className="px-4 py-3 text-muted-foreground">{a.seguradora}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{a.inicio} a {a.fim}</td>
                        <td className="px-4 py-3 text-right font-semibold">{a.premio}</td>
                        <td className="px-4 py-3 text-right text-success font-medium">{a.comissao || "—"}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="outline" className={`text-[10px] ${
                            a.status === "Vigente" ? "border-success text-success" : "border-destructive text-destructive"
                          }`}>{a.status}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-[160px]">
                              <DropdownMenuItem className="text-xs gap-2" onClick={() => handleView(a)}>
                                <Eye className="h-3.5 w-3.5" /> Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-xs gap-2" onClick={() => toast({ title: "Editar apólice", description: a.id })}>
                                <Pencil className="h-3.5 w-3.5" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-xs gap-2" onClick={() => toast({ title: "Documentos", description: `Documentos da apólice ${a.id}` })}>
                                <FileText className="h-3.5 w-3.5" /> Documentos
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-xs gap-2" onClick={() => toast({ title: "Download", description: `Baixando apólice ${a.id}` })}>
                                <Download className="h-3.5 w-3.5" /> Baixar PDF
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-xs gap-2" onClick={() => toast({ title: "Renovar", description: `Iniciar renovação da apólice ${a.id}` })}>
                                <RefreshCw className="h-3.5 w-3.5" /> Renovar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-xs gap-2 text-destructive" onClick={() => toast({ title: "Cancelar", description: `Apólice ${a.id} seria cancelada`, variant: "destructive" })}>
                                <Trash2 className="h-3.5 w-3.5" /> Cancelar apólice
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ApoliceDetailSheet open={detailOpen} onOpenChange={setDetailOpen} apolice={selectedApolice} />
      <NovaApoliceDialog open={novaOpen} onOpenChange={setNovaOpen} />
    </AppLayout>
  );
};

export default Apolices;
