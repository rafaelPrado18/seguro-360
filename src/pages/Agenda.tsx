import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Clock, CheckCircle2, AlertCircle, Calendar, Trash2, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAgenda } from "@/hooks/useAgenda";

const Agenda = () => {
  const { tarefas, isLoading, createTarefa, updateTarefa, deleteTarefa } = useAgenda();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novoHora, setNovoHora] = useState("");
  const [novoTipo, setNovoTipo] = useState("Reunião");
  const [novoPrioridade, setNovoPrioridade] = useState("Média");

  const toggleConcluida = async (id: string) => {
    const tarefa = tarefas.find(t => t.id === id);
    if (!tarefa) return;
    try {
      await updateTarefa({ id, concluida: !tarefa.concluida });
      if (!tarefa.concluida) {
        toast({ title: "Tarefa concluída ✓", description: tarefa.titulo });
      }
    } catch {
      toast({ title: "Erro ao atualizar tarefa", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    const tarefa = tarefas.find(t => t.id === id);
    try {
      await deleteTarefa(id);
      toast({ title: "Tarefa removida", description: tarefa?.titulo, variant: "destructive" });
    } catch {
      toast({ title: "Erro ao remover tarefa", variant: "destructive" });
    }
  };

  const addTarefa = async () => {
    if (!novoTitulo.trim() || !novoHora.trim()) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    try {
      const hoje = new Date().toISOString().split("T")[0];
      await createTarefa({
        titulo: novoTitulo,
        hora: `${hoje} ${novoHora}`,
        tipo: novoTipo,
        prioridade: novoPrioridade,
        concluida: false,
      });
      setNovoTitulo("");
      setNovoHora("");
      setNovoTipo("Reunião");
      setNovoPrioridade("Média");
      setDialogOpen(false);
      toast({ title: "Tarefa criada!" });
    } catch {
      toast({ title: "Erro ao criar tarefa", variant: "destructive" });
    }
  };

  const pendentes = tarefas.filter(t => !t.concluida).length;
  const concluidas = tarefas.filter(t => t.concluida).length;
  const taxaConclusao = tarefas.length > 0 ? Math.round((concluidas / tarefas.length) * 100) : 0;

  const formatHora = (hora: string) => {
    if (!hora) return "";
    // Handle "2026-03-12 14:00" format
    const parts = hora.split(" ");
    return parts.length > 1 ? parts[1].substring(0, 5) : hora.substring(0, 5);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Agenda</h2>
            <p className="text-sm text-muted-foreground">{pendentes} tarefa{pendentes !== 1 ? "s" : ""} pendente{pendentes !== 1 ? "s" : ""}</p>
          </div>
          <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Nova Tarefa
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" /> Tarefas
            </h3>
            {isLoading && (
              <Card>
                <CardContent className="py-8 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </CardContent>
              </Card>
            )}
            {!isLoading && tarefas.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">Nenhuma tarefa encontrada 🎉</p>
                </CardContent>
              </Card>
            )}
            {tarefas.map((t, i) => (
              <Card key={t.id} className={`animate-fade-in ${t.concluida ? "opacity-60" : ""}`} style={{ animationDelay: `${i * 60}ms` }}>
                <CardContent className="flex items-center gap-4 py-3 px-4">
                  <button
                    onClick={() => toggleConcluida(t.id)}
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors flex-shrink-0 cursor-pointer ${
                      t.concluida ? "border-success bg-success" : "border-border hover:border-primary"
                    }`}
                  >
                    {t.concluida && <CheckCircle2 className="h-3 w-3 text-success-foreground" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${t.concluida ? "line-through text-muted-foreground" : "text-foreground"}`}>{t.titulo}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" /> {formatHora(t.hora)}
                      </span>
                      <Badge variant="secondary" className="text-[10px]">{t.tipo}</Badge>
                    </div>
                  </div>
                  <Badge variant={t.prioridade === "Alta" ? "default" : "outline"} className={`text-[10px] ${
                    t.prioridade === "Alta" ? "bg-warning text-warning-foreground" : ""
                  }`}>{t.prioridade}</Badge>
                  <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => handleDelete(t.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Resumo</h3>
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-4 px-4 text-center">
                <p className="text-3xl font-bold text-primary">{taxaConclusao}%</p>
                <p className="text-xs text-muted-foreground mt-1">Taxa de conclusão</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-3 px-4 flex justify-between">
                <span className="text-sm text-muted-foreground">Pendentes</span>
                <span className="text-sm font-medium text-foreground flex items-center gap-1">
                  {pendentes} {pendentes >= 5 && <AlertCircle className="h-3.5 w-3.5 text-warning" />}
                </span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-3 px-4 flex justify-between">
                <span className="text-sm text-muted-foreground">Concluídas</span>
                <span className="text-sm font-medium text-foreground">{concluidas}</span>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Nova Tarefa</DialogTitle>
            <DialogDescription>Adicione uma nova tarefa à agenda.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-foreground">Título</label>
              <Input
                placeholder="Ex: Ligar para cliente sobre renovação"
                value={novoTitulo}
                onChange={(e) => setNovoTitulo(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">Horário</label>
                <Input
                  type="time"
                  value={novoHora}
                  onChange={(e) => setNovoHora(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Tipo</label>
                <Select value={novoTipo} onValueChange={setNovoTipo}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Renovação">Renovação</SelectItem>
                    <SelectItem value="Proposta">Proposta</SelectItem>
                    <SelectItem value="Sinistro">Sinistro</SelectItem>
                    <SelectItem value="Reunião">Reunião</SelectItem>
                    <SelectItem value="Cobrança">Cobrança</SelectItem>
                    <SelectItem value="Comercial">Comercial</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Prioridade</label>
              <Select value={novoPrioridade} onValueChange={setNovoPrioridade}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={addTarefa}>Criar Tarefa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Agenda;
