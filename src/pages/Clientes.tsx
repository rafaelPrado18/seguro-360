import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, MoreHorizontal, Mail, Car } from "lucide-react";
import { NewClientDialog } from "@/components/clientes/NewClientDialog";

const clientesData = [
  { id: 1, nome: "João Silva", cpf: "123.456.789-00", email: "joao@email.com", telefone: "(11) 99999-1234", tipo: "PF", apolices: 3, status: "Ativo", premio: "R$ 8.500", veiculos: [{ modelo: "Civic 2.0", ano: "2023", placa: "ABC1D23" }, { modelo: "HR-V", ano: "2024", placa: "DEF4G56" }] },
  { id: 2, nome: "Empresa ABC Ltda", cpf: "12.345.678/0001-90", email: "contato@abc.com", telefone: "(11) 3333-4567", tipo: "PJ", apolices: 5, status: "Ativo", premio: "R$ 45.000", veiculos: [{ modelo: "Hilux 2.8", ano: "2024", placa: "GHI7J89" }] },
  { id: 3, nome: "Maria Santos", cpf: "987.654.321-00", email: "maria@email.com", telefone: "(21) 98888-5678", tipo: "PF", apolices: 2, status: "Ativo", premio: "R$ 5.200", veiculos: [{ modelo: "Onix 1.0", ano: "2022", placa: "JKL0M12" }] },
  { id: 4, nome: "Carlos Mendes", cpf: "456.789.123-00", email: "carlos@email.com", telefone: "(31) 97777-9012", tipo: "PF", apolices: 1, status: "Inativo", premio: "R$ 3.200", veiculos: [{ modelo: "Gol 1.6", ano: "2020", placa: "NOP3Q45" }] },
  { id: 5, nome: "Fernanda Costa", cpf: "321.654.987-00", email: "fernanda@email.com", telefone: "(41) 96666-3456", tipo: "PF", apolices: 4, status: "Ativo", premio: "R$ 12.800", veiculos: [{ modelo: "Corolla 2.0", ano: "2024", placa: "RST6U78" }, { modelo: "SW4", ano: "2023", placa: "VWX9Y01" }] },
  { id: 6, nome: "Indústria XYZ S/A", cpf: "98.765.432/0001-10", email: "rh@xyz.com", telefone: "(11) 4444-7890", tipo: "PJ", apolices: 8, status: "Ativo", premio: "R$ 120.000", veiculos: [{ modelo: "Sprinter 415", ano: "2024", placa: "ZAB2C34" }] },
  { id: 7, nome: "Roberto Lima", cpf: "654.321.987-00", email: "roberto@email.com", telefone: "(51) 95555-1234", tipo: "PF", apolices: 2, status: "Ativo", premio: "R$ 6.300", veiculos: [{ modelo: "Tracker 1.2", ano: "2023", placa: "DEF5G67" }] },
  { id: 8, nome: "Ana Souza", cpf: "789.123.456-00", email: "ana@email.com", telefone: "(61) 94444-5678", tipo: "PF", apolices: 1, status: "Prospecto", premio: "R$ 1.800", veiculos: [] },
];

const Clientes = () => {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = clientesData.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.cpf.includes(search) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Clientes</h2>
            <p className="text-sm text-muted-foreground">{clientesData.length} clientes cadastrados</p>
          </div>
          <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo Cliente
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, CPF/CNPJ ou email..."
                  className="pl-9 h-9 text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
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
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cliente</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">CPF/CNPJ</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Contato</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Tipo</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Veículos</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Apólices</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Prêmio Total</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => (
                    <tr key={c.id} className="border-b border-border hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {c.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                          <span className="font-medium text-foreground">{c.nome}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{c.cpf}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{c.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={c.tipo === "PJ" ? "default" : "secondary"} className="text-[10px]">{c.tipo}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Car className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">{c.veiculos.length}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-medium">{c.apolices}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="outline" className={`text-[10px] ${
                          c.status === "Ativo" ? "border-success text-success" :
                          c.status === "Inativo" ? "border-destructive text-destructive" :
                          "border-info text-info"
                        }`}>{c.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">{c.premio}</td>
                      <td className="px-4 py-3 text-center">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <NewClientDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </AppLayout>
  );
};

export default Clientes;
