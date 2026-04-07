import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Smartphone, Wifi, WifiOff, Trash2, RefreshCw,
  CheckCircle2, XCircle, Clock, Users, Info,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface WhatsAppInstance {
  id: string;
  nome: string;
  telefone: string;
  corretores: string[];
  status: "open" | "close" | "connecting" | "refused";
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
  open: { label: "Conectado", color: "border-success text-success", icon: CheckCircle2, iconColor: "text-success" },
  close: { label: "Desconectado", color: "border-destructive text-destructive", icon: XCircle, iconColor: "text-destructive" },
  connecting: { label: "Conectando", color: "border-warning text-warning", icon: Clock, iconColor: "text-warning" },
  refused: { label: "Recusado", color: "border-destructive text-destructive", icon: XCircle, iconColor: "text-destructive" },
};

const BASE_URL = "https://crm-hataseg.com.br";

export function EmpresaWhatsAppDialog({ open, onOpenChange, empresaId, empresaNome }: EmpresaWhatsAppDialogProps) {
  const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInstances = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/v1/whatsapp/instances?id=${empresaId}`, {
        headers: { orchestrator: "crm-hatanaka" },
      });
      if (!res.ok) throw new Error("Erro");
      const result = await res.json();
      const data = result?.data || result?.success || result;
      if (Array.isArray(data)) {
        setInstances(data.map((item: any) => ({
          id: item.id,
          nome: item.nome,
          telefone: item.telefone || "—",
          corretores: item.corretores || [],
          status: (["open", "close", "connecting", "refused"].includes(item.status) ? item.status : "close") as WhatsAppInstance["status"],
          ultimaConexao: item.ultimaConexao || "",
          mensagensHoje: item.mensagensHoje || 0,
          autoReply: item.autoReply ?? false,
        })));
      }
    } catch {
      setInstances([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchInstances();
  }, [open, empresaId]);

  const handleDelete = (id: string) => {
    setInstances(prev => prev.filter(i => i.id !== id));
    toast({ title: "Instância removida" });
  };

  const handleToggleAutoReply = (id: string, checked: boolean) => {
    setInstances(prev => prev.map(i => i.id === id ? { ...i, autoReply: checked } : i));
  };

  const connectedCount = instances.filter(i => i.status === "open").length;

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
            As instâncias são cadastradas diretamente no banco de dados. A <strong>conexão via QR Code</strong> será feita pelo administrador na página de <strong>Instâncias WhatsApp</strong>.
          </p>
        </div>

        <Separator />

        {/* Instance list */}
        {loading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="h-6 w-6 text-muted-foreground animate-spin" />
          </div>
        ) : instances.length === 0 ? (
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
                    inst.status === "open" ? "bg-success/10" :
                    inst.status === "close" || inst.status === "refused" ? "bg-destructive/10" : "bg-warning/10"
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
      </DialogContent>
    </Dialog>
  );
}