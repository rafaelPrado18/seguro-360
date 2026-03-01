import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Plus, Filter, MoreHorizontal, Mail, Car, Eye, Pencil, Trash2, Phone, MessageSquare, Loader2 } from "lucide-react";
import { NewClientDialog } from "@/components/clientes/NewClientDialog";
import { ClientDetailSheet } from "@/components/clientes/ClientDetailSheet";
import { toast } from "@/hooks/use-toast";
import { useClients, useDeleteClient } from "@/hooks/useClients";
import type { Client } from "@/services/clientService";
import { Skeleton } from "@/components/ui/skeleton";

const Clientes = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);

  const { data: clients = [], isLoading, isError } = useClients();
  const deleteClientMutation = useDeleteClient();

  const filtered = clients.filter(c =>
    c.nome?.toLowerCase().includes(search.toLowerCase()) ||
    c.cpf?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleView = (c: Client) => {
    setSelectedClient(c);
    setDetailOpen(true);
  };

  const handleEdit = (c: Client) => {
    setEditClient(c);
    setDialogOpen(true);
  };

  const handleNewClient = () => {
    setEditClient(null);
    setDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteClientMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast({ title: "Cliente excluído", description: `${deleteTarget.nome} foi removido com sucesso.` });
        setDeleteTarget(null);
      },
      onError: () => {
        toast({ title: "Erro ao excluir", description: "Não foi possível excluir o cliente.", variant: "destructive" });
      },
    });
  };

  const getInitials = (nome: string) =>
    (nome || "").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Clientes</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isLoading ? "Carregando..." : `${clients.length} clientes cadastrados`}
            </p>
          </div>
          <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 self-start sm:self-auto" onClick={handleNewClient}>
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
            {isLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : isError ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Erro ao carregar clientes. Tente novamente.
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                {search ? "Nenhum cliente encontrado para a busca." : "Nenhum cliente cadastrado."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cliente</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">CPF/CNPJ</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Contato</th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">Veículo</th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">Apólice</th>
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
                              {getInitials(c.nome)}
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
                          <div className="flex items-center justify-center gap-1">
                            <Car className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-medium text-xs">{c.vehicles[0]?.vehicle.veiculo_modelo || "—"}</span>
                            {c.vehicles.length > 1 && (
                              <Badge variant="secondary" className="text-[9px] ml-1">+{c.vehicles.length - 1}</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center font-medium text-xs">{c.vehicles[0]?.financial.numero_apolice || "—"}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="outline" className={`text-[10px] ${
                            c.lead_status === "Ativo" ? "border-success text-success" :
                            c.lead_status === "Inativo" ? "border-destructive text-destructive" :
                            "border-info text-info"
                          }`}>{c.lead_status || "—"}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">{c.vehicles[0]?.financial.premio_total || "—"}</td>
                        <td className="px-4 py-3 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-[160px]">
                              <DropdownMenuItem className="text-xs gap-2" onClick={() => handleView(c)}>
                                <Eye className="h-3.5 w-3.5" /> Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-xs gap-2" onClick={() => handleEdit(c)}>
                                <Pencil className="h-3.5 w-3.5" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-xs gap-2" onClick={() => window.open(`tel:${c.telefone || c.celular}`)}>
                                <Phone className="h-3.5 w-3.5" /> Ligar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-xs gap-2" onClick={() => navigate("/whatsapp")}>
                                <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-xs gap-2" onClick={() => window.open(`mailto:${c.email}`)}>
                                <Mail className="h-3.5 w-3.5" /> Enviar email
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-xs gap-2 text-destructive" onClick={() => setDeleteTarget(c)}>
                                <Trash2 className="h-3.5 w-3.5" /> Excluir
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

      <NewClientDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditClient(null);
        }}
        editClient={editClient}
      />
      <ClientDetailSheet open={detailOpen} onOpenChange={setDetailOpen} client={selectedClient} />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{deleteTarget?.nome}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteClientMutation.isPending}
            >
              {deleteClientMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default Clientes;
