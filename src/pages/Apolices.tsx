import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Plus, Filter, MoreHorizontal, Eye, Pencil, Trash2, FileText, Download, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const apolicesData = [
  { id: "#4521", cliente: "João Silva", ramo: "Auto", seguradora: "Porto Seguro", inicio: "15/01/2026", fim: "15/01/2027", premio: "R$ 3.200", comissao: "R$ 480", status: "Vigente" },
  { id: "#4520", cliente: "Empresa ABC Ltda", ramo: "Empresarial", seguradora: "Allianz", inicio: "10/01/2026", fim: "10/01/2027", premio: "R$ 25.000", comissao: "R$ 3.750", status: "Vigente" },
  { id: "#4519", cliente: "Maria Santos", ramo: "Vida", seguradora: "SulAmérica", inicio: "05/01/2026", fim: "05/01/2027", premio: "R$ 1.800", comissao: "R$ 540", status: "Vigente" },
  { id: "#4518", cliente: "Carlos Mendes", ramo: "Auto", seguradora: "Bradesco Seguros", inicio: "20/12/2025", fim: "20/12/2026", premio: "R$ 4.100", comissao: "R$ 615", status: "Vigente" },
  { id: "#4517", cliente: "Fernanda Costa", ramo: "Residencial", seguradora: "Tokio Marine", inicio: "15/12/2025", fim: "15/12/2026", premio: "R$ 2.500", comissao: "R$ 500", status: "Vigente" },
  { id: "#4516", cliente: "Roberto Lima", ramo: "Vida", seguradora: "MetLife", inicio: "01/12/2025", fim: "01/12/2026", premio: "R$ 3.800", comissao: "R$ 760", status: "Vigente" },
  { id: "#4515", cliente: "Ana Souza", ramo: "Auto", seguradora: "HDI", inicio: "20/11/2025", fim: "20/11/2026", premio: "R$ 2.900", comissao: "R$ 435", status: "Cancelada" },
  { id: "#4514", cliente: "Indústria XYZ S/A", ramo: "Empresarial", seguradora: "Zurich", inicio: "10/11/2025", fim: "10/11/2026", premio: "R$ 85.000", comissao: "R$ 12.750", status: "Vigente" },
];

const Apolices = () => {
  const [search, setSearch] = useState("");

  const filtered = apolicesData.filter(a =>
    a.cliente.toLowerCase().includes(search.toLowerCase()) ||
    a.id.includes(search) ||
    a.ramo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Apólices</h2>
            <p className="text-sm text-muted-foreground">{apolicesData.length} apólices registradas</p>
          </div>
          <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="h-4 w-4" />
            Nova Apólice
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar por cliente, nº ou ramo..." className="pl-9 h-9 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-3.5 w-3.5" /> Filtros
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nº</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cliente</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ramo</th>
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
                    <tr key={a.id} className="border-b border-border hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">{a.id}</td>
                      <td className="px-4 py-3 font-medium">{a.cliente}</td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="text-[10px]">{a.ramo}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{a.seguradora}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{a.inicio} a {a.fim}</td>
                      <td className="px-4 py-3 text-right font-semibold">{a.premio}</td>
                      <td className="px-4 py-3 text-right text-success font-medium">{a.comissao}</td>
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
                            <DropdownMenuItem className="text-xs gap-2" onClick={() => toast({ title: "Ver apólice", description: `Apólice ${a.id} - ${a.cliente}` })}>
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
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Apolices;
