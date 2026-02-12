import { useState } from "react";
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
import { Plus, Trash2, Car } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

const vehicleSchema = z.object({
  modelo: z.string().trim().min(1, "Modelo obrigatório").max(100),
  ano: z.string().trim().min(4, "Ano inválido").max(4),
  placa: z.string().trim().min(7, "Placa inválida").max(10),
});

const clientSchema = z.object({
  nome: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres").max(100),
  cpf: z.string().trim().min(11, "CPF/CNPJ inválido").max(18),
  telefone: z.string().trim().min(10, "Telefone inválido").max(20),
  endereco: z.string().trim().min(3, "Endereço obrigatório").max(200),
  cep: z.string().trim().min(8, "CEP inválido").max(10),
  premio: z.string().trim().min(1, "Prêmio obrigatório"),
  premio_liquido: z.string().trim().min(1, "Prêmio líquido obrigatório"),
  numero_parcelas: z.coerce.number().min(1, "Mínimo 1 parcela"),
  valor_parcela: z.string().trim().min(1, "Valor da parcela obrigatório"),
  numero_proposta: z.string().trim().max(50).optional().default(""),
  numero_apolice: z.string().trim().max(50).optional().default(""),
  codigo_ci: z.string().trim().max(50).optional().default(""),
  veiculos: z.array(vehicleSchema).min(1, "Adicione ao menos um veículo"),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface NewClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientCreated?: (client: ClientFormData) => void;
  editData?: Partial<ClientFormData> | null;
}

export function NewClientDialog({ open, onOpenChange, onClientCreated, editData }: NewClientDialogProps) {
  const isEditing = !!editData;

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      nome: "", cpf: "", telefone: "", endereco: "", cep: "",
      premio: "", premio_liquido: "", numero_parcelas: 1, valor_parcela: "",
      numero_proposta: "", numero_apolice: "", codigo_ci: "",
      veiculos: [{ modelo: "", ano: "", placa: "" }],
      ...editData,
    },
  });

  // Reset form when editData changes
  useState(() => {
    if (editData) {
      form.reset({
        nome: "", cpf: "", telefone: "", endereco: "", cep: "",
        premio: "", premio_liquido: "", numero_parcelas: 1, valor_parcela: "",
        numero_proposta: "", numero_apolice: "", codigo_ci: "",
        veiculos: [{ modelo: "", ano: "", placa: "" }],
        ...editData,
      });
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "veiculos",
  });

  const onSubmit = (data: ClientFormData) => {
    try {
      onClientCreated?.(data);
      toast({ title: isEditing ? "Cliente atualizado!" : "Cliente cadastrado!", description: `${data.nome} ${isEditing ? "atualizado" : "adicionado"} com sucesso.` });
      form.reset();
      onOpenChange(false);
    } catch {
      toast({ title: "Erro ao salvar cliente", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>{isEditing ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
          <DialogDescription>{isEditing ? "Atualize os dados do cliente." : "Preencha os dados do cliente e seus veículos."}</DialogDescription>
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
                  <FormField control={form.control} name="endereco" render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Endereço</FormLabel>
                      <FormControl><Input placeholder="Rua, número, bairro, cidade" {...field} /></FormControl>
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

              {/* Dados do seguro */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Dados do Seguro</h4>
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="premio" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prêmio</FormLabel>
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
                  <FormField control={form.control} name="numero_parcelas" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nº de Parcelas</FormLabel>
                      <FormControl><Input type="number" min={1} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="valor_parcela" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor da Parcela</FormLabel>
                      <FormControl><Input placeholder="R$ 0,00" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="numero_proposta" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nº da Proposta</FormLabel>
                      <FormControl><Input placeholder="Opcional" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="numero_apolice" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nº da Apólice</FormLabel>
                      <FormControl><Input placeholder="Opcional" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="codigo_ci" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código C.I</FormLabel>
                      <FormControl><Input placeholder="Opcional" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <Separator />

              {/* Veículos */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Car className="h-4 w-4" /> Veículos
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1 text-xs"
                    onClick={() => append({ modelo: "", ano: "", placa: "" })}
                  >
                    <Plus className="h-3 w-3" /> Adicionar Veículo
                  </Button>
                </div>
                <div className="space-y-3">
                  {fields.map((item, index) => (
                    <div key={item.id} className="rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">Veículo {index + 1}</span>
                        {fields.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => remove(index)}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <FormField control={form.control} name={`veiculos.${index}.modelo`} render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Modelo</FormLabel>
                            <FormControl><Input placeholder="Ex: Civic 2.0" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name={`veiculos.${index}.ano`} render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Ano</FormLabel>
                            <FormControl><Input placeholder="2024" maxLength={4} {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name={`veiculos.${index}.placa`} render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Placa</FormLabel>
                            <FormControl><Input placeholder="ABC1D23" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">{isEditing ? "Salvar Alterações" : "Cadastrar Cliente"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
