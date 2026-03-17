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
import { toast } from "@/hooks/use-toast";
import { Loader2, UserPlus, Users } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { NewLeadDialog } from "@/components/leads/NewLeadDialog";
import type { SinistroItem } from "./SinistroKanban";

const sinistroSchema = z.object({
  clienteId: z.string().min(1, "Selecione um cliente"),
  clienteNome: z.string().optional(),
  tipo: z.string().min(1, "Informe o tipo do sinistro"),
  seguradora: z.string().min(1, "Informe a seguradora"),
  apolice: z.string().optional(),
  valor: z.string().optional(),
  prioridade: z.enum(["Baixa", "Média", "Alta", "Crítica"]),
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
  const [showNewLeadDialog, setShowNewLeadDialog] = useState(false);
  const { data: clients, isLoading: loadingClients } = useClients();

  const form = useForm<SinistroFormData>({
    resolver: zodResolver(sinistroSchema),
    defaultValues: {
      clienteId: "", clienteNome: "", tipo: "", seguradora: "", apolice: "",
      valor: "", prioridade: "Média", telefone: "", oficina: "", observacoes: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset();
      setActiveTab("existente");
    }
  }, [open]);

  const selectedClientId = form.watch("clienteId");

  useEffect(() => {
    if (selectedClientId && clients) {
      const client = clients.find(c => c.id === selectedClientId);
      if (client) {
        form.setValue("clienteNome", client.nome);
        form.setValue("telefone", client.telefone || client.celular || "");
        // Auto-fill seguradora from first vehicle if available
        if (client.vehicles?.[0]?.financial?.seguradora) {
          form.setValue("seguradora", client.vehicles[0].financial.seguradora);
        }
        if (client.vehicles?.[0]?.financial?.numero_apolice) {
          form.setValue("apolice", client.vehicles[0].financial.numero_apolice);
        }
      }
    }
  }, [selectedClientId, clients]);

  const onSubmit = async (data: SinistroFormData) => {
    try {
      setLoading(true);
      const clientName = clients?.find(c => c.id === data.clienteId)?.nome || data.clienteNome || "Cliente";
      const newSinistro: SinistroItem = {
        id: `#${Math.floor(Math.random() * 9000) + 1000}`,
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
      };

      onSinistroCriado?.(newSinistro);
      toast({ title: "Sinistro criado!", description: `Sinistro para ${clientName} registrado com sucesso.` });
      form.reset();
      onOpenChange(false);
    } catch {
      toast({ title: "Erro ao criar sinistro", variant: "destructive" });
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
            <DialogDescription>Registre um novo sinistro vinculado a um cliente.</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
              <ScrollArea className="h-[calc(90vh-200px)] px-6">
                <div className="space-y-4 pb-4">
                  {/* Client selection */}
                  <div className="space-y-3">
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "existente" | "novo")}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="existente" className="text-xs gap-1.5">
                          <Users className="h-3.5 w-3.5" /> Cliente existente
                        </TabsTrigger>
                        <TabsTrigger value="novo" className="text-xs gap-1.5">
                          <UserPlus className="h-3.5 w-3.5" /> Novo cliente
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="existente" className="mt-3">
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
                      </TabsContent>

                      <TabsContent value="novo" className="mt-3">
                        <p className="text-sm text-muted-foreground mb-2">
                          Crie um novo cliente/lead que será vinculado ao sinistro.
                        </p>
                        <Button type="button" variant="outline" className="w-full gap-2" onClick={() => setShowNewLeadDialog(true)}>
                          <UserPlus className="h-4 w-4" />
                          Cadastrar novo cliente (Lead)
                        </Button>
                      </TabsContent>
                    </Tabs>
                  </div>

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
                            <SelectItem value="Média">Média</SelectItem>
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

      <NewLeadDialog
        open={showNewLeadDialog}
        onOpenChange={setShowNewLeadDialog}
        onLeadCreated={() => {
          toast({ title: "Lead/Cliente criado!", description: "Agora selecione o cliente na aba 'Cliente existente'." });
          setActiveTab("existente");
        }}
      />
    </>
  );
}
