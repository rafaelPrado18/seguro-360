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
import { toast } from "@/hooks/use-toast";
import { leadsService } from "@/services/leadsService";
import { Loader2 } from "lucide-react";
import { DocumentUploadSection } from "@/components/shared/DocumentUploadSection";
import { Separator } from "@/components/ui/separator";
import type { Lead } from "@/services/leadsService";

const leadSchema = z.object({
  nome: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  telefone: z.string().trim().min(10, "Telefone inválido").max(20),
  veiculo: z.string().trim().max(100, "Máximo 100 caracteres").optional().default(""),
  origem: z.enum(["site", "indicacao", "whatsapp", "facebook", "instagram", "google_ads", "outro"]),
  ramo_interesse: z.string().trim().min(1, "Selecione um ramo de interesse"),
  valor_estimado: z.coerce.number().min(0, "Valor deve ser positivo"),
  observacoes: z.string().max(1000).optional().default(""),
});

type LeadFormData = z.infer<typeof leadSchema>;

const origemOptions = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "site", label: "Site" },
  { value: "indicacao", label: "Indicação" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "google_ads", label: "Google Ads" },
  { value: "outro", label: "Outro" },
];

const ramoOptions = [
  "Auto", "Vida", "Residencial", "Empresarial", "Saúde",
  "Viagem", "Responsabilidade Civil", "Condomínio", "Frota", "Outro",
];

interface NewLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadCreated?: (lead: Partial<Lead>) => void;
  corretorResponsavel?: string;
  defaultNome?: string;
  defaultTelefone?: string;
}

export function NewLeadDialog({ open, onOpenChange, onLeadCreated, corretorResponsavel, defaultNome, defaultTelefone }: NewLeadDialogProps) {
  const [loading, setLoading] = useState(false);
  const [arquivoApolice, setArquivoApolice] = useState<File | null>(null);
  const [arquivoProposta, setArquivoProposta] = useState<File | null>(null);
  const hasDefaults = !!(defaultNome || defaultTelefone);
  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      nome: defaultNome || "", email: "", telefone: defaultTelefone || "", veiculo: "", origem: "whatsapp",
      ramo_interesse: "", valor_estimado: 0, observacoes: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        nome: defaultNome || "", email: "", telefone: defaultTelefone || "", veiculo: "", origem: "whatsapp",
        ramo_interesse: "", valor_estimado: 0, observacoes: "",
      });
    }
  }, [open, defaultNome, defaultTelefone]);

  const onSubmit = async (data: LeadFormData) => {
    try {
      setLoading(true);
      const telefoneDigits = data.telefone.replace(/\D/g, "");
      await leadsService.createLead({
        nome: data.nome,
        email: data.email,
        telefone: `55${telefoneDigits}`,
        origem: data.origem,
        corretor_responsavel: corretorResponsavel || "",
        valor_estimado: String(data.valor_estimado),
        modelo: data.ramo_interesse,
        observacoes: data.observacoes || "",
      });
      const payload = {
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        origem: data.origem,
        ramo_interesse: data.ramo_interesse,
        valor_estimado: data.valor_estimado,
        observacoes: data.observacoes || "",
      };
      onLeadCreated?.(payload);
      toast({ title: "Lead cadastrado!", description: `${data.nome} adicionado com sucesso.` });
      form.reset();
      setArquivoApolice(null);
      setArquivoProposta(null);
      onOpenChange(false);
    } catch {
      toast({ title: "Erro ao cadastrar lead", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Novo Lead</DialogTitle>
          <DialogDescription>Preencha os dados do lead para cadastro.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="nome" render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Nome completo</FormLabel>
                  <FormControl><Input placeholder="Nome do lead" {...field} disabled={hasDefaults && !!defaultNome} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" placeholder="email@exemplo.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="telefone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl><Input placeholder="(11) 99999-9999" {...field} disabled={hasDefaults && !!defaultTelefone} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="veiculo" render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Veículo (modelo ou placa)</FormLabel>
                  <FormControl><Input placeholder="Ex: Honda Civic 2024 ou ABC-1D23" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="origem" render={({ field }) => (
                <FormItem>
                  <FormLabel>Origem</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {origemOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="ramo_interesse" render={({ field }) => (
                <FormItem>
                  <FormLabel>Ramo de interesse</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {ramoOptions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="valor_estimado" render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor estimado (R$)</FormLabel>
                  <FormControl><Input type="number" min={0} step={100} placeholder="0" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="observacoes" render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl><Textarea placeholder="Observações sobre o lead..." rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Separator />
            <DocumentUploadSection
              arquivoApolice={arquivoApolice}
              setArquivoApolice={setArquivoApolice}
              arquivoProposta={arquivoProposta}
              setArquivoProposta={setArquivoProposta}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
              <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Cadastrar Lead
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
