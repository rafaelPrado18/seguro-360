import { useState } from "react";
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
import {
  UserPlus, Search, Pencil, Trash2, Shield, Users, UserCheck,
  AlertTriangle, Target, WifiOff, Circle, Bell,
} from "lucide-react";
import { formatPhone } from "@/lib/utils";

type UserRole = "admin" | "corretor_novo" | "corretor_renovacao" | "corretor_sinistro" | "corretor_financeiro";
type BrokerOnlineStatus = "online" | "offline";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  role: UserRole;
  ativo: boolean;
  criadoEm: string;
  statusOnline: BrokerOnlineStatus;
  leadsNovos: number;
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  corretor_novo: "Corretor — Novo",
  corretor_renovacao: "Corretor — Renovação",
  corretor_sinistro: "Corretor — Sinistro",
  corretor_financeiro: "Corretor — Financeiro",
};

const ROLE_COLORS: Record<UserRole, string> = {
  admin: "bg-primary text-primary-foreground",
  corretor_novo: "bg-accent text-accent-foreground",
  corretor_renovacao: "bg-info text-info-foreground",
  corretor_sinistro: "bg-destructive text-destructive-foreground",
  corretor_financeiro: "bg-success text-success-foreground",
};

const initialUsuarios: Usuario[] = [
  { id: "1", nome: "Admin Geral", email: "admin@hataseg.com", telefone: "(11) 99999-0001", role: "admin", ativo: true, criadoEm: "2024-01-15", statusOnline: "online", leadsNovos: 0 },
  { id: "2", nome: "André Oliveira", email: "andre@hataseg.com", telefone: "(11) 99999-0002", role: "corretor_novo", ativo: true, criadoEm: "2024-03-10", statusOnline: "online", leadsNovos: 5 },
  { id: "3", nome: "Beatriz Costa", email: "beatriz@hataseg.com", telefone: "(11) 99999-0003", role: "corretor_renovacao", ativo: true, criadoEm: "2024-02-20", statusOnline: "offline", leadsNovos: 2 },
  { id: "4", nome: "Carlos Neto", email: "carlos@hataseg.com", telefone: "(11) 99999-0004", role: "corretor_sinistro", ativo: true, criadoEm: "2024-04-05", statusOnline: "online", leadsNovos: 0 },
  { id: "5", nome: "Diana Alves", email: "diana@hataseg.com", telefone: "(11) 99999-0005", role: "corretor_financeiro", ativo: false, criadoEm: "2024-05-12", statusOnline: "offline", leadsNovos: 3 },
];

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>(initialUsuarios);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", role: "corretor_novo" as UserRole });
  const { toast } = useToast();

  const filtered = usuarios.filter(u =>
    u.nome.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    ROLE_LABELS[u.role].toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => {
    setEditingUser(null);
    setForm({ nome: "", email: "", telefone: "", role: "corretor_novo" });
    setDialogOpen(true);
  };

  const openEdit = (u: Usuario) => {
    setEditingUser(u);
    setForm({ nome: u.nome, email: u.email, telefone: u.telefone, role: u.role });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.nome.trim() || !form.email.trim()) {
      toast({ title: "Preencha nome e email", variant: "destructive" });
      return;
    }

    if (editingUser) {
      setUsuarios(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...form } : u));
      toast({ title: "Usuário atualizado com sucesso" });
    } else {
      const novo: Usuario = {
        id: Date.now().toString(),
        ...form,
        ativo: true,
        criadoEm: new Date().toISOString().split("T")[0],
        statusOnline: "offline",
        leadsNovos: 0,
      };
      setUsuarios(prev => [...prev, novo]);
      toast({ title: "Usuário cadastrado com sucesso" });
    }
    setDialogOpen(false);
  };

  const toggleAtivo = (id: string) => {
    setUsuarios(prev => prev.map(u => u.id === id ? { ...u, ativo: !u.ativo } : u));
  };

  const handleDelete = (id: string) => {
    setUsuarios(prev => prev.filter(u => u.id !== id));
    toast({ title: "Usuário removido", variant: "destructive" });
  };

  const totalAtivos = usuarios.filter(u => u.ativo).length;
  const totalLeadsNovos = usuarios.reduce((sum, u) => sum + u.leadsNovos, 0);
  const corretoresOffline = usuarios.filter(u => u.ativo && u.role !== "admin" && u.statusOnline === "offline");
  const corretoresComLeadsNovos = usuarios.filter(u => u.leadsNovos > 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Alert Banners */}
        {totalLeadsNovos > 0 && (
          <div className="flex items-center gap-3 rounded-lg border-2 border-warning/50 bg-warning/10 px-4 py-3 animate-pulse">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/20">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-warning">
                {totalLeadsNovos} lead{totalLeadsNovos > 1 ? "s" : ""} novo{totalLeadsNovos > 1 ? "s" : ""} aguardando atendimento!
              </p>
              <p className="text-xs text-muted-foreground">
                {corretoresComLeadsNovos.map(c => `${c.nome} (${c.leadsNovos})`).join(" · ")}
              </p>
            </div>
            <Badge variant="outline" className="border-warning text-warning text-xs font-bold px-3 py-1">
              <Bell className="h-3 w-3 mr-1" /> Urgente
            </Badge>
          </div>
        )}

        {corretoresOffline.length > 0 && (
          <div className="flex items-center gap-3 rounded-lg border-2 border-destructive/40 bg-destructive/10 px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/20">
              <WifiOff className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-destructive">
                {corretoresOffline.length} corretor{corretoresOffline.length > 1 ? "es" : ""} offline
              </p>
              <p className="text-xs text-muted-foreground">
                {corretoresOffline.map(c => c.nome).join(", ")} — leads e mensagens não serão recebidos
              </p>
            </div>
          </div>
        )}

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
                <DialogTitle>{editingUser ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Nome Completo</Label>
                  <Input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Nome do corretor" className="h-9 text-sm" />
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
                  <Label className="text-xs">Perfil / Função</Label>
                  <Select value={form.role} onValueChange={(v: UserRole) => setForm(f => ({ ...f, role: v }))}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="corretor_novo">Corretor — Novo</SelectItem>
                      <SelectItem value="corretor_renovacao">Corretor — Renovação</SelectItem>
                      <SelectItem value="corretor_sinistro">Corretor — Sinistro</SelectItem>
                      <SelectItem value="corretor_financeiro">Corretor — Financeiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90">
                  {editingUser ? "Salvar" : "Cadastrar"}
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{usuarios.filter(u => u.role === "admin").length}</p>
                <p className="text-xs text-muted-foreground">Administradores</p>
              </div>
            </CardContent>
          </Card>
          <Card className={`kpi-card-shadow ${totalLeadsNovos > 0 ? "ring-2 ring-warning/50" : ""}`}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${totalLeadsNovos > 0 ? "bg-warning/15" : "bg-muted"}`}>
                <Target className={`h-5 w-5 ${totalLeadsNovos > 0 ? "text-warning" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${totalLeadsNovos > 0 ? "text-warning" : "text-foreground"}`}>{totalLeadsNovos}</p>
                <p className="text-xs text-muted-foreground">Leads Novos</p>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Corretor</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Telefone</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Leads</TableHead>
                  <TableHead className="text-center">Ativo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map(u => (
                    <TableRow key={u.id} className={`${!u.ativo ? "opacity-50" : ""} ${u.leadsNovos > 0 ? "bg-warning/5" : ""}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
                              {u.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                            </div>
                            <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${u.statusOnline === "online" ? "bg-success" : "bg-destructive"}`} />
                          </div>
                          <span className="font-medium text-sm">{u.nome}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{u.email}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{formatPhone(u.telefone)}</TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] ${ROLE_COLORS[u.role]}`}>
                          {ROLE_LABELS[u.role]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-semibold ${
                            u.statusOnline === "online"
                              ? "border-success/50 text-success bg-success/10"
                              : "border-destructive/50 text-destructive bg-destructive/10"
                          }`}
                        >
                          <Circle className={`h-2 w-2 mr-1 fill-current`} />
                          {u.statusOnline === "online" ? "Online" : "Offline"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {u.leadsNovos > 0 ? (
                          <Badge className="bg-warning text-warning-foreground text-[10px] font-bold animate-pulse">
                            {u.leadsNovos} novo{u.leadsNovos > 1 ? "s" : ""}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch checked={u.ativo} onCheckedChange={() => toggleAtivo(u.id)} className="scale-75" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(u)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(u.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Usuarios;
