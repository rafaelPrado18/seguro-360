import React, { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Smartphone, Wifi, WifiOff, Plus, Trash2, RefreshCw,
  CheckCircle2, XCircle, Clock, Settings2, Users, ChevronDown, Info,
} from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useAgents } from "@/hooks/useAgents";

interface WhatsAppInstance {
  id: string;
  nome: string;
  telefone: string;
  corretores: string[];
  status: "conectado" | "desconectado" | "aguardando_qr";
  ultimaConexao: string;
  mensagensHoje: number;
  autoReply: boolean;
}

const statusConfig = {
  conectado: { label: "Conectado", color: "border-success text-success", icon: CheckCircle2, iconColor: "text-success" },
  desconectado: { label: "Desconectado", color: "border-destructive text-destructive", icon: XCircle, iconColor: "text-destructive" },
  aguardando_qr: { label: "Aguardando QR", color: "border-warning text-warning", icon: Clock, iconColor: "text-warning" },
};

function CorretorMultiSelect({
  selected,
  onChange,
  size = "sm",
  corretores,
}: {
  selected: string[];
  onChange: (ids: string[]) => void;
  size?: "sm" | "md";
  corretores: { id: string; nome: string }[];
}) {
  const toggle = (id: string) => {
    onChange(
      selected.includes(id)
        ? selected.filter(s => s !== id)
        : [...selected, id]
    );
  };

  const label = selected.length === 0
    ? "Selecione corretores"
    : selected.length === 1
    ? corretores.find(c => c.id === selected[0])?.nome || "1 corretor"
    : `${selected.length} corretores`;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-between font-normal ${size === "sm" ? "h-8 text-xs" : "h-9 text-sm"}`}
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="h-3.5 w-3.5 ml-1 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="space-y-1">
          {corretores.map(c => (
            <label
              key={c.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/60 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={selected.includes(c.id)}
                onCheckedChange={() => toggle(c.id)}
              />
              <span className="text-sm">{c.nome}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

const WhatsAppInstancias = () => {
  const { data: agents } = useAgents();
  const corretores = useMemo(() => {
    if (!agents) return [];
    return agents.filter(a => a.isActive).map(a => ({ id: a.agentId, nome: a.name }));
  }, [agents]);
  const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
  const [loadingInstances, setLoadingInstances] = useState(true);
  const [selectedInstance, setSelectedInstance] = useState<WhatsAppInstance | null>(null);
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [newForm, setNewForm] = useState({ nome: "", telefone: "", corretores: [] as string[] });

  const handleCreate = () => {
    if (!newForm.nome.trim() || newForm.corretores.length === 0) {
      toast.error("Preencha o nome e selecione ao menos um corretor");
      return;
    }
    const inst: WhatsAppInstance = {
      id: uuidv4(),
      nome: newForm.nome,
      telefone: newForm.telefone || "—",
      corretores: newForm.corretores,
      status: "desconectado",
      ultimaConexao: "",
      mensagensHoje: 0,
      autoReply: false,
    };
    setInstances(prev => [...prev, inst]);
    setNewDialogOpen(false);
    setNewForm({ nome: "", telefone: "", corretores: [] });
    toast.success("Instância criada! A conexão será feita pela área administrativa.");
  };

  const handleDelete = (id: string) => {
    setInstances(prev => prev.filter(i => i.id !== id));
    if (selectedInstance?.id === id) setSelectedInstance(null);
    toast.success("Instância removida");
  };

  // Fetch instances from API on mount
  React.useEffect(() => {
    const fetchInstances = async () => {
      try {
        setLoadingInstances(true);
        const res = await fetch("http://173.249.50.11/v1/whatsapp/instances", {
          method: "GET",
          headers: { "orchestrator": "minha-orquestradora" },
        });
        if (!res.ok) throw new Error("Erro ao buscar instâncias");
        const result = await res.json();
        if (result?.status === "success" && Array.isArray(result.data)) {
          setInstances(result.data.map((item: any) => ({
            id: item.id,
            nome: item.nome,
            telefone: item.telefone,
            corretores: item.corretores || [],
            status: item.status === "conectado" ? "conectado" as const : "desconectado" as const,
            ultimaConexao: item.ultimaConexao || "",
            mensagensHoje: item.mensagensHoje || 0,
            autoReply: item.autoReply ?? false,
          })));
        }
      } catch (err) {
        console.error("Erro ao buscar instâncias:", err);
        toast.error("Erro ao carregar instâncias");
      } finally {
        setLoadingInstances(false);
      }
    };
    fetchInstances();
  }, []);

  const handleToggleAutoReply = (id: string, checked: boolean) => {
    setInstances(prev => prev.map(i => i.id === id ? { ...i, autoReply: checked } : i));
  };

  const handleUpdateCorretores = (id: string, corretorIds: string[]) => {
    setInstances(prev => prev.map(i => i.id === id ? { ...i, corretores: corretorIds } : i));
  };

  const getCorretorNomes = (values: string[]) =>
    values.map(v => {
      const byId = corretores.find(c => c.id === v);
      if (byId) return byId.nome;
      return v;
    }).filter(Boolean);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Instâncias WhatsApp</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {instances.filter(i => i.status === "conectado").length} de {instances.length} instâncias conectadas
            </p>
          </div>
          <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 self-start sm:self-auto" onClick={() => setNewDialogOpen(true)}>
            <Plus className="h-4 w-4" /> Nova Instância
          </Button>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 p-3 rounded-lg border border-primary/20 bg-primary/5">
          <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            As instâncias são criadas aqui e a <strong>conexão via QR Code</strong> é realizada pela <strong>área administrativa (Super Admin)</strong> no módulo de Empresas.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-5 pb-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Wifi className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{instances.filter(i => i.status === "conectado").length}</p>
                <p className="text-xs text-muted-foreground">Conectadas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <WifiOff className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{instances.filter(i => i.status === "desconectado").length}</p>
                <p className="text-xs text-muted-foreground">Desconectadas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{instances.reduce((s, i) => s + i.mensagensHoje, 0)}</p>
                <p className="text-xs text-muted-foreground">Mensagens Hoje</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {instances.map(inst => {
            const sc = statusConfig[inst.status];
            const StatusIcon = sc.icon;
            const nomes = getCorretorNomes(inst.corretores);
            return (
              <Card key={inst.id} className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 ${
                  inst.status === "conectado" ? "bg-success" :
                  inst.status === "desconectado" ? "bg-destructive" : "bg-warning"
                }`} />

                <CardHeader className="pb-3 pt-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        inst.status === "conectado" ? "bg-success/10" :
                        inst.status === "desconectado" ? "bg-destructive/10" : "bg-warning/10"
                      }`}>
                        <Smartphone className={`h-5 w-5 ${sc.iconColor}`} />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold">{inst.nome}</CardTitle>
                        <p className="text-xs text-muted-foreground">{inst.telefone}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${sc.color}`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {sc.label}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Corretores */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" /> Corretores Designados
                    </Label>
                    <div className="flex flex-wrap gap-1">
                      {nomes.length === 0 ? (
                        <span className="text-xs text-muted-foreground italic">Nenhum</span>
                      ) : (
                        nomes.map(nome => (
                          <Badge key={nome} variant="secondary" className="text-[10px]">{nome}</Badge>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Mensagens hoje</span>
                    <span className="font-semibold">{inst.mensagensHoje}</span>
                  </div>
                  {inst.ultimaConexao && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Última conexão</span>
                      <span className="font-medium">
                        {new Date(inst.ultimaConexao).toLocaleString("pt-BR", {
                          day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                    </div>
                  )}

                  {/* Auto-reply */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Resposta automática</span>
                    <Switch
                      checked={inst.autoReply}
                      onCheckedChange={c => handleToggleAutoReply(inst.id, c)}
                      className="scale-75"
                    />
                  </div>

                  <Separator />

                  {/* Actions — no connect button, only config and delete */}
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs gap-1.5" onClick={() => setSelectedInstance({ ...inst })}>
                      <Settings2 className="h-3 w-3" /> Configurar
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(inst.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Detail / Config Dialog */}
        <Dialog open={!!selectedInstance} onOpenChange={o => { if (!o) setSelectedInstance(null); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <Settings2 className="h-5 w-5 text-primary" /> Configuração — {selectedInstance?.nome}
              </DialogTitle>
            </DialogHeader>
            {selectedInstance && (
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Nome da Instância</Label>
                  <Input
                    value={selectedInstance.nome}
                    onChange={e => {
                      const val = e.target.value;
                      setSelectedInstance(prev => prev ? { ...prev, nome: val } : prev);
                    }}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Telefone</Label>
                  <Input
                    value={selectedInstance.telefone}
                    onChange={e => {
                      const val = e.target.value;
                      setSelectedInstance(prev => prev ? { ...prev, telefone: val } : prev);
                    }}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Corretores Designados</Label>
                  <CorretorMultiSelect
                    selected={selectedInstance.corretores}
                    onChange={ids => setSelectedInstance(prev => prev ? { ...prev, corretores: ids } : prev)}
                    size="md"
                    corretores={corretores}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Resposta Automática</p>
                    <p className="text-xs text-muted-foreground">Responder leads fora do horário</p>
                  </div>
                  <Switch
                    checked={selectedInstance.autoReply}
                    onCheckedChange={c => setSelectedInstance(prev => prev ? { ...prev, autoReply: c } : prev)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p className="text-xs text-muted-foreground">Conexão gerenciada pela área administrativa</p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${statusConfig[selectedInstance.status].color}`}>
                    {statusConfig[selectedInstance.status].label}
                  </Badge>
                </div>
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setSelectedInstance(null)}>Cancelar</Button>
              <Button
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => {
                  if (selectedInstance) {
                    setInstances(prev => prev.map(i => i.id === selectedInstance.id ? selectedInstance : i));
                    setSelectedInstance(null);
                    toast.success("Configuração salva!");
                  }
                }}
              >
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Instance Dialog */}
        <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <Plus className="h-5 w-5 text-accent" /> Nova Instância
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Nome da Instância *</Label>
                <Input
                  value={newForm.nome}
                  onChange={e => setNewForm(f => ({ ...f, nome: e.target.value }))}
                  placeholder="Ex: Linha Comercial"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Telefone</Label>
                <Input
                  value={newForm.telefone}
                  onChange={e => setNewForm(f => ({ ...f, telefone: e.target.value }))}
                  placeholder="(11) 99900-0000"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Corretores Designados *</Label>
                <CorretorMultiSelect
                  selected={newForm.corretores}
                  onChange={ids => setNewForm(f => ({ ...f, corretores: ids }))}
                  size="md"
                  corretores={corretores}
                />
              </div>
              <div className="flex items-start gap-2 p-2 rounded bg-muted/50">
                <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-[11px] text-muted-foreground">
                  Após criar, a conexão via QR Code será feita pelo Super Admin na área de Empresas.
                </p>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setNewDialogOpen(false)}>Cancelar</Button>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleCreate}>
                Criar Instância
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default WhatsAppInstancias;
