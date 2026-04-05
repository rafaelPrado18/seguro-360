import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Smartphone, Wifi, WifiOff, Plus, Trash2, RefreshCw,
  CheckCircle2, XCircle, Clock, Users, Info,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

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

interface EmpresaWhatsAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresaId: string;
  empresaNome: string;
}

const statusConfig = {
  conectado: { label: "Conectado", color: "border-success text-success", icon: CheckCircle2, iconColor: "text-success" },
  desconectado: { label: "Desconectado", color: "border-destructive text-destructive", icon: XCircle, iconColor: "text-destructive" },
  aguardando_qr: { label: "Aguardando QR", color: "border-warning text-warning", icon: Clock, iconColor: "text-warning" },
};

const BASE_URL = "https://crm-hataseg.com.br";

export function EmpresaWhatsAppDialog({ open, onOpenChange, empresaId, empresaNome }: EmpresaWhatsAppDialogProps) {
  const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newForm, setNewForm] = useState({ nome: "", telefone: "" });

  // Fetch instances for this company
  useEffect(() => {
    if (!open) return;
    const fetchInstances = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/v1/whatsapp/instances?empresaId=${empresaId}`, {
          headers: { orchestrator: "crm-hatanaka" },
        });
        if (!res.ok) throw new Error("Erro");
        const result = await res.json();
        if (result?.status === "success" && Array.isArray(result.data)) {
          setInstances(result.data.map((item: any) => ({
            id: item.id,
            nome: item.nome,
            telefone: item.telefone || "—",
            corretores: item.corretores || [],
            status: item.status === "conectado" ? "conectado" as const : "desconectado" as const,
            ultimaConexao: item.ultimaConexao || "",
            mensagensHoje: item.mensagensHoje || 0,
            autoReply: item.autoReply ?? false,
          })));
        }
      } catch {
        // Mock data for demonstration
        setInstances([
          {
            id: `${empresaId}-inst-1`,
            nome: `${empresaNome} - Principal`,
            telefone: "(11) 99999-0001",
            corretores: ["Corretor 1", "Corretor 2"],
            status: "conectado",
            ultimaConexao: new Date().toISOString(),
            mensagensHoje: 42,
            autoReply: true,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchInstances();
  }, [open, empresaId]);

  const handleCreate = () => {
    if (!newForm.nome.trim()) {
      toast({ title: "Informe o nome da instância", variant: "destructive" });
      return;
    }
    const inst: WhatsAppInstance = {
      id: uuidv4(),
      nome: newForm.nome,
      telefone: newForm.telefone || "—",
      corretores: [],
      status: "desconectado",
      ultimaConexao: "",
      mensagensHoje: 0,
      autoReply: false,
    };
    setInstances(prev => [...prev, inst]);
    setShowNewForm(false);
    setNewForm({ nome: "", telefone: "" });
    toast({ title: "Instância criada! A conexão será feita pela área administrativa." });
  };

  const handleDelete = (id: string) => {
    setInstances(prev => prev.filter(i => i.id !== id));
    toast({ title: "Instância removida" });
  };

  const handleToggleAutoReply = (id: string, checked: boolean) => {
    setInstances(prev => prev.map(i => i.id === id ? { ...i, autoReply: checked } : i));
  };

  const connectedCount = instances.filter(i => i.status === "conectado").length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Smartphone className="h-5 w-5 text-primary" />
            Instâncias WhatsApp — {empresaNome}
          </DialogTitle>
        </DialogHeader>

        {/* Summary */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <Wifi className="h-3.5 w-3.5 text-success" />
            <span className="text-muted-foreground">{connectedCount} conectada(s)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <WifiOff className="h-3.5 w-3.5 text-destructive" />
            <span className="text-muted-foreground">{instances.length - connectedCount} desconectada(s)</span>
          </div>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 p-3 rounded-lg border border-primary/20 bg-primary/5">
          <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            Crie as instâncias aqui. A <strong>conexão via QR Code</strong> será feita pelo administrador na página de <strong>Instâncias WhatsApp</strong>.
          </p>
        </div>

        <Separator />

        {/* Instance list */}
        {loading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="h-6 w-6 text-muted-foreground animate-spin" />
          </div>
        ) : instances.length === 0 && !showNewForm ? (
          <div className="text-center py-8 text-muted-foreground">
            <Smartphone className="h-10 w-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Nenhuma instância configurada para esta empresa</p>
          </div>
        ) : (
          <div className="space-y-3">
            {instances.map(inst => {
              const sc = statusConfig[inst.status];
              const StatusIcon = sc.icon;
              return (
                <div key={inst.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                    inst.status === "conectado" ? "bg-success/10" :
                    inst.status === "desconectado" ? "bg-destructive/10" : "bg-warning/10"
                  }`}>
                    <Smartphone className={`h-4 w-4 ${sc.iconColor}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{inst.nome}</p>
                      <Badge variant="outline" className={`text-[10px] shrink-0 ${sc.color}`}>
                        <StatusIcon className="h-2.5 w-2.5 mr-0.5" />
                        {sc.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span>{inst.telefone}</span>
                      <span>•</span>
                      <span>{inst.mensagensHoje} msgs hoje</span>
                      {inst.corretores.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <Users className="h-3 w-3" /> {inst.corretores.length}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex items-center gap-1 mr-2">
                      <span className="text-[10px] text-muted-foreground">Auto</span>
                      <Switch
                        checked={inst.autoReply}
                        onCheckedChange={c => handleToggleAutoReply(inst.id, c)}
                        className="scale-[0.65]"
                      />
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(inst.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* New instance form */}
        {showNewForm ? (
          <div className="space-y-3 p-3 rounded-lg border border-dashed border-primary/30 bg-primary/5">
            <p className="text-sm font-medium">Nova Instância</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Nome *</Label>
                <Input
                  value={newForm.nome}
                  onChange={e => setNewForm(p => ({ ...p, nome: e.target.value }))}
                  placeholder="Ex: Atendimento Principal"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Telefone</Label>
                <Input
                  value={newForm.telefone}
                  onChange={e => setNewForm(p => ({ ...p, telefone: e.target.value }))}
                  placeholder="(11) 99999-0000"
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreate} className="h-8 text-xs">Criar Instância</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowNewForm(false)} className="h-8 text-xs">Cancelar</Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" className="w-full gap-2" onClick={() => setShowNewForm(true)}>
            <Plus className="h-4 w-4" /> Adicionar Instância
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
