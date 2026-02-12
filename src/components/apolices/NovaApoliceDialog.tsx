import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, X, Car } from "lucide-react";

interface NovaApoliceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NovaApoliceDialog({ open, onOpenChange }: NovaApoliceDialogProps) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    cliente: "",
    ramo: "",
    seguradora: "",
    inicio: "",
    fim: "",
    premio: "",
    // Veículo
    placa: "",
    modelo: "",
    anoFab: "",
    anoModelo: "",
    chassi: "",
  });
  const [arquivoApolice, setArquivoApolice] = useState<File | null>(null);
  const [arquivoProposta, setArquivoProposta] = useState<File | null>(null);

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (f: File | null) => void
  ) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > 10 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande", description: "Máximo 10MB", variant: "destructive" });
      return;
    }
    setter(file);
  };

  const handleSave = () => {
    if (!form.cliente.trim() || !form.ramo || !form.seguradora.trim()) {
      toast({ title: "Preencha os campos obrigatórios", description: "Cliente, ramo e seguradora são obrigatórios", variant: "destructive" });
      return;
    }
    if (!arquivoApolice) {
      toast({ title: "Anexe o arquivo da apólice", variant: "destructive" });
      return;
    }
    if (!arquivoProposta) {
      toast({ title: "Anexe o arquivo da proposta", variant: "destructive" });
      return;
    }

    toast({ title: "Apólice cadastrada com sucesso", description: `Cliente: ${form.cliente}` });
    setForm({ cliente: "", ramo: "", seguradora: "", inicio: "", fim: "", premio: "", placa: "", modelo: "", anoFab: "", anoModelo: "", chassi: "" });
    setArquivoApolice(null);
    setArquivoProposta(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" /> Nova Apólice — Veículo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Dados do Cliente / Apólice */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Dados da Apólice</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs">Cliente *</Label>
                <Input value={form.cliente} onChange={e => update("cliente", e.target.value)} placeholder="Nome do cliente" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Ramo *</Label>
                <Select value={form.ramo} onValueChange={v => update("ramo", v)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Auto">Auto</SelectItem>
                    <SelectItem value="Moto">Moto</SelectItem>
                    <SelectItem value="Caminhão">Caminhão</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Seguradora *</Label>
                <Input value={form.seguradora} onChange={e => update("seguradora", e.target.value)} placeholder="Ex: Porto Seguro" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Início Vigência</Label>
                <Input type="date" value={form.inicio} onChange={e => update("inicio", e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Fim Vigência</Label>
                <Input type="date" value={form.fim} onChange={e => update("fim", e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs">Prêmio (R$)</Label>
                <Input value={form.premio} onChange={e => update("premio", e.target.value)} placeholder="0,00" className="h-9 text-sm" />
              </div>
            </div>
          </div>

          <Separator />

          {/* Dados do Veículo */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Dados do Veículo</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Placa</Label>
                <Input value={form.placa} onChange={e => update("placa", e.target.value.toUpperCase())} placeholder="ABC1D23" className="h-9 text-sm uppercase" maxLength={7} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Modelo</Label>
                <Input value={form.modelo} onChange={e => update("modelo", e.target.value)} placeholder="Ex: Civic EXL" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Ano Fabricação</Label>
                <Input value={form.anoFab} onChange={e => update("anoFab", e.target.value)} placeholder="2024" className="h-9 text-sm" maxLength={4} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Ano Modelo</Label>
                <Input value={form.anoModelo} onChange={e => update("anoModelo", e.target.value)} placeholder="2025" className="h-9 text-sm" maxLength={4} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs">Chassi</Label>
                <Input value={form.chassi} onChange={e => update("chassi", e.target.value.toUpperCase())} placeholder="9BWZZZ377VT004251" className="h-9 text-sm uppercase" maxLength={17} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Upload de Documentos */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Documentos Obrigatórios</h4>
            <div className="space-y-3">
              {/* Apólice */}
              <div className="space-y-1.5">
                <Label className="text-xs">Arquivo da Apólice (PDF) *</Label>
                {arquivoApolice ? (
                  <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2">
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm truncate flex-1">{arquivoApolice.name}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {(arquivoApolice.size / 1024).toFixed(0)} KB
                    </span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setArquivoApolice(null)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-3 py-3 text-sm text-muted-foreground hover:bg-muted/30 transition-colors">
                    <Upload className="h-4 w-4" />
                    <span>Clique para anexar a apólice</span>
                    <input type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={e => handleFileChange(e, setArquivoApolice)} />
                  </label>
                )}
              </div>

              {/* Proposta */}
              <div className="space-y-1.5">
                <Label className="text-xs">Arquivo da Proposta (PDF) *</Label>
                {arquivoProposta ? (
                  <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2">
                    <FileText className="h-4 w-4 text-accent shrink-0" />
                    <span className="text-sm truncate flex-1">{arquivoProposta.name}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {(arquivoProposta.size / 1024).toFixed(0)} KB
                    </span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setArquivoProposta(null)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-3 py-3 text-sm text-muted-foreground hover:bg-muted/30 transition-colors">
                    <Upload className="h-4 w-4" />
                    <span>Clique para anexar a proposta</span>
                    <input type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={e => handleFileChange(e, setArquivoProposta)} />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90">
            Cadastrar Apólice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
