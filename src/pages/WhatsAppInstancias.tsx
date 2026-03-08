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
  Smartphone, Wifi, WifiOff, QrCode, Plus, Trash2, RefreshCw,
  CheckCircle2, XCircle, Clock, Settings2, Users, ChevronDown,
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

// corretores will be loaded from API inside the component

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
  const [showQr, setShowQr] = useState<string | null>(null);
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [newForm, setNewForm] = useState({ nome: "", telefone: "", corretores: [] as string[] });
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

  const fetchQrCode = async (instanceId: string) => {
    setQrLoading(true);
    setQrImageUrl(null);
    try {
      const res = await fetch("http://173.249.50.11:80/v1/generate/qrcode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "messageid": "B54138D599A320CB2102D10C",
        },
        body: JSON.stringify({ instanceId }),
      });
      if (!res.ok) throw new Error("Falha ao gerar QR Code");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setQrImageUrl(url);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar QR Code");
    } finally {
      setQrLoading(false);
    }
  };

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
      status: "aguardando_qr",
      ultimaConexao: "",
      mensagensHoje: 0,
      autoReply: false,
    };
    setInstances(prev => [...prev, inst]);
    setNewDialogOpen(false);
    setNewForm({ nome: "", telefone: "", corretores: [] });
    setShowQr(inst.id);
    fetchQrCode(inst.id);
    toast.success("Instância criada! Escaneie o QR Code para conectar.");
  };

  const handleDelete = (id: string) => {
    setInstances(prev => prev.filter(i => i.id !== id));
    if (selectedInstance?.id === id) setSelectedInstance(null);
    toast.success("Instância removida");
  };

  const handleReconnect = (id: string) => {
    setShowQr(id);
    setInstances(prev => prev.map(i => i.id === id ? { ...i, status: "aguardando_qr" as const } : i));
    fetchQrCode(id);
  };

  const fetchInstanceStatus = async (instanceId: string) => {
    try {
      const res = await fetch("http://173.249.50.11:80/v1/get/whatsapp/instance/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instanceId }),
      });
      if (!res.ok) throw new Error("Erro ao consultar status");
      const result = await res.json();
      const isConnected = result?.success?.connected === true;
      setInstances(prev => prev.map(i => i.id === instanceId ? {
        ...i,
        status: isConnected ? "conectado" as const : "desconectado" as const,
        ...(isConnected ? { ultimaConexao: new Date().toISOString() } : {}),
      } : i));
      if (isConnected && showQr === instanceId) {
        setShowQr(null);
        toast.success("WhatsApp conectado com sucesso!");
      }
      return isConnected;
    } catch (err) {
      console.error("Erro ao verificar status:", err);
      return false;
    }
  };

  // Poll status while QR dialog is open
  React.useEffect(() => {
    if (!showQr) return;
    const interval = setInterval(() => {
      fetchInstanceStatus(showQr);
    }, 5000);
    return () => clearInterval(interval);
  }, [showQr]);

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

  const getCorretorNomes = (ids: string[]) =>
    ids.map(id => corretores.find(c => c.id === id)?.nome).filter(Boolean);

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

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {inst.status === "conectado" ? (
                      <Button variant="outline" size="sm" className="flex-1 h-8 text-xs gap-1.5" onClick={() => handleReconnect(inst.id)}>
                        <RefreshCw className="h-3 w-3" /> Reconectar
                      </Button>
                    ) : (
                      <Button size="sm" className="flex-1 h-8 text-xs gap-1.5 bg-success text-success-foreground hover:bg-success/90" onClick={() => { setShowQr(inst.id); fetchQrCode(inst.id); }}>
                        <QrCode className="h-3 w-3" /> Conectar
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setSelectedInstance({ ...inst })}>
                      <Settings2 className="h-3 w-3" />
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

        {/* QR Code Dialog */}
        <Dialog open={!!showQr} onOpenChange={o => { if (!o) { setShowQr(null); if (qrImageUrl) { URL.revokeObjectURL(qrImageUrl); setQrImageUrl(null); } } }}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <QrCode className="h-5 w-5 text-success" /> Conectar WhatsApp
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-56 h-56 bg-muted rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                {qrLoading ? (
                  <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin" />
                ) : qrImageUrl ? (
                  <img src={qrImageUrl} alt="QR Code WhatsApp" className="w-full h-full object-contain" />
                ) : (
                  <p className="text-xs text-muted-foreground">Erro ao carregar QR</p>
                )}
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-foreground">Escaneie o QR Code</p>
                <p className="text-xs text-muted-foreground">
                  Abra o WhatsApp no celular → Dispositivos conectados → Conectar dispositivo
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => showQr && fetchQrCode(showQr)}
                disabled={qrLoading}
              >
                <RefreshCw className={`h-4 w-4 ${qrLoading ? "animate-spin" : ""}`} /> Gerar Novo QR
              </Button>
            </div>
          </DialogContent>
        </Dialog>

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
                    <p className="text-xs text-muted-foreground">Estado atual da conexão</p>
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
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setNewDialogOpen(false)}>Cancelar</Button>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleCreate}>
                Criar e Conectar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default WhatsAppInstancias;
