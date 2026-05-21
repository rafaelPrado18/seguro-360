import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Search, Pencil, Trash2, Shield, Users, UserCheck } from "lucide-react";
import { useAgents, useCreateAgent, useUpdateAgent, useUpdateAgentStatus, useDeleteAgent } from "@/hooks/useAgents";
import type { Agent } from "@/services/agentsService";

const FUNCTION_LABELS: Record<string, string> = {
  administrador: "Administrador",
  corretor: "Corretor — Novo",
  corretor_renovacao: "Corretor — Renovação",
  corretor_sinistro: "Corretor — Sinistro",
  corretor_financeiro: "Corretor — Financeiro",
  corretor_emissao: "Corretor — Emissão",
};

const FUNCTION_COLORS: Record<string, string> = {
  administrador: "bg-primary text-primary-foreground",
  corretor: "bg-accent text-accent-foreground",
  corretor_renovacao: "bg-info text-info-foreground",
  corretor_sinistro: "bg-destructive text-destructive-foreground",
  corretor_financeiro: "bg-success text-success-foreground",
  corretor_emissao: "bg-warning text-warning-foreground",
};

const VINCULO_LABELS: Record<string, string> = {
  clt: "CLT",
  pj: "PJ",
  autonomo: "Autônomo",
};

interface AgentForm {
  name: string;
  email: string;
  telefone: string;
  documentNumber: string;
  function: string;
  vinculo: string;
  birthDate: string;
  workSchedule: number[]; // 0=Dom ... 6=Sab, em horas
}

const DEFAULT_SCHEDULE = [0, 8, 8, 8, 8, 7, 0];
const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const EMPTY_FORM: AgentForm = {
  name: "",
  email: "",
  telefone: "",
  documentNumber: "",
  function: "corretor",
  vinculo: "clt",
  birthDate: "",
  workSchedule: [...DEFAULT_SCHEDULE],
};

function getCookie(name) {
  const match = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/([.*+?^${}()|[\\]\\])/g, '\\$1') + '=([^;]*)')
  );
  return match ? decodeURIComponent(match[1]) : null;
}

