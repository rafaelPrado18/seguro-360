import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Copy, Send, Eye, Variable, FileText } from "lucide-react";
import type { WhatsAppTemplate } from "@/services/whatsappService";
import { useWhatsAppTemplates, useCreateWhatsAppTemplate, useUpdateWhatsAppTemplate } from "@/hooks/useWhatsApp";
import { toast } from "@/hooks/use-toast";

const AVAILABLE_VARIABLES = [
  { key: "{{nome}}", label: "Nome do Cliente", example: "João Silva" },
  { key: "{{telefone}}", label: "Telefone", example: "(11) 99999-1234" },
  { key: "{{email}}", label: "Email", example: "joao@email.com" },
  { key: "{{ramo}}", label: "Ramo de Interesse", example: "Auto" },
  { key: "{{valor_premio}}", label: "Valor do Prêmio", example: "R$ 3.200,00" },
  { key: "{{data_vencimento}}", label: "Data de Vencimento", example: "15/03/2026" },
  { key: "{{numero_apolice}}", label: "Número da Apólice", example: "#4521" },
  { key: "{{seguradora}}", label: "Seguradora", example: "Porto Seguro" },
  { key: "{{corretor}}", label: "Nome do Corretor", example: "André Oliveira" },
  { key: "{{link_proposta}}", label: "Link da Proposta", example: "https://..." },
];

const categoriaLabels: Record<string, string> = {
  boas_vindas: "Boas-vindas", proposta: "Proposta", renovacao: "Renovação",
  follow_up: "Follow-up", sinistro: "Sinistro", cobranca: "Cobrança", geral: "Geral",
};

