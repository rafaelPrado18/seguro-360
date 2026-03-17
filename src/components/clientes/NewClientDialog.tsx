import { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Car, Loader2, User, Shield } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCreateClient, useUpdateClient } from "@/hooks/useClients";
import type { Client, ClientUpdatePayload } from "@/services/clientService";
import { DocumentUploadSection } from "@/components/shared/DocumentUploadSection";
import type { ExtractedDocumentData } from "@/services/documentAnalysisService";

const vehiclePolicySchema = z.object({
  veiculo_fabricante: z.string().trim().max(100).optional().default(""),
  veiculo_modelo: z.string().trim().min(1, "Modelo obrigatório").max(100),
  veiculo_ano: z.string().trim().min(4, "Ano inválido").max(4),
  veiculo_placa: z.string().trim().min(7, "Placa inválida").max(10),
  veiculo_chassi: z.string().trim().max(50).optional().default(""),
  veiculo_combustivel: z.string().trim().max(30).optional().default(""),
  veiculo_codigo_fipe: z.string().trim().max(30).optional().default(""),
  veiculo_zero_km: z.string().trim().max(10).optional().default("Não"),
  veiculo_utilizacao: z.string().trim().max(100).optional().default(""),
  // Financial / policy data per vehicle
  seguradora: z.string().trim().max(100).optional().default(""),
  premio_total: z.string().trim().optional().default(""),
  premio_liquido: z.string().trim().optional().default(""),
  parcelas: z.string().trim().optional().default("1"),
  valor_parcela: z.string().trim().optional().default(""),
  numero_proposta: z.string().trim().max(50).optional().default(""),
  numero_apolice: z.string().trim().max(50).optional().default(""),
  ci: z.string().trim().max(50).optional().default(""),
  vigencia_inicio: z.string().trim().max(20).optional().default(""),
  vigencia_fim: z.string().trim().max(20).optional().default(""),
  comissao: z.string().trim().max(50).optional().default(""),
  classe_bonus: z.string().trim().max(10).optional().default(""),
  iof: z.string().trim().max(20).optional().default(""),
  forma_pagamento: z.string().trim().max(50).optional().default(""),
  franquia: z.string().trim().max(20).optional().default(""),
});

