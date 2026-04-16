import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Loader2, UserPlus, Users, Car, Plus, Trash2 } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { useAgenda } from "@/hooks/useAgenda";
import { NewClientDialog } from "@/components/clientes/NewClientDialog";
import { sinistroService } from "@/services/sinistroService";
import type { SinistroItem } from "./SinistroKanban";
import type { SinistroTerceiro } from "@/services/sinistroService";
import type { Client, VehiclePolicy } from "@/services/clientService";

const emptyTerceiro = (): SinistroTerceiro => ({
  nome: "", telefone: "", cpf: "", cep: "", endereco: "", email: "", numero_sinistro: "",
});

const sinistroSchema = z.object({
  clienteId: z.string().min(1, "Selecione um cliente"),
  clienteNome: z.string().optional(),
  vehicleIndex: z.string().min(1, "Selecione um veículo"),
  tipo: z.string().min(1, "Informe o tipo do sinistro"),
  seguradora: z.string().min(1, "Informe a seguradora"),
  apolice: z.string().optional(),
  valor: z.string().optional(),
  prioridade: z.enum(["Baixa", "Media", "Alta", "Crítica"]),
  telefone: z.string().optional(),
  oficina: z.string().optional(),
  observacoes: z.string().optional(),
});

type SinistroFormData = z.infer<typeof sinistroSchema>;

const tipoOptions = [
  "Colisão", "Furto", "Roubo", "Incêndio", "Danos Elétricos",
  "Invalidez", "Hospitalização", "RC Geral", "Lucros Cessantes",
  "Alagamento", "Vendaval", "Outro",
];

interface NovoSinistroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSinistroCriado?: (sinistro: SinistroItem) => void;
}

