import { useState, useMemo, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Car, Search, User, Target, X } from "lucide-react";
import { DocumentUploadSection } from "@/components/shared/DocumentUploadSection";

interface ClienteOption {
  id: number;
  nome: string;
  cpf: string;
  tipo: "PF" | "PJ";
  origem: "cliente" | "lead";
}

const clientesExistentes: ClienteOption[] = [
  { id: 1, nome: "João Silva", cpf: "123.456.789-00", tipo: "PF", origem: "cliente" },
  { id: 2, nome: "Empresa ABC Ltda", cpf: "12.345.678/0001-90", tipo: "PJ", origem: "cliente" },
  { id: 3, nome: "Maria Santos", cpf: "987.654.321-00", tipo: "PF", origem: "cliente" },
  { id: 4, nome: "Carlos Mendes", cpf: "456.789.123-00", tipo: "PF", origem: "cliente" },
  { id: 5, nome: "Fernanda Costa", cpf: "321.654.987-00", tipo: "PF", origem: "cliente" },
  { id: 6, nome: "Indústria XYZ S/A", cpf: "98.765.432/0001-10", tipo: "PJ", origem: "cliente" },
  { id: 7, nome: "Roberto Lima", cpf: "654.321.987-00", tipo: "PF", origem: "cliente" },
  { id: 8, nome: "Ana Souza", cpf: "789.123.456-00", tipo: "PF", origem: "cliente" },
  { id: 101, nome: "Ricardo Almeida", cpf: "111.222.333-44", tipo: "PF", origem: "lead" },
  { id: 102, nome: "Transportes Beta Ltda", cpf: "11.222.333/0001-44", tipo: "PJ", origem: "lead" },
  { id: 103, nome: "Luciana Ferreira", cpf: "555.666.777-88", tipo: "PF", origem: "lead" },
];

interface NovaApoliceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NovaApoliceDialog({ open, onOpenChange }: NovaApoliceDialogProps) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    cliente: "", ramo: "", seguradora: "", inicio: "", fim: "", premio: "",
    placa: "", modelo: "", anoFab: "", anoModelo: "", chassi: "",
  });
  const [arquivoApolice, setArquivoApolice] = useState<File | null>(null);
  const [arquivoProposta, setArquivoProposta] = useState<File | null>(null);

  const [clienteSearch, setClienteSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<ClienteOption | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredClientes = useMemo(() => {
    if (!clienteSearch.trim()) return clientesExistentes;
    const q = clienteSearch.toLowerCase();
    return clientesExistentes.filter(
      c => c.nome.toLowerCase().includes(q) || c.cpf.includes(q)
    );
  }, [clienteSearch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectCliente = (c: ClienteOption) => {
    setSelectedCliente(c);
    setForm(f => ({ ...f, cliente: c.nome }));
    setClienteSearch("");
    setShowDropdown(false);
  };

  const handleClearCliente = () => {
    setSelectedCliente(null);
    setForm(f => ({ ...f, cliente: "" }));
    setClienteSearch("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

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
    setSelectedCliente(null);
    setClienteSearch("");
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
          {/* Dados da Apólice */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Dados da Apólice</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs">Cliente / Lead *</Label>
                {selectedCliente ? (
                  <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-muted/50">
                    {selectedCliente.origem === "lead" ? (
                      <Target className="h-3.5 w-3.5 text-warning shrink-0" />
                    ) : (
                      <User className="h-3.5 w-3.5 text-primary shrink-0" />
                    )}
                    <span className="text-sm font-medium flex-1 truncate">{selectedCliente.nome}</span>
                    <Badge variant="outline" className="text-[9px] shrink-0">
                      {selectedCliente.origem === "lead" ? "Lead" : selectedCliente.tipo}
                    </Badge>
                    <button onClick={handleClearCliente} className="text-muted-foreground hover:text-foreground shrink-0">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="relative" ref={dropdownRef}>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      ref={inputRef}
                      value={clienteSearch}
                      onChange={e => { setClienteSearch(e.target.value); setShowDropdown(true); }}
                      onFocus={() => setShowDropdown(true)}
                      placeholder="Buscar por nome ou CPF/CNPJ..."
                      className="pl-9 h-9 text-sm"
                    />
                    {showDropdown && (
                      <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {filteredClientes.length === 0 ? (
                          <p className="px-3 py-2 text-xs text-muted-foreground text-center">Nenhum resultado encontrado</p>
                        ) : (
                          filteredClientes.map(c => (
                            <button
                              key={`${c.origem}-${c.id}`}
                              className="w-full text-left px-3 py-2 hover:bg-muted/60 transition-colors flex items-center gap-2"
                              onClick={() => handleSelectCliente(c)}
                            >
                              {c.origem === "lead" ? (
                                <Target className="h-3.5 w-3.5 text-warning shrink-0" />
                              ) : (
                                <User className="h-3.5 w-3.5 text-primary shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{c.nome}</p>
                                <p className="text-[10px] text-muted-foreground">{c.cpf}</p>
                              </div>
                              <Badge variant="outline" className="text-[9px] shrink-0">
                                {c.origem === "lead" ? "Lead" : c.tipo}
                              </Badge>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
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
          <DocumentUploadSection
            arquivoApolice={arquivoApolice}
            setArquivoApolice={setArquivoApolice}
            arquivoProposta={arquivoProposta}
            setArquivoProposta={setArquivoProposta}
            required
          />
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