const clientSchema = z.object({
  nome: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres").max(100),
  cpf: z.string().trim().min(11, "CPF/CNPJ inválido").max(18),
  telefone: z.string().trim().min(10, "Telefone inválido").max(20),
  celular: z.string().trim().max(20).optional().default(""),
  email: z.string().trim().email("Email inválido").optional().or(z.literal("")),
  endereco: z.string().trim().min(3, "Endereço obrigatório").max(200),
  bairro: z.string().trim().max(100).optional().default(""),
  cidade: z.string().trim().max(100).optional().default(""),
  uf: z.string().trim().max(2).optional().default(""),
  cep: z.string().trim().min(8, "CEP inválido").max(10),
  vehicles: z.array(vehiclePolicySchema).min(1, "Adicione ao menos um veículo"),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface NewClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editClient?: Client | null;
  onClientCreated?: (clientName: string) => void;
}

const emptyVehicle: z.infer<typeof vehiclePolicySchema> = {
  veiculo_fabricante: "", veiculo_modelo: "", veiculo_ano: "", veiculo_placa: "",
  veiculo_chassi: "", veiculo_combustivel: "", veiculo_codigo_fipe: "",
  veiculo_zero_km: "Não", veiculo_utilizacao: "",
  seguradora: "", premio_total: "", premio_liquido: "", parcelas: "1", valor_parcela: "",
  numero_proposta: "", numero_apolice: "", ci: "", vigencia_inicio: "", vigencia_fim: "",
  comissao: "", classe_bonus: "", iof: "", forma_pagamento: "", franquia: "",
};

export function NewClientDialog({ open, onOpenChange, editClient, onClientCreated }: NewClientDialogProps) {
  const isEditing = !!editClient;
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const [activeTab, setActiveTab] = useState("dados");
  const [activeVehicle, setActiveVehicle] = useState(0);
  const [arquivoApolice, setArquivoApolice] = useState<File | null>(null);
  const [arquivoProposta, setArquivoProposta] = useState<File | null>(null);

  const defaultValues: ClientFormData = {
    nome: "", cpf: "", telefone: "", celular: "", email: "",
    endereco: "", bairro: "", cidade: "", uf: "", cep: "",
    vehicles: [{ ...emptyVehicle }],
  };

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "vehicles" });

  const handleDocumentAnalyzed = useCallback((data: ExtractedDocumentData) => {
    const idx = activeVehicle;
    const vehicleFields: Record<string, string> = {
      veiculo_fabricante: data.veiculo_fabricante || "",
      veiculo_modelo: data.veiculo_modelo || "",
      veiculo_ano: data.veiculo_ano || "",
      veiculo_placa: data.veiculo_placa || "",
      veiculo_chassi: data.veiculo_chassi || "",
      veiculo_combustivel: data.veiculo_combustivel || "",
      veiculo_codigo_fipe: data.veiculo_codigo_fipe || "",
      veiculo_zero_km: data.veiculo_zero_km || "Não",
      veiculo_utilizacao: data.veiculo_utilizacao || "",
      seguradora: data.seguradora || "",
      premio_total: data.premio_total || "",
      premio_liquido: data.premio_liquido || "",
      parcelas: data.parcelas || "1",
      valor_parcela: data.valor_parcela || "",
      numero_proposta: data.numero_proposta || "",
      numero_apolice: data.numero_apolice || "",
      ci: data.ci || "",
      vigencia_inicio: data.vigencia_inicio || "",
      vigencia_fim: data.vigencia_fim || "",
      comissao: "",
      classe_bonus: data.classe_bonus || "",
      iof: data.iof || "",
      forma_pagamento: data.forma_pagamento || "",
      franquia: data.franquia || "",
    };
    Object.entries(vehicleFields).forEach(([key, value]) => {
      form.setValue(`vehicles.${idx}.${key}` as any, value);
    });

    if (data.segurado_nome && !form.getValues("nome")) form.setValue("nome", data.segurado_nome);
    if (data.segurado_cpf && !form.getValues("cpf")) form.setValue("cpf", data.segurado_cpf);
    if (data.segurado_email && !form.getValues("email")) form.setValue("email", data.segurado_email);
    if (data.segurado_telefone && !form.getValues("telefone")) form.setValue("telefone", data.segurado_telefone);
    if (data.segurado_celular && !form.getValues("celular")) form.setValue("celular", data.segurado_celular);
    if (data.segurado_endereco && !form.getValues("endereco")) form.setValue("endereco", data.segurado_endereco);
    if (data.segurado_bairro && !form.getValues("bairro")) form.setValue("bairro", data.segurado_bairro);
    if (data.segurado_cidade && !form.getValues("cidade")) form.setValue("cidade", data.segurado_cidade);
    if (data.segurado_uf && !form.getValues("uf")) form.setValue("uf", data.segurado_uf);
    if (data.segurado_cep && !form.getValues("cep")) form.setValue("cep", data.segurado_cep);

    toast({ title: "Dados importados!", description: `Veículo ${idx + 1} preenchido com os dados do documento.` });
  }, [activeVehicle, form]);

  useEffect(() => {
    if (editClient) {
      const vehiclesData = editClient.vehicles.length > 0
        ? editClient.vehicles.map(vp => ({
            veiculo_fabricante: vp.vehicle.veiculo_fabricante || "",
            veiculo_modelo: vp.vehicle.veiculo_modelo || "",
            veiculo_ano: vp.vehicle.veiculo_ano || "",
            veiculo_placa: vp.vehicle.veiculo_placa || "",
            veiculo_chassi: vp.vehicle.veiculo_chassi || "",
            veiculo_combustivel: vp.vehicle.veiculo_combustivel || "",
            veiculo_codigo_fipe: vp.vehicle.veiculo_codigo_fipe || "",
            veiculo_zero_km: vp.vehicle.veiculo_zero_km || "Não",
            veiculo_utilizacao: vp.vehicle.veiculo_utilizacao || "",
            seguradora: vp.financial.seguradora || "",
            premio_total: vp.financial.premio_total || "",
            premio_liquido: vp.financial.premio_liquido || "",
            parcelas: vp.financial.parcelas || "1",
            valor_parcela: vp.financial.valor_parcela || "",
            numero_proposta: vp.financial.numero_proposta || "",
            numero_apolice: vp.financial.numero_apolice || "",
            ci: vp.financial.ci || "",
            vigencia_inicio: vp.financial.vigencia_inicio || "",
            vigencia_fim: vp.financial.vigencia_fim || "",
            comissao: vp.financial.comissao || "",
            classe_bonus: vp.financial.classe_bonus || "",
            iof: vp.financial.iof || "",
            forma_pagamento: vp.financial.forma_pagamento || "",
            franquia: vp.financial.franquia || "",
          }))
        : [{ ...emptyVehicle }];

      form.reset({
        nome: editClient.nome || "",
        cpf: editClient.cpf || "",
        telefone: editClient.telefone || "",
        celular: editClient.celular || "",
        email: editClient.email || "",
        endereco: editClient.endereco || "",
        bairro: editClient.bairro || "",
        cidade: editClient.cidade || "",
        uf: editClient.uf || "",
        cep: editClient.cep || "",
        vehicles: vehiclesData,
      });
      setActiveVehicle(0);
    } else {
      form.reset(defaultValues);
      setActiveVehicle(0);
    }
    setActiveTab("dados");
  }, [editClient, open]);

  const onSubmit = (data: ClientFormData) => {
    // Use the first vehicle for the main payload (API structure)
    const firstVehicle = data.vehicles[0];
    const payload = {
      customer_data: {
        lead_id: editClient?.lead_id || "",
        lead_status: "negociacao",
        nome: data.nome,
        cpf: data.cpf,
        endereco: data.endereco,
        bairro: data.bairro || "",
        cidade: data.cidade || "",
        uf: data.uf || "",
        cep: data.cep,
        telefone: data.telefone,
        celular: data.celular || "",
        email: data.email || "",
      },
      vehicle_data: data.vehicles.map(v => ({
            veiculo_fabricante: v.veiculo_fabricante || "",
            veiculo_modelo: v.veiculo_modelo,
            veiculo_ano: v.veiculo_ano,
            veiculo_placa: v.veiculo_placa,
            veiculo_chassi: v.veiculo_chassi || "",
            veiculo_combustivel: v.veiculo_combustivel || "",
            veiculo_codigo_fipe: v.veiculo_codigo_fipe || "",
            veiculo_zero_km: v.veiculo_zero_km || "Não",
            veiculo_utilizacao: v.veiculo_utilizacao || "",
            numero_apolice: v.numero_apolice || "",
          })),
      financial_data: data.vehicles.map(v => ({
            premio_total: v.premio_total || "",
            premio_liquido: v.premio_liquido || "",
            parcelas: v.parcelas || "1",
            valor_parcela: v.valor_parcela || "",
            numero_proposta: v.numero_proposta || "",
            numero_apolice: v.numero_apolice || "",
            ci: v.ci || "",
            vigencia_inicio: v.vigencia_inicio || "",
            vigencia_fim: v.vigencia_fim || "",
            seguradora: v.seguradora || "",
            comissao: v.comissao || "",
            classe_bonus: v.classe_bonus || "",
            iof: v.iof || "",
            forma_pagamento: v.forma_pagamento || "",
            franquia: v.franquia || "",
            coberturas: [],
          })),
    };

    if (isEditing && editClient) {
      const updatePayload: ClientUpdatePayload = {
        customer_data: payload.customer_data,
        vehicle_data: payload.vehicle_data,
        financial_data: payload.financial_data,
      };
      updateMutation.mutate(
        { id: editClient.id, payload: updatePayload },
        {
          onSuccess: () => {
            toast({ title: "Cliente atualizado!", description: `${data.nome} atualizado com sucesso.` });
            form.reset(defaultValues);
            onOpenChange(false);
          },
          onError: () => toast({ title: "Erro ao atualizar", variant: "destructive" }),
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast({ title: "Cliente cadastrado!", description: `${data.nome} adicionado com sucesso.` });
          onClientCreated?.(data.nome);
          form.reset(defaultValues);
          onOpenChange(false);
        },
        onError: () => toast({ title: "Erro ao cadastrar", variant: "destructive" }),
      });
    }
  };

  const addVehicle = () => {
    append({ ...emptyVehicle });
    setActiveVehicle(fields.length);
  };

  const removeVehicle = (index: number) => {
    if (fields.length <= 1) return;
    remove(index);
    setActiveVehicle(Math.max(0, index - 1));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>{isEditing ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
          <DialogDescription>{isEditing ? "Atualize os dados do cliente." : "Preencha os dados do cliente."}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
            <div className="px-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="dados" className="text-xs gap-1.5">
                    <User className="h-3.5 w-3.5" /> Dados do Cliente
                  </TabsTrigger>
                  <TabsTrigger value="veiculos" className="text-xs gap-1.5">
                    <Car className="h-3.5 w-3.5" /> Veículos e Apólices
                  </TabsTrigger>
                </TabsList>

                <ScrollArea className="h-[calc(90vh-220px)] mt-4 pr-3">
                  {/* ── Tab: Dados do Cliente ── */}
                  <TabsContent value="dados" className="space-y-4 pb-4 mt-0">
                    <div className="grid grid-cols-2 gap-3">
                      <FormField control={form.control} name="nome" render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Nome</FormLabel>
                          <FormControl><Input placeholder="Nome completo" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="cpf" render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF/CNPJ</FormLabel>
                          <FormControl><Input placeholder="000.000.000-00" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="telefone" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl><Input placeholder="(11) 99999-9999" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="celular" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Celular</FormLabel>
                          <FormControl><Input placeholder="(11) 99999-9999" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl><Input placeholder="email@email.com" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="endereco" render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Endereço</FormLabel>
                          <FormControl><Input placeholder="Rua, número" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="bairro" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bairro</FormLabel>
                          <FormControl><Input placeholder="Bairro" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="cidade" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl><Input placeholder="Cidade" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="uf" render={({ field }) => (
                        <FormItem>
                          <FormLabel>UF</FormLabel>
                          <FormControl><Input placeholder="SP" maxLength={2} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="cep" render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl><Input placeholder="00000-000" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </TabsContent>

                  {/* ── Tab: Veículos e Apólices ── */}
                  <TabsContent value="veiculos" className="space-y-4 pb-4 mt-0">
                    {/* Document Upload */}
                    <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3">
                      <DocumentUploadSection
                        arquivoApolice={arquivoApolice}
                        setArquivoApolice={setArquivoApolice}
                        arquivoProposta={arquivoProposta}
                        setArquivoProposta={setArquivoProposta}
                        onDocumentAnalyzed={handleDocumentAnalyzed}
                        leadId={editClient?.lead_id}
                      />
                    </div>

                    <Separator />
                    {/* Vehicle selector tabs */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {fields.map((field, index) => (
                        <Button
                          key={field.id}
                          type="button"
                          variant={activeVehicle === index ? "default" : "outline"}
                          size="sm"
                          className="gap-1.5 text-xs"
                          onClick={() => setActiveVehicle(index)}
                        >
                          <Car className="h-3 w-3" />
                          Veículo {index + 1}
                        </Button>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs border-dashed"
                        onClick={addVehicle}
                      >
                        <Plus className="h-3 w-3" />
                        Adicionar
                      </Button>
                    </div>

                    {fields.map((field, index) => (
                      <div key={field.id} className={index === activeVehicle ? "space-y-4" : "hidden"}>
                        {/* Vehicle header */}
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Car className="h-4 w-4 text-primary" /> Veículo {index + 1}
                          </h4>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive gap-1.5 text-xs"
                              onClick={() => removeVehicle(index)}
                            >
                              <Trash2 className="h-3 w-3" /> Remover
                            </Button>
                          )}
                        </div>

                        {/* Vehicle fields */}
                        <div className="grid grid-cols-2 gap-3">
                          <FormField control={form.control} name={`vehicles.${index}.veiculo_fabricante`} render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>Fabricante</FormLabel>
                              <FormControl><Input placeholder="CHEVROLET" {...f} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`vehicles.${index}.veiculo_modelo`} render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>Modelo</FormLabel>
                              <FormControl><Input placeholder="Tracker 1.0" {...f} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`vehicles.${index}.veiculo_ano`} render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>Ano</FormLabel>
                              <FormControl><Input placeholder="2024" maxLength={4} {...f} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`vehicles.${index}.veiculo_placa`} render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>Placa</FormLabel>
                              <FormControl><Input placeholder="ABC1D23" {...f} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`vehicles.${index}.veiculo_chassi`} render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>Chassi</FormLabel>
                              <FormControl><Input placeholder="Chassi" {...f} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`vehicles.${index}.veiculo_combustivel`} render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>Combustível</FormLabel>
                              <FormControl><Input placeholder="Flex" {...f} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`vehicles.${index}.veiculo_codigo_fipe`} render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>Código FIPE</FormLabel>
                              <FormControl><Input placeholder="000000-0" {...f} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`vehicles.${index}.veiculo_utilizacao`} render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>Utilização</FormLabel>
                              <FormControl><Input placeholder="Particular" {...f} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>

                        <Separator />

                        {/* Policy / Financial fields for this vehicle */}
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" /> Apólice do Veículo {index + 1}
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <FormField control={form.control} name={`vehicles.${index}.seguradora`} render={({ field: f }) => (
                            <FormItem className="col-span-2">
                              <FormLabel>Seguradora</FormLabel>
                              <FormControl><Input placeholder="Nome da seguradora" {...f} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`vehicles.${index}.premio_total`} render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>Prêmio Total</FormLabel>
                              <FormControl><Input placeholder="R$ 0,00" {...f} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`vehicles.${index}.premio_liquido`} render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>Prêmio Líquido</FormLabel>
                              <FormControl><Input placeholder="R$ 0,00" {...f} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`vehicles.${index}.parcelas`} render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>Nº Parcelas</FormLabel>
                              <FormControl><Input placeholder="12" {...f} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`vehicles.${index}.valor_parcela`} render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>Valor Parcela</FormLabel>
                              <FormControl><Input placeholder="R$ 0,00" {...f} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`vehicles.${index}.numero_proposta`} render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>Nº Proposta</FormLabel>
                              <FormControl><Input placeholder="Opcional" {...f} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`vehicles.${index}.numero_apolice`} render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>Nº Apólice</FormLabel>
                              <FormControl><Input placeholder="Opcional" {...f} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`vehicles.${index}.ci`} render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>Código C.I</FormLabel>
                              <FormControl><Input placeholder="Opcional" {...f} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`vehicles.${index}.vigencia_inicio`} render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>Vigência Início</FormLabel>
                              <FormControl><Input placeholder="DD/MM/AAAA" {...f} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`vehicles.${index}.vigencia_fim`} render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>Vigência Fim</FormLabel>
                              <FormControl><Input placeholder="DD/MM/AAAA" {...f} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`vehicles.${index}.forma_pagamento`} render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>Forma de Pagamento</FormLabel>
                              <FormControl><Input placeholder="Cartão de Crédito" {...f} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`vehicles.${index}.franquia`} render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>Franquia</FormLabel>
                              <FormControl><Input placeholder="R$ 0,00" {...f} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`vehicles.${index}.comissao`} render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>Comissão</FormLabel>
                              <FormControl><Input placeholder="Ex: 20%" {...f} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`vehicles.${index}.classe_bonus`} render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>Classe de Bônus</FormLabel>
                              <FormControl><Input placeholder="0" {...f} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`vehicles.${index}.iof`} render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>IOF</FormLabel>
                              <FormControl><Input placeholder="R$ 0,00" {...f} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </div>

            <DialogFooter className="px-6 py-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {isEditing ? "Salvar Alterações" : "Cadastrar Cliente"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
