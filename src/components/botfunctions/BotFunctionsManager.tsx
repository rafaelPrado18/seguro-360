import { useEffect, useState } from "react";
import { Bot, Plus, Pencil, Trash2, Zap, Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { KeyValueEditor } from "@/components/shared/KeyValueEditor";
import { botFunctionService, type BotFunction, type BotFunctionType } from "@/services/botFunctionService";

const emptyFn = (): BotFunction => ({
  nome: "",
  descricao: "",
  tipo: "http",
  ativo: true,
  method: "POST",
  url: "",
  headers: {},
  body: "{\n  \n}",
  internalAction: "create_lead",
  defaultPayload: {},
  parametros: [],
});

export function BotFunctionsManager() {
  const [items, setItems] = useState<BotFunction[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BotFunction>(emptyFn());
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const list = await botFunctionService.list();
      setItems(list);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(emptyFn()); setOpen(true); };
  const openEdit = (fn: BotFunction) => { setEditing({ ...emptyFn(), ...fn }); setOpen(true); };

  const save = async () => {
    if (!editing.nome.trim()) {
      toast({ title: "Nome obrigatório", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (editing.id) await botFunctionService.update(editing);
      else await botFunctionService.create(editing);
      toast({ title: "Função salva" });
      setOpen(false);
      load();
    } catch (e) {
      toast({ title: "Erro ao salvar", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id?: string) => {
    if (!id || !confirm("Excluir esta função?")) return;
    try {
      await botFunctionService.remove(id);
      toast({ title: "Função excluída" });
      load();
    } catch (e) {
      toast({ title: "Erro", description: (e as Error).message, variant: "destructive" });
    }
  };

  const setHeader = (k: string, v: string, idx: number) => {
    const entries = Object.entries(editing.headers || {});
    entries[idx] = [k, v];
    setEditing({ ...editing, headers: Object.fromEntries(entries.filter(([h]) => h)) });
  };
  const addHeader = () => setEditing({ ...editing, headers: { ...(editing.headers || {}), "": "" } });
  const removeHeader = (idx: number) => {
    const entries = Object.entries(editing.headers || {});
    entries.splice(idx, 1);
    setEditing({ ...editing, headers: Object.fromEntries(entries) });
  };

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" /> Funções do Bot
        </CardTitle>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" /> Nova função
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-3">
          Funções reutilizáveis que ficam disponíveis no nó <strong>Ação</strong> do construtor de fluxos do bot.
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground border border-dashed rounded-md">
            Nenhuma função cadastrada ainda.
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((fn) => (
              <div key={fn.id} className="flex items-center justify-between rounded-md border border-border bg-card p-3">
                <div className="flex items-center gap-3 min-w-0">
                  {fn.tipo === "http" ? (
                    <Globe className="h-4 w-4 text-blue-600 shrink-0" />
                  ) : (
                    <Zap className="h-4 w-4 text-emerald-600 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{fn.nome}</p>
                      <Badge variant={fn.ativo ? "default" : "secondary"} className="text-[10px]">
                        {fn.ativo ? "Ativa" : "Inativa"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {fn.tipo === "http" ? `${fn.method} ${fn.url}` : fn.internalAction}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(fn)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(fn.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing.id ? "Editar função" : "Nova função"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Nome</Label>
                <Input value={editing.nome} onChange={(e) => setEditing({ ...editing, nome: e.target.value })} placeholder="Ex: Buscar CEP" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Ativa</Label>
                <div className="h-9 flex items-center">
                  <Switch checked={editing.ativo} onCheckedChange={(v) => setEditing({ ...editing, ativo: v })} />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Descrição</Label>
              <Input value={editing.descricao || ""} onChange={(e) => setEditing({ ...editing, descricao: e.target.value })} />
            </div>

            <Tabs value={editing.tipo} onValueChange={(v) => setEditing({ ...editing, tipo: v as BotFunctionType })}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="http"><Globe className="h-3.5 w-3.5 mr-1" /> HTTP / API</TabsTrigger>
                <TabsTrigger value="internal"><Zap className="h-3.5 w-3.5 mr-1" /> Ação interna</TabsTrigger>
              </TabsList>

              <TabsContent value="http" className="space-y-3 pt-3">
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <Select value={editing.method || "POST"} onValueChange={(v) => setEditing({ ...editing, method: v as BotFunction["method"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="https://api.exemplo.com/endpoint"
                    value={editing.url || ""}
                    onChange={(e) => setEditing({ ...editing, url: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Headers</Label>
                    <Button size="sm" variant="outline" onClick={addHeader}>
                      <Plus className="h-3 w-3 mr-1" /> Header
                    </Button>
                  </div>
                  {Object.entries(editing.headers || {}).map(([k, v], i) => (
                    <div key={i} className="flex gap-1.5">
                      <Input placeholder="Chave" value={k} onChange={(e) => setHeader(e.target.value, v, i)} />
                      <Input placeholder="Valor" value={v} onChange={(e) => setHeader(k, e.target.value, i)} />
                      <Button size="icon" variant="ghost" onClick={() => removeHeader(i)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Body (JSON) — use {"{{variavel}}"} para interpolar</Label>
                  <Textarea
                    rows={6}
                    className="font-mono text-xs"
                    value={editing.body || ""}
                    onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                  />
                </div>
              </TabsContent>

              <TabsContent value="internal" className="space-y-3 pt-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Tipo de ação</Label>
                  <Select
                    value={editing.internalAction || "create_lead"}
                    onValueChange={(v) => setEditing({ ...editing, internalAction: v as BotFunction["internalAction"] })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="create_lead">Criar lead</SelectItem>
                      <SelectItem value="transfer">Transferir para atendente</SelectItem>
                      <SelectItem value="tag">Adicionar tag</SelectItem>
                      <SelectItem value="schedule_task">Agendar tarefa</SelectItem>
                      <SelectItem value="send_template">Enviar template WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <KeyValueEditor
                  label="Parâmetros padrão"
                  value={editing.defaultPayload || {}}
                  onChange={(next) => setEditing({ ...editing, defaultPayload: next })}
                />
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
