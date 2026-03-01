import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Car, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCreateClient, useUpdateClient } from "@/hooks/useClients";
import type { Client } from "@/services/clientService";

const vehicleSchema = z.object({
  modelo: z.string().trim().min(1, "Modelo obrigatório").max(100),
  ano: z.string().trim().min(4, "Ano inválido").max(4),
  placa: z.string().trim().min(7, "Placa inválida").max(10),
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
  premio_total: z.string().trim().min(1, "Prêmio obrigatório"),
  premio_liquido: z.string().trim().min(1, "Prêmio líquido obrigatório"),
  parcelas: z.string().trim().min(1, "Parcelas obrigatório"),
  valor_parcela: z.string().trim().min(1, "Valor da parcela obrigatório"),
  numero_proposta: z.string().trim().max(50).optional().default(""),
  numero_apolice: z.string().trim().max(50).optional().default(""),
  ci: z.string().trim().max(50).optional().default(""),
  seguradora: z.string().trim().max(100).optional().default(""),
  veiculo_fabricante: z.string().trim().max(100).optional().default(""),
  veiculo_modelo: z.string().trim().min(1, "Modelo obrigatório").max(100),
  veiculo_ano: z.string().trim().min(4, "Ano inválido").max(4),
  veiculo_placa: z.string().trim().min(7, "Placa inválida").max(10),
  veiculo_chassi: z.string().trim().max(50).optional().default(""),
  veiculo_combustivel: z.string().trim().max(30).optional().default(""),
  veiculo_codigo_fipe: z.string().trim().max(30).optional().default(""),
  veiculo_zero_km: z.string().trim().max(10).optional().default("Não"),
  veiculo_utilizacao: z.string().trim().max(100).optional().default(""),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface NewClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editClient?: Client | null;
}

export function NewClientDialog({ open, onOpenChange, editClient }: NewClientDialogProps) {
  const isEditing = !!editClient;
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const defaultValues: ClientFormData = {
    nome: "", cpf: "", telefone: "", celular: "", email: "",
    endereco: "", bairro: "", cidade: "", uf: "", cep: "",
    premio_total: "", premio_liquido: "", parcelas: "1", valor_parcela: "",
    numero_proposta: "", numero_apolice: "", ci: "", seguradora: "",
    veiculo_fabricante: "", veiculo_modelo: "", veiculo_ano: "", veiculo_placa: "",
    veiculo_chassi: "", veiculo_combustivel: "", veiculo_codigo_fipe: "",
    veiculo_zero_km: "Não", veiculo_utilizacao: "",
  };

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues,
  });

  useEffect(() => {
    if (editClient) {
      const v = editClient.vehicles[0];
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
        premio_total: v?.financial.premio_total || "",
        premio_liquido: v?.financial.premio_liquido || "",
        parcelas: v?.financial.parcelas || "1",
        valor_parcela: v?.financial.valor_parcela || "",
        numero_proposta: v?.financial.numero_proposta || "",
        numero_apolice: v?.financial.numero_apolice || "",
        ci: v?.financial.ci || "",
        seguradora: v?.financial.seguradora || "",
        veiculo_fabricante: v?.vehicle.veiculo_fabricante || "",
        veiculo_modelo: v?.vehicle.veiculo_modelo || "",
        veiculo_ano: v?.vehicle.veiculo_ano || "",
        veiculo_placa: v?.vehicle.veiculo_placa || "",
        veiculo_chassi: v?.vehicle.veiculo_chassi || "",
        veiculo_combustivel: v?.vehicle.veiculo_combustivel || "",
        veiculo_codigo_fipe: v?.vehicle.veiculo_codigo_fipe || "",
        veiculo_zero_km: v?.vehicle.veiculo_zero_km || "Não",
        veiculo_utilizacao: v?.vehicle.veiculo_utilizacao || "",
      });
    } else {
      form.reset(defaultValues);
    }
  }, [editClient, open]);

  const onSubmit = (data: ClientFormData) => {
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
      vehicle_data: {
        veiculo_fabricante: data.veiculo_fabricante || "",
        veiculo_modelo: data.veiculo_modelo,
        veiculo_ano: data.veiculo_ano,
        veiculo_placa: data.veiculo_placa,
        veiculo_chassi: data.veiculo_chassi || "",
        veiculo_combustivel: data.veiculo_combustivel || "",
        veiculo_codigo_fipe: data.veiculo_codigo_fipe || "",
        veiculo_zero_km: data.veiculo_zero_km || "Não",
        veiculo_utilizacao: data.veiculo_utilizacao || "",
      },
      financial_data: {
        premio_total: data.premio_total,
        premio_liquido: data.premio_liquido,
        parcelas: data.parcelas,
        valor_parcela: data.valor_parcela,
        numero_proposta: data.numero_proposta || "",
        numero_apolice: data.numero_apolice || "",
        ci: data.ci || "",
        vigencia_inicio: "",
        vigencia_fim: "",
        seguradora: data.seguradora || "",
        comissao: "",
        classe_bonus: "",
        iof: "",
        forma_pagamento: "",
        franquia: "",
        coberturas: [],
      },
    };

    if (isEditing && editClient) {
      updateMutation.mutate(
        { id: editClient.id, payload },
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
          form.reset(defaultValues);
          onOpenChange(false);
        },
        onError: () => toast({ title: "Erro ao cadastrar", variant: "destructive" }),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>{isEditing ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
          <DialogDescription>{isEditing ? "Atualize os dados do cliente." : "Preencha os dados do cliente."}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-140px)] px-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pb-4">
              {/* Dados pessoais */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Dados Pessoais</h4>
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
              </div>

              <Separator />

              {/* Veículo */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Car className="h-4 w-4" /> Veículo
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="veiculo_fabricante" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fabricante</FormLabel>
                      <FormControl><Input placeholder="CHEVROLET" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="veiculo_modelo" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo</FormLabel>
                      <FormControl><Input placeholder="Tracker 1.0" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="veiculo_ano" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ano</FormLabel>
                      <FormControl><Input placeholder="2024" maxLength={4} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="veiculo_placa" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Placa</FormLabel>
                      <FormControl><Input placeholder="ABC1D23" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="veiculo_chassi" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chassi</FormLabel>
                      <FormControl><Input placeholder="Chassi" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="veiculo_combustivel" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Combustível</FormLabel>
                      <FormControl><Input placeholder="Flex" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="veiculo_codigo_fipe" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código FIPE</FormLabel>
                      <FormControl><Input placeholder="000000-0" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="veiculo_utilizacao" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Utilização</FormLabel>
                      <FormControl><Input placeholder="Particular" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <Separator />

              {/* Dados financeiros */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Dados do Seguro</h4>
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="seguradora" render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Seguradora</FormLabel>
                      <FormControl><Input placeholder="Nome da seguradora" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="premio_total" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prêmio Total</FormLabel>
                      <FormControl><Input placeholder="R$ 0,00" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="premio_liquido" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prêmio Líquido</FormLabel>
                      <FormControl><Input placeholder="R$ 0,00" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="parcelas" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nº Parcelas</FormLabel>
                      <FormControl><Input placeholder="12" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="valor_parcela" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Parcela</FormLabel>
                      <FormControl><Input placeholder="R$ 0,00" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="numero_proposta" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nº Proposta</FormLabel>
                      <FormControl><Input placeholder="Opcional" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="numero_apolice" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nº Apólice</FormLabel>
                      <FormControl><Input placeholder="Opcional" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="ci" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código C.I</FormLabel>
                      <FormControl><Input placeholder="Opcional" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={isPending}>
                  {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {isEditing ? "Salvar Alterações" : "Cadastrar Cliente"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
