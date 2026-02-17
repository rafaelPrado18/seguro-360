import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  Building2, Plus, Search, Users, FileText, Target, TrendingUp,
  Edit, Trash2, Eye, BarChart3, Shield, Calendar, DollarSign,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

type Plano = "free" | "pro" | "enterprise";

interface Empresa {
  id: string;
  nome: string;
  cnpj: string;
  responsavel: string;
  email: string;
  telefone: string;
  plano: Plano;
  ativa: boolean;
  created_at: string;
  validade_licenca: string;
  max_usuarios: number;
  modulos: string[];
  stats: {
    usuarios_ativos: number;
    leads: number;
    apolices: number;
    clientes: number;
  };
}

const PLANO_LABELS: Record<Plano, string> = { free: "Free", pro: "Pro", enterprise: "Enterprise" };
const PLANO_COLORS: Record<Plano, string> = {
  free: "bg-muted text-muted-foreground",
  pro: "bg-primary/10 text-primary",
  enterprise: "bg-accent text-accent-foreground",
};

const MODULOS_DISPONIVEIS = [
  { id: "leads", label: "Leads" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "clientes", label: "Clientes" },
  { id: "apolices", label: "Apólices" },
  { id: "sinistros", label: "Sinistros" },
  { id: "comissoes", label: "Comissões" },
  { id: "renovacoes", label: "Renovações" },
  { id: "relatorios", label: "Relatórios" },
];

const MOCK_EMPRESAS: Empresa[] = [
  {
    id: "1", nome: "HataSeg - Seguros & Previdência", cnpj: "12.345.678/0001-90",
    responsavel: "Admin Geral", email: "admin@hataseg.com", telefone: "(11) 3333-4567",
    plano: "enterprise", ativa: true, created_at: "2024-01-15", validade_licenca: "2026-01-15",
    max_usuarios: 50,
    modulos: ["leads", "whatsapp", "clientes", "apolices", "sinistros", "comissoes", "renovacoes", "relatorios"],
    stats: { usuarios_ativos: 12, leads: 847, apolices: 2340, clientes: 1560 },
  },
  {
    id: "2", nome: "Proteção Total Seguros", cnpj: "98.765.432/0001-10",
    responsavel: "Maria Santos", email: "maria@protecaototal.com", telefone: "(21) 2222-3456",
    plano: "pro", ativa: true, created_at: "2024-06-10", validade_licenca: "2025-06-10",
    max_usuarios: 15,
    modulos: ["leads", "clientes", "apolices", "renovacoes"],
    stats: { usuarios_ativos: 5, leads: 230, apolices: 890, clientes: 620 },
  },
  {
    id: "3", nome: "Segura Mais Corretora", cnpj: "11.222.333/0001-44",
    responsavel: "João Pereira", email: "joao@seguramais.com", telefone: "(31) 3111-2233",
    plano: "free", ativa: false, created_at: "2025-01-20", validade_licenca: "2025-07-20",
    max_usuarios: 3,
    modulos: ["leads", "clientes"],
    stats: { usuarios_ativos: 0, leads: 45, apolices: 120, clientes: 80 },
  },
];

const emptyForm = (): Omit<Empresa, "id" | "stats"> => ({
  nome: "", cnpj: "", responsavel: "", email: "", telefone: "",
  plano: "free", ativa: true, created_at: new Date().toISOString().slice(0, 10),
  validade_licenca: "", max_usuarios: 5, modulos: ["leads", "clientes"],
});

