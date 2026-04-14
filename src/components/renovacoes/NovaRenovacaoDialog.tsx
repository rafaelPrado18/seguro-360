import { useState, useMemo } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { useClients } from "@/hooks/useClients";
import { useApolices } from "@/hooks/useApolices";
import { renovacaoClientService } from "@/services/renovacaoClientService";
import { useQueryClient } from "@tanstack/react-query";
import { useRenovacaoStatuses } from "@/hooks/useRenovacaoStatus";
import type { Client } from "@/services/clientService";
import type { ApoliceFormatted } from "@/services/apolicesService";

interface NovaRenovacaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NovaRenovacaoDialog({ open, onOpenChange }: NovaRenovacaoDialogProps) {
  const { data: clients, isLoading: loadingClients } = useClients();
  const { data: apolices, isLoading: loadingApolices } = useApolices();
  const { data: statuses } = useRenovacaoStatuses();
  const queryClient = useQueryClient();

  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedApoliceId, setSelectedApoliceId] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [status, setStatus] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [vencimento, setVencimento] = useState("");
  const [saving, setSaving] = useState(false);

  const filteredClients = useMemo(() => {
    if (!clients) return [];
    if (!clientSearch) return clients;
    const q = clientSearch.toLowerCase();
    return clients.filter(c => c.nome.toLowerCase().includes(q) || c.cpf?.includes(q));
  }, [clients, clientSearch]);

  const selectedClient: Client | undefined = useMemo(
    () => clients?.find(c => c.id === selectedClientId),
    [clients, selectedClientId]
  );

  // Filter apólices that belong to the selected client
  const clientApolices: ApoliceFormatted[] = useMemo(() => {
    if (!apolices || !selectedClient) return [];
    return apolices.filter(a => a.cliente?.toLowerCase() === selectedClient.nome?.toLowerCase());
  }, [apolices, selectedClient]);

  const selectedApolice: ApoliceFormatted | undefined = useMemo(
    () => clientApolices.find(a => a.id === selectedApoliceId),
    [clientApolices, selectedApoliceId]
  );

  const resetForm = () => {
    setSelectedClientId("");
    setSelectedApoliceId("");
    setClientSearch("");
    setStatus("");
    setObservacoes("");
    setVencimento("");
  };

  const handleCreate = async () => {
    if (!selectedClient || !selectedApolice) {
      toast.error("Selecione um cliente e uma apólice");
      return;
    }
    if (!status) {
      toast.error("Selecione um status");
      return;
    }

    setSaving(true);
    try {
      await renovacaoClientService.create({
        apolice: selectedApolice.id,
        cliente: selectedClient.nome,
        ramo: selectedApolice.veiculo?.modelo ? "Auto" : "Outros",
        seguradora: selectedApolice.seguradora || "",
        vencimento: vencimento || selectedApolice.fim || "",
        premio: selectedApolice.premio || "",
        dias: 0,
        status,
        observacoes,
        veiculos: selectedApolice.veiculo ? [{
          id: crypto.randomUUID(),
          marca: selectedApolice.veiculo.fabricante || "",
          modelo: selectedApolice.veiculo.modelo || "",
          ano: selectedApolice.veiculo.ano || "",
          placa: selectedApolice.veiculo.placa || "",
          chassi: selectedApolice.veiculo.chassi || "",
        }] : [],
        renovacao_data: {
          source_apolice_id: selectedApolice.id,
          client_id: selectedClient.id,
        },
      });

      queryClient.invalidateQueries({ queryKey: ["renovacao-clients"] });
      toast.success("Renovação criada com sucesso!");
      resetForm();
      onOpenChange(false);
    } catch {
      toast.error("Erro ao criar renovação");
    } finally {
      setSaving(false);
    }
  };

  const statusOptions = statuses && statuses.length > 0
    ? statuses.sort((a, b) => a.ordem - b.ordem)
    : [];

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-accent" /> Nova Renovação
          </DialogTitle>
          <DialogDescription>Selecione o cliente e a apólice para criar a renovação.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Client selection */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Cliente</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente por nome ou CPF..."
                className="pl-9 h-9 text-sm"
                value={clientSearch}
                onChange={(e) => { setClientSearch(e.target.value); setSelectedClientId(""); setSelectedApoliceId(""); }}
              />
            </div>
            {loadingClients ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                <Loader2 className="h-3 w-3 animate-spin" /> Carregando clientes...
              </div>
            ) : clientSearch && filteredClients.length > 0 && !selectedClientId ? (
              <div className="border border-border rounded-md max-h-40 overflow-y-auto">
                {filteredClients.slice(0, 10).map(c => (
                  <button
                    key={c.id}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors border-b border-border last:border-b-0"
                    onClick={() => { setSelectedClientId(c.id); setClientSearch(c.nome); setSelectedApoliceId(""); }}
                  >
                    <span className="font-medium">{c.nome}</span>
                    {c.cpf && <span className="text-muted-foreground ml-2 text-xs">CPF: {c.cpf}</span>}
                  </button>
                ))}
              </div>
            ) : clientSearch && filteredClients.length === 0 ? (
              <p className="text-xs text-muted-foreground py-1">Nenhum cliente encontrado</p>
            ) : null}
            {selectedClient && (
              <div className="bg-muted/30 rounded-md p-2 text-xs space-y-0.5">
                <p><span className="font-medium">Nome:</span> {selectedClient.nome}</p>
                {selectedClient.cpf && <p><span className="font-medium">CPF:</span> {selectedClient.cpf}</p>}
                {selectedClient.telefone && <p><span className="font-medium">Telefone:</span> {selectedClient.telefone}</p>}
              </div>
            )}
          </div>

          <Separator />

          {/* Apólice selection */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Apólice</Label>
            {!selectedClientId ? (
              <p className="text-xs text-muted-foreground">Selecione um cliente primeiro</p>
            ) : loadingApolices ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                <Loader2 className="h-3 w-3 animate-spin" /> Carregando apólices...
              </div>
            ) : clientApolices.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhuma apólice encontrada para este cliente</p>
            ) : (
              <Select value={selectedApoliceId} onValueChange={setSelectedApoliceId}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Selecione a apólice" />
                </SelectTrigger>
                <SelectContent>
                  {clientApolices.map(a => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.id} — {a.seguradora} ({a.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {selectedApolice && (
              <div className="bg-muted/30 rounded-md p-2 text-xs space-y-0.5">
                <p><span className="font-medium">Seguradora:</span> {selectedApolice.seguradora}</p>
                <p><span className="font-medium">Vigência:</span> {selectedApolice.inicio} a {selectedApolice.fim}</p>
                <p><span className="font-medium">Prêmio:</span> {selectedApolice.premio}</p>
                {selectedApolice.veiculo?.placa && selectedApolice.veiculo.placa !== "—" && (
                  <p><span className="font-medium">Veículo:</span> {selectedApolice.veiculo.fabricante} {selectedApolice.veiculo.modelo} — {selectedApolice.veiculo.placa}</p>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Additional fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.length > 0 ? statusOptions.map(s => (
                    <SelectItem key={s.id} value={s.key}>{s.label}</SelectItem>
                  )) : (
                    <>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="Urgente">Urgente</SelectItem>
                      <SelectItem value="Em Contato">Em Contato</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Vencimento</Label>
              <Input
                type="date"
                className="h-9 text-sm"
                value={vencimento}
                onChange={(e) => setVencimento(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Observações</Label>
            <Textarea
              className="text-sm min-h-[60px]"
              placeholder="Observações sobre a renovação..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { resetForm(); onOpenChange(false); }}>Cancelar</Button>
          <Button
            onClick={handleCreate}
            disabled={saving || !selectedClientId || !selectedApoliceId || !status}
            className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Criar Renovação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