const WhatsAppTemplates = () => {
  const { data: apiTemplates = [], isLoading } = useWhatsAppTemplates();
  const createTemplateMutation = useCreateWhatsAppTemplate();
  const updateTemplateMutation = useUpdateWhatsAppTemplate();
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);

  useEffect(() => {
    if (apiTemplates.length > 0) setTemplates(apiTemplates);
  }, [apiTemplates]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<WhatsAppTemplate | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    categoria: "geral",
    conteudo: "",
  });

  const openCreate = () => {
    setEditingTemplate(null);
    setFormData({ nome: "", categoria: "geral", conteudo: "" });
    setIsDialogOpen(true);
  };

  const openEdit = (t: WhatsAppTemplate) => {
    setEditingTemplate(t);
    setFormData({ nome: t.nome, categoria: t.categoria, conteudo: t.conteudo });
    setIsDialogOpen(true);
  };

  const insertVariable = (varKey: string) => {
    setFormData(prev => ({ ...prev, conteudo: prev.conteudo + varKey }));
  };

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{\{(\w+)\}\}/g) || [];
    return [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, "")))];
  };

  const handleSave = async () => {
    if (!formData.nome.trim() || !formData.conteudo.trim()) return;
    const vars = extractVariables(formData.conteudo);

    if (editingTemplate) {
      setTemplates(prev => prev.map(t =>
        t.id === editingTemplate.id
          ? { ...t, nome: formData.nome, categoria: formData.categoria, conteudo: formData.conteudo, variaveis: vars }
          : t
      ));
    } else {
      try {
        await createTemplateMutation.mutateAsync({
          nome: formData.nome,
          categoria: formData.categoria,
          conteudo: formData.conteudo,
          variaveis: vars,
          status: "pendente",
        });
        toast({ title: "Template criado", description: "Template salvo com sucesso na API." });
      } catch (err) {
        console.error("Erro ao criar template:", err);
        toast({ title: "Erro", description: "Não foi possível criar o template.", variant: "destructive" });
        return;
      }
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const getPreviewText = (template: WhatsAppTemplate) => {
    let text = template.conteudo;
    AVAILABLE_VARIABLES.forEach(v => {
      text = text.split(v.key).join(v.example);
    });
    return text;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Templates WhatsApp</h2>
            <p className="text-sm text-muted-foreground">Gerencie mensagens automáticas com variáveis dinâmicas</p>
          </div>
          <Button onClick={openCreate} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="h-4 w-4" /> Novo Template
          </Button>
        </div>

        {/* Variables Reference */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Variable className="h-4 w-4 text-primary" /> Variáveis Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_VARIABLES.map(v => (
                <Badge key={v.key} variant="outline" className="text-[10px] font-mono cursor-default" title={v.label}>
                  {v.key} <span className="ml-1 font-sans text-muted-foreground">({v.label})</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((t, i) => (
            <Card key={t.id} className="kpi-card-shadow hover:shadow-md transition-shadow animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{t.nome}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge variant="secondary" className="text-[9px]">{categoriaLabels[t.categoria] || t.categoria}</Badge>
                      <Badge
                        variant={t.status === "aprovado" ? "outline" : "default"}
                        className={`text-[9px] ${
                          t.status === "aprovado" ? "border-success text-success" :
                          t.status === "pendente" ? "bg-warning text-warning-foreground" :
                          "bg-destructive text-destructive-foreground"
                        }`}
                      >{t.status}</Badge>
                    </div>
                  </div>
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>

                <div className="mt-3 p-2.5 rounded-md bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-4">{t.conteudo}</p>
                </div>

                <div className="flex flex-wrap gap-1 mt-2">
                  {t.variaveis.map(v => (
                    <span key={v} className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono">{`{{${v}}}`}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setPreviewTemplate(t); setPreviewOpen(true); }} title="Preview">
                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(t)} title="Editar">
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" title="Duplicar"
                      onClick={() => setTemplates(prev => [...prev, { ...t, id: Date.now().toString(), nome: `${t.nome} (cópia)`, status: "pendente" }])}>
                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(t.id)} title="Excluir">
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs">
                    <Send className="h-3 w-3" /> Enviar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingTemplate ? "Editar Template" : "Novo Template"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Nome do Template</Label>
                  <Input value={formData.nome} onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))} placeholder="Ex: Follow-up Proposta" className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Categoria</Label>
                  <Select value={formData.categoria} onValueChange={(v) => setFormData(prev => ({ ...prev, categoria: v }))}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoriaLabels).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Variáveis (clique para inserir)</Label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_VARIABLES.map(v => (
                    <Button key={v.key} variant="outline" size="sm" className="text-[10px] h-6 font-mono" onClick={() => insertVariable(v.key)}>
                      {v.key}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Conteúdo da Mensagem</Label>
                <Textarea
                  value={formData.conteudo}
                  onChange={(e) => setFormData(prev => ({ ...prev, conteudo: e.target.value }))}
                  placeholder="Digite a mensagem usando as variáveis acima..."
                  rows={8}
                  className="text-sm font-mono"
                />
              </div>
              {formData.conteudo && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Preview</Label>
                  <div className="p-3 rounded-lg bg-muted border border-border">
                    <p className="text-sm whitespace-pre-wrap">
                      {(() => {
                        let text = formData.conteudo;
                        AVAILABLE_VARIABLES.forEach(v => { text = text.split(v.key).join(`<strong>${v.example}</strong>`); });
                        return <span dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, "<br/>") }} />;
                      })()}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90">
                {editingTemplate ? "Salvar" : "Criar Template"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Preview: {previewTemplate?.nome}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="max-w-sm mx-auto">
                <div className="bg-muted rounded-t-xl p-3 flex items-center gap-2 border border-border border-b-0">
                  <div className="h-8 w-8 rounded-full bg-success flex items-center justify-center text-success-foreground text-xs font-bold">WA</div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Cliente</p>
                    <p className="text-[10px] text-muted-foreground">online</p>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-b-xl p-4 min-h-[200px]">
                  <div className="bg-primary text-primary-foreground rounded-lg rounded-br-sm px-3 py-2 max-w-[85%] ml-auto">
                    <p className="text-sm whitespace-pre-wrap">{previewTemplate ? getPreviewText(previewTemplate) : ""}</p>
                    <p className="text-[10px] opacity-60 text-right mt-1">14:30 ✓✓</p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default WhatsAppTemplates;