const Empresas = () => {
  const [empresas, setEmpresas] = useState<Empresa[]>(MOCK_EMPRESAS);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Empresa | null>(null);
  const [formData, setFormData] = useState(emptyForm());

  const filtered = empresas.filter(e =>
    e.nome.toLowerCase().includes(search.toLowerCase()) ||
    e.cnpj.includes(search)
  );

  const totals = empresas.reduce(
    (acc, e) => ({
      empresas: acc.empresas + 1,
      ativas: acc.ativas + (e.ativa ? 1 : 0),
      usuarios: acc.usuarios + e.stats.usuarios_ativos,
      leads: acc.leads + e.stats.leads,
      apolices: acc.apolices + e.stats.apolices,
    }),
    { empresas: 0, ativas: 0, usuarios: 0, leads: 0, apolices: 0 }
  );

  const openNew = () => { setEditing(null); setFormData(emptyForm()); setDialogOpen(true); };
  const openEdit = (emp: Empresa) => {
    setEditing(emp);
    const { id, stats, ...rest } = emp;
    setFormData(rest);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.nome || !formData.cnpj) {
      toast({ title: "Preencha nome e CNPJ", variant: "destructive" });
      return;
    }
    if (editing) {
      setEmpresas(prev => prev.map(e => e.id === editing.id ? { ...e, ...formData } : e));
      toast({ title: "Empresa atualizada" });
    } else {
      const nova: Empresa = {
        ...formData, id: uuidv4(),
        stats: { usuarios_ativos: 0, leads: 0, apolices: 0, clientes: 0 },
      };
      setEmpresas(prev => [...prev, nova]);
      toast({ title: "Empresa criada com sucesso" });
    }
    setDialogOpen(false);
  };

  const toggleAtiva = (id: string) => {
    setEmpresas(prev => prev.map(e => e.id === id ? { ...e, ativa: !e.ativa } : e));
  };

  const handleDelete = (id: string) => {
    setEmpresas(prev => prev.filter(e => e.id !== id));
    toast({ title: "Empresa removida" });
  };

  const toggleModulo = (mod: string) => {
    setFormData(prev => ({
      ...prev,
      modulos: prev.modulos.includes(mod)
        ? prev.modulos.filter(m => m !== mod)
        : [...prev.modulos, mod],
    }));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" /> Gestão de Empresas
            </h2>
            <p className="text-sm text-muted-foreground">Painel multi-tenant — gerencie CRMs de todas as empresas</p>
          </div>
          <Button onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" /> Nova Empresa
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total Empresas", value: totals.empresas, icon: Building2, color: "text-primary" },
            { label: "Ativas", value: totals.ativas, icon: Shield, color: "text-success" },
            { label: "Usuários Ativos", value: totals.usuarios, icon: Users, color: "text-accent-foreground" },
            { label: "Total Leads", value: totals.leads.toLocaleString("pt-BR"), icon: Target, color: "text-primary" },
            { label: "Total Apólices", value: totals.apolices.toLocaleString("pt-BR"), icon: FileText, color: "text-primary" },
          ].map((kpi, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center gap-3">
                <kpi.icon className={`h-8 w-8 ${kpi.color} shrink-0`} />
                <div>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="text-xl font-bold text-foreground">{kpi.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou CNPJ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead className="text-center">Usuários</TableHead>
                  <TableHead className="text-center">Leads</TableHead>
                  <TableHead className="text-center">Apólices</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(emp => (
                  <TableRow key={emp.id} className={!emp.ativa ? "opacity-50" : ""}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{emp.nome}</p>
                        <p className="text-xs text-muted-foreground">{emp.responsavel}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{emp.cnpj}</TableCell>
                    <TableCell>
                      <Badge className={PLANO_COLORS[emp.plano]}>{PLANO_LABELS[emp.plano]}</Badge>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {emp.stats.usuarios_ativos}/{emp.max_usuarios}
                    </TableCell>
                    <TableCell className="text-center">{emp.stats.leads}</TableCell>
                    <TableCell className="text-center">{emp.stats.apolices}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(emp.validade_licenca).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <Switch checked={emp.ativa} onCheckedChange={() => toggleAtiva(emp.id)} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(emp)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(emp.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Nenhuma empresa encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Empresa" : "Nova Empresa"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Nome da Empresa *</Label>
                <Input value={formData.nome} onChange={e => setFormData(p => ({ ...p, nome: e.target.value }))} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">CNPJ *</Label>
                <Input value={formData.cnpj} onChange={e => setFormData(p => ({ ...p, cnpj: e.target.value }))} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Responsável</Label>
                <Input value={formData.responsavel} onChange={e => setFormData(p => ({ ...p, responsavel: e.target.value }))} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Email</Label>
                <Input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Telefone</Label>
                <Input value={formData.telefone} onChange={e => setFormData(p => ({ ...p, telefone: e.target.value }))} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Plano</Label>
                <Select value={formData.plano} onValueChange={v => setFormData(p => ({ ...p, plano: v as Plano }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Máx. Usuários</Label>
                <Input type="number" value={formData.max_usuarios} onChange={e => setFormData(p => ({ ...p, max_usuarios: Number(e.target.value) }))} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Validade da Licença</Label>
                <Input type="date" value={formData.validade_licenca} onChange={e => setFormData(p => ({ ...p, validade_licenca: e.target.value }))} className="h-9 text-sm" />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Módulos Habilitados</Label>
              <div className="grid grid-cols-2 gap-2">
                {MODULOS_DISPONIVEIS.map(mod => (
                  <label key={mod.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.modulos.includes(mod.id)}
                      onChange={() => toggleModulo(mod.id)}
                      className="rounded border-input"
                    />
                    {mod.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editing ? "Salvar" : "Criar Empresa"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Empresas;