export function NovoSinistroDialog({ open, onOpenChange, onSinistroCriado }: NovoSinistroDialogProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"existente" | "novo">("existente");
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);
  const [pendingClientName, setPendingClientName] = useState<string | null>(null);
  const [terceiros, setTerceiros] = useState<SinistroTerceiro[]>([]);
  const { data: clients, isLoading: loadingClients } = useClients();
  const { createTarefa } = useAgenda();

  const form = useForm<SinistroFormData>({
    resolver: zodResolver(sinistroSchema),
    defaultValues: {
      clienteId: "", clienteNome: "", vehicleIndex: "", tipo: "", seguradora: "", apolice: "",
      valor: "", prioridade: "Media", telefone: "", oficina: "", observacoes: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset();
      setActiveTab("existente");
      setPendingClientName(null);
      setTerceiros([]);
    }
  }, [open]);

  // Auto-select newly created client after react-query refetches
  useEffect(() => {
    if (pendingClientName && clients?.length) {
      const match = clients.find(c => c.nome === pendingClientName);
      if (match) {
        form.setValue("clienteId", match.id);
        setPendingClientName(null);
        setActiveTab("existente");
      }
    }
  }, [clients, pendingClientName]);

  const selectedClientId = form.watch("clienteId");
  const selectedVehicleIndex = form.watch("vehicleIndex");

  const selectedClient: Client | undefined = clients?.find(c => c.id === selectedClientId);
  const selectedVehicle: VehiclePolicy | undefined = selectedClient?.vehicles?.[Number(selectedVehicleIndex)];

  // Auto-fill fields when client is selected
  useEffect(() => {
    if (selectedClient) {
      form.setValue("clienteNome", selectedClient.nome);
      form.setValue("telefone", selectedClient.telefone || selectedClient.celular || "");
      // Reset vehicle selection when client changes
      form.setValue("vehicleIndex", "");
      form.setValue("seguradora", "");
      form.setValue("apolice", "");
    }
  }, [selectedClientId]);

  // Auto-fill from vehicle selection
  useEffect(() => {
    if (selectedVehicle) {
      form.setValue("seguradora", selectedVehicle.financial?.seguradora || "");
      form.setValue("apolice", selectedVehicle.financial?.numero_apolice || "");
    }
  }, [selectedVehicleIndex, selectedClientId]);

  const onSubmit = async (data: SinistroFormData) => {
    try {
      setLoading(true);
      const clientName = selectedClient?.nome || data.clienteNome || "Cliente";
      const vehicle = selectedVehicle;

      const sinistroId = `#${Math.floor(Math.random() * 9000) + 1000}`;

      const payload = {
        id: sinistroId,
        cliente: clientName,
        clienteId: data.clienteId,
        seguradora: data.seguradora,
        tipo: data.tipo,
        dataAbertura: new Date().toLocaleDateString("pt-BR"),
        valor: data.valor ? `R$ ${data.valor}` : "A definir",
        status: "abertura",
        prioridade: data.prioridade,
        telefone: data.telefone || "",
        apolice: data.apolice || "",
        oficina: data.oficina || "",
        observacoes: data.observacoes || "",
        veiculo: vehicle ? {
          fabricante: vehicle.vehicle.veiculo_fabricante,
          modelo: vehicle.vehicle.veiculo_modelo,
          ano: vehicle.vehicle.veiculo_ano,
          placa: vehicle.vehicle.veiculo_placa,
          chassi: vehicle.vehicle.veiculo_chassi,
        } : undefined,
        terceiros: [] as { nome: string; telefone: string; cpf: string; cep: string; endereco: string; email: string; numero_sinistro: string }[],
      };

      // Enviar para API
      await sinistroService.createSinistro(payload);

      const newSinistro: SinistroItem = { ...payload };
      onSinistroCriado?.(newSinistro);

      // Criar evento na agenda
      try {
        await createTarefa({
          titulo: `Sinistro ${sinistroId} - ${data.tipo} - ${clientName}${vehicle ? ` (${vehicle.vehicle.veiculo_placa || vehicle.vehicle.veiculo_modelo})` : ""}`,
          hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          tipo: "Sinistro",
          prioridade: data.prioridade,
          concluida: false,
        });
        toast({ title: "Agenda", description: "Evento de acompanhamento criado na agenda." });
      } catch (err) {
        console.error("Erro ao criar evento na agenda:", err);
        toast({ title: "Aviso", description: "Sinistro criado, mas não foi possível criar o evento na agenda.", variant: "destructive" });
      }

      toast({ title: "Sinistro criado!", description: `Sinistro para ${clientName} registrado com sucesso.` });
      form.reset();
      onOpenChange(false);
    } catch {
      toast({ title: "Erro ao criar sinistro", description: "Não foi possível registrar o sinistro. Tente novamente.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[580px] max-h-[90vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>Novo Sinistro</DialogTitle>
            <DialogDescription>Registre um novo sinistro vinculado a um cliente e veículo.</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
              <ScrollArea className="h-[calc(90vh-200px)] px-6">
                <div className="space-y-4 pb-4">
                  {/* Client selection */}
                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "existente" | "novo")}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="existente" className="text-xs gap-1.5">
                        <Users className="h-3.5 w-3.5" /> Cliente existente
                      </TabsTrigger>
                      <TabsTrigger value="novo" className="text-xs gap-1.5">
                        <UserPlus className="h-3.5 w-3.5" /> Novo cliente
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="existente" className="mt-3 space-y-3">
                      <FormField control={form.control} name="clienteId" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cliente</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={loadingClients ? "Carregando..." : "Selecione um cliente"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(clients || []).map(c => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.nome} — {c.cpf}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />

                      {/* Vehicle selection - shown when client is selected */}
                      {selectedClient && selectedClient.vehicles.length > 0 && (
                        <FormField control={form.control} name="vehicleIndex" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Veículo</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o veículo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {selectedClient.vehicles.map((vp, idx) => (
                                  <SelectItem key={idx} value={String(idx)}>
                                    {vp.vehicle.veiculo_fabricante} {vp.vehicle.veiculo_modelo} — {vp.vehicle.veiculo_placa || "Sem placa"}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                      )}

                      {/* Vehicle info card */}
                      {selectedVehicle && (
                        <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                          <div className="flex items-center gap-2 mb-1">
                            <Car className="h-4 w-4 text-primary" />
                            <span className="text-sm font-semibold text-foreground">Dados do Veículo</span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Fabricante</span>
                              <span className="font-medium">{selectedVehicle.vehicle.veiculo_fabricante || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Modelo</span>
                              <span className="font-medium">{selectedVehicle.vehicle.veiculo_modelo || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Ano</span>
                              <span className="font-medium">{selectedVehicle.vehicle.veiculo_ano || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Placa</span>
                              <span className="font-medium font-mono">{selectedVehicle.vehicle.veiculo_placa || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Chassi</span>
                              <span className="font-medium font-mono text-xs">{selectedVehicle.vehicle.veiculo_chassi || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Combustível</span>
                              <span className="font-medium">{selectedVehicle.vehicle.veiculo_combustivel || "—"}</span>
                            </div>
                          </div>
                          {selectedVehicle.financial?.seguradora && (
                            <div className="flex items-center gap-2 pt-1 border-t border-border mt-1">
                              <Badge variant="secondary" className="text-[10px]">{selectedVehicle.financial.seguradora}</Badge>
                              {selectedVehicle.financial.numero_apolice && (
                                <span className="text-[11px] text-muted-foreground font-mono">Apólice: {selectedVehicle.financial.numero_apolice}</span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="novo" className="mt-3">
                      <p className="text-sm text-muted-foreground mb-2">
                        Crie um novo cliente que será vinculado ao sinistro.
                      </p>
                      <Button type="button" variant="outline" className="w-full gap-2" onClick={() => setShowNewClientDialog(true)}>
                        <UserPlus className="h-4 w-4" />
                        Cadastrar novo cliente
                      </Button>
                    </TabsContent>
                  </Tabs>

                  {/* Sinistro details */}
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="tipo" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de sinistro</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {tipoOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="seguradora" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seguradora</FormLabel>
                        <FormControl><Input placeholder="Nome da seguradora" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="apolice" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nº Apólice</FormLabel>
                        <FormControl><Input placeholder="Ex: #4521" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="valor" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor estimado (R$)</FormLabel>
                        <FormControl><Input placeholder="15.000" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="prioridade" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prioridade</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Baixa">Baixa</SelectItem>
                            <SelectItem value="Media">Média</SelectItem>
                            <SelectItem value="Alta">Alta</SelectItem>
                            <SelectItem value="Crítica">Crítica</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="telefone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone contato</FormLabel>
                        <FormControl><Input placeholder="(11) 99999-9999" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="oficina" render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Oficina</FormLabel>
                        <FormControl><Input placeholder="Nome da oficina (opcional)" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="observacoes" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl><Textarea placeholder="Detalhes do sinistro..." rows={3} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </ScrollArea>

              <DialogFooter className="px-6 py-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
                <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Registrar Sinistro
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <NewClientDialog
        open={showNewClientDialog}
        onOpenChange={setShowNewClientDialog}
        onClientCreated={(clientName) => {
          setPendingClientName(clientName);
        }}
      />
    </>
  );
}