const Usuarios = () => {
  const { data: agents, isLoading } = useAgents();
  const createMutation = useCreateAgent();
  const updateStatusMutation = useUpdateAgentStatus();
  const updateMutation = useUpdateAgent();
  const deleteMutation = useDeleteAgent();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [form, setForm] = useState<AgentForm>(EMPTY_FORM);
  const { toast } = useToast();

  const usuarios = agents || [];

  const filtered = usuarios.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    (FUNCTION_LABELS[u.function] || u.function)?.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => {
    setEditingAgent(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (u: Agent) => {
    setEditingAgent(u);
    setForm({
      name: u.name,
      email: u.email,
      telefone: u.telefone,
      documentNumber: u.documentNumber || "",
      function: u.function,
      vinculo: u.vinculo,
      birthDate: u.birthDate ? u.birthDate.split("T")[0] : "",
      workSchedule:
        Array.isArray(u.workSchedule) && u.workSchedule.length === 7
          ? u.workSchedule.map(n => Number(n) || 0)
          : [...DEFAULT_SCHEDULE],
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast({ title: "Preencha nome e email", variant: "destructive" });
      return;
    }

    if (editingAgent) {
      updateMutation.mutate(
        { id: editingAgent.agentId, data: { ...form, birthDate: form.birthDate ? `${form.birthDate}T00:00:00` : "" } },
        {
          onSuccess: () => {
            toast({ title: "Usuário atualizado com sucesso" });
            setDialogOpen(false);
          },
          onError: () => toast({ title: "Erro ao atualizar usuário", variant: "destructive" }),
        }
      );
    } else {
      var userId = getCookie("userId");
      const newAgent: Agent = {
        userId: userId,
        agentId: '1',
        name: form.name,
        email: form.email,
        telefone: form.telefone,
        documentNumber: form.documentNumber,
        function: form.function,
        vinculo: form.vinculo,
        birthDate: form.birthDate ? `${form.birthDate}T00:00:00` : "",
        status: "offline",
        isActive: true,
        registrationDate: new Date().toISOString(),
      };
      createMutation.mutate(newAgent, {
        onSuccess: () => {
          toast({ title: "Usuário cadastrado com sucesso" });
          setDialogOpen(false);
        },
        onError: () => toast({ title: "Erro ao cadastrar usuário", variant: "destructive" }),
      });
    }
  };

  const toggleAtivo = (agent: Agent) => {
    updateMutation.mutate(
      { id: agent.agentId, data: { isActive: !agent.isActive } },
      {
        onSuccess: () => toast({ title: agent.isActive ? "Usuário desativado" : "Usuário ativado" }),
        onError: () => toast({ title: "Erro ao alterar status", variant: "destructive" }),
      }
    );
  };

  const toggleOnline = (agent: Agent, checked: boolean) => {

    const newStatus = checked ? "online" : "offline";

    updateStatusMutation.mutate(
      {
        data: {
          status: newStatus,
          agentId: agent.agentId,
          userId: getCookie("userId")
        }
      },
      {
        onSuccess: () =>
          toast({ title: checked ? "Usuário ficou online" : "Usuário ficou offline" }),
        onError: () =>
          toast({ title: "Erro ao alterar estado do usuário", variant: "destructive" }),
      }
    );
  };

  const handleDelete = (agent: Partial<Agent>) => {
    deleteMutation.mutate( 
    { data: { agentId: agent.agentId, userId: getCookie("userId") } },
    {
      onSuccess: () => toast({ title: "Usuário removido" }),
      onError: () => toast({ title: "Erro ao remover usuário", variant: "destructive" }),
    });
  };

  const totalOnline = usuarios.filter(u => u.status == "online").length;
  const totalAtivos = usuarios.filter(u => u.isActive).length;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Usuários</h2>
            <p className="text-sm text-muted-foreground">Cadastro e gerenciamento de corretores</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew} className="bg-accent text-accent-foreground hover:bg-accent/90">
                <UserPlus className="h-4 w-4 mr-2" /> Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingAgent ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Nome Completo</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome do corretor" className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Email</Label>
                  <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@hataseg.com" className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Telefone</Label>
                  <Input value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} placeholder="(11) 99999-0000" className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">CPF / Documento</Label>
                  <Input value={form.documentNumber} onChange={e => setForm(f => ({ ...f, documentNumber: e.target.value }))} placeholder="000.000.000-00" className="h-9 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Perfil / Função</Label>
                    <Select value={form.function} onValueChange={v => setForm(f => ({ ...f, function: v }))}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="administrador">Administrador</SelectItem>
                        <SelectItem value="corretor">Corretor — Novo</SelectItem>
                        <SelectItem value="corretor_renovacao">Corretor — Renovação</SelectItem>
                        <SelectItem value="corretor_sinistro">Corretor — Sinistro</SelectItem>
                        <SelectItem value="corretor_financeiro">Corretor — Financeiro</SelectItem>
                        <SelectItem value="corretor_emissao">Corretor — Emissão</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Vínculo</Label>
                    <Select value={form.vinculo} onValueChange={v => setForm(f => ({ ...f, vinculo: v }))}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clt">CLT</SelectItem>
                        <SelectItem value="pj">PJ</SelectItem>
                        <SelectItem value="autonomo">Autônomo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Data de Nascimento</Label>
                  <Input type="date" value={form.birthDate} onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))} className="h-9 text-sm" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleSave} disabled={isSaving} className="bg-accent text-accent-foreground hover:bg-accent/90">
                  {isSaving ? "Salvando..." : editingAgent ? "Salvar" : "Cadastrar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="kpi-card-shadow">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{usuarios.length}</p>
                <p className="text-xs text-muted-foreground">Total de Usuários</p>
              </div>
            </CardContent>
          </Card>
          <Card className="kpi-card-shadow">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <UserCheck className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalAtivos}</p>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="kpi-card-shadow">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <UserCheck className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalOnline}</p>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </CardContent>
          </Card>
          <Card className="kpi-card-shadow">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{usuarios.filter(u => u.function === "administrador").length}</p>
                <p className="text-xs text-muted-foreground">Administradores</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search + Table */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <CardTitle className="text-sm font-semibold">Lista de Usuários</CardTitle>
              <div className="relative sm:ml-auto w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou perfil..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">Carregando...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                    <TableHead className="hidden md:table-cell">Telefone</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead className="hidden lg:table-cell">Vínculo</TableHead>
                    <TableHead className="text-center">Ativo</TableHead>
                    <TableHead className="text-center">Online</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        Nenhum usuário encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map(u => (
                      <TableRow key={u.agentId} className={!u.isActive ? "opacity-50" : ""}>
                        <TableCell className="font-medium text-sm">{u.name}</TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{u.email}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{u.telefone}</TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] ${FUNCTION_COLORS[u.function] || "bg-muted text-muted-foreground"}`}>
                            {FUNCTION_LABELS[u.function] || u.function}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {VINCULO_LABELS[u.vinculo] || u.vinculo}
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch checked={u.isActive} onCheckedChange={() => toggleAtivo(u)} className="scale-75" />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={u.status === "online"}
                            onCheckedChange={(checked) => toggleOnline(u, checked)}
                            className="scale-75"
                          />
                          </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(u)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(u)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Usuarios;
