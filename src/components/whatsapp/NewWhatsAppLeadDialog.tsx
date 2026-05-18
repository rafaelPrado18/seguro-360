import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { whatsappService } from "@/services/whatsappService";
import { leadsService } from "@/services/leadsService";
import { Loader2, AlertTriangle, User, Phone, Mail, Tag, Calendar, Clock, UserCheck } from "lucide-react";
import type { Lead } from "@/services/leadsService";
import { useState } from "react";

const schema = z.object({
  nome: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres").max(100),
  telefone: z.string().trim().min(14, "Telefone inválido").max(20),
});

type FormData = z.infer<typeof schema>;

/** Aplica máscara (DD) XXXXX-XXXX enquanto digita */
function applyPhoneMask(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function InfoRow({ icon: Icon, label, value, highlight }: { icon: React.ElementType; label: string; value?: string | null; highlight?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 text-xs">
      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground">{label}:</span>
      <span className={highlight ? "font-semibold text-foreground" : "text-foreground"}>{value}</span>
    </div>
  );
}

interface NewWhatsAppLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadCreated?: (lead: { nome: string; telefone: string }) => void;
  defaultPhone?: string;
  corretorResponsavel?: string;
}

export function NewWhatsAppLeadDialog({ open, onOpenChange, onLeadCreated, defaultPhone, corretorResponsavel }: NewWhatsAppLeadDialogProps) {
  const [loading, setLoading] = useState(false);
  const [existingLead, setExistingLead] = useState<Lead | null>(null);
  const [notOnWhatsapp, setNotOnWhatsapp] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { nome: "", telefone: defaultPhone ? applyPhoneMask(defaultPhone) : "" } as FormData,
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const telefoneDigits = data.telefone.replace(/\D/g, "");
      const fullPhone = `55${telefoneDigits}`;

      // 1) Verificar se o número possui WhatsApp
      const exists = await whatsappService.checkNumberExists(fullPhone);
      if (!exists) {
        setNotOnWhatsapp(true);
        setLoading(false);
        return;
      }

      // 2) Verificar se o lead já existe
      const foundLead = await leadsService.getLeadByPhone(fullPhone);

      if (foundLead) {
        if (foundLead.corretor_responsavel && foundLead.corretor_responsavel !== corretorResponsavel) {
          setExistingLead(foundLead);
          setLoading(false);
          return;
        }
        toast({ title: "Lead já cadastrado", description: `${foundLead.nome} já está na sua carteira. Criando contato...` });
      }

      await whatsappService.createContact({
        nome: data.nome,
        telefone: fullPhone,
        corretor_responsavel: corretorResponsavel || "",
      });
      onLeadCreated?.({ nome: data.nome, telefone: fullPhone });
      toast({ title: "Contato cadastrado!", description: `${data.nome} adicionado com sucesso.` });
      form.reset();
      onOpenChange(false);
    } catch {
      toast({ title: "Erro ao criar contato", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Novo Lead</DialogTitle>
            <DialogDescription>Cadastro rápido via WhatsApp.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="nome" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl><Input placeholder="Nome do lead" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="telefone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="(11) 99999-9999"
                      value={field.value}
                      onChange={(e) => field.onChange(applyPhoneMask(e.target.value))}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
                <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Cadastrar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog informando que o lead já existe com outro consultor */}
      <AlertDialog open={!!existingLead} onOpenChange={(o) => !o && setExistingLead(null)}>
        <AlertDialogContent className="sm:max-w-[440px]">
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <AlertDialogTitle>Lead já cadastrado</AlertDialogTitle>
            </div>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm">
                <p>
                  Este telefone já está vinculado a um lead no sistema. Veja os detalhes abaixo:
                </p>
                <div className="rounded-lg border border-border bg-muted/50 p-3 space-y-2">
                  <InfoRow icon={User} label="Nome" value={existingLead?.nome} />
                  <InfoRow icon={Mail} label="Email" value={existingLead?.email} />
                  <InfoRow icon={Phone} label="Telefone" value={existingLead?.telefone} />
                  <InfoRow icon={Tag} label="Status" value={existingLead?.status} />
                  <InfoRow icon={UserCheck} label="Consultor" value={existingLead?.corretor_responsavel} highlight />
                  <InfoRow icon={Calendar} label="Criado em" value={existingLead?.created_at} />
                  <InfoRow icon={Clock} label="Atualizado em" value={existingLead?.updated_at} />
                  {existingLead?.observacoes && (
                    <div className="pt-1 border-t border-border">
                      <span className="text-xs text-muted-foreground">Observações:</span>
                      <p className="text-xs text-foreground mt-0.5">{existingLead.observacoes}</p>
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground">
                  Não é possível criar um novo contato para este número enquanto ele estiver atribuído a outro consultor.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Entendi</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
