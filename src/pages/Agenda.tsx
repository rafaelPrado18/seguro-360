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
import { Plus, Clock, CheckCircle2, AlertCircle, Calendar, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Tarefa {
  id: number;
  titulo: string;
  hora: string;
  tipo: string;
  prioridade: string;
  concluida: boolean;
}

const INITIAL_TAREFAS: Tarefa[] = [
  { id: 1, titulo: "Ligar para Carlos Mendes - Renovação Auto", hora: "09:00", tipo: "Renovação", prioridade: "Alta", concluida: true },
  { id: 2, titulo: "Enviar proposta Empresa XYZ - Seguro Empresarial", hora: "10:30", tipo: "Proposta", prioridade: "Alta", concluida: false },
  { id: 3, titulo: "Acompanhar sinistro #892 - João Silva", hora: "11:00", tipo: "Sinistro", prioridade: "Média", concluida: false },
  { id: 4, titulo: "Reunião com seguradora Allianz", hora: "14:00", tipo: "Reunião", prioridade: "Média", concluida: false },
  { id: 5, titulo: "Enviar documentação sinistro #889", hora: "15:30", tipo: "Sinistro", prioridade: "Alta", concluida: false },
  { id: 6, titulo: "Contatar Ana Souza - Renovação Vida", hora: "16:00", tipo: "Renovação", prioridade: "Média", concluida: false },
];

const proximosDias = [
  { data: "13/02", tarefas: 4 },
  { data: "14/02", tarefas: 2 },
  { data: "15/02", tarefas: 6 },
  { data: "16/02", tarefas: 1 },
  { data: "17/02", tarefas: 3 },
];

const Agenda = () => {
  const [tarefas, setTarefas] = useState<Tarefa[]>(INITIAL_TAREFAS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novoHora, setNovoHora] = useState("");
  const [novoTipo, setNovoTipo] = useState("Reunião");
  const [novoPrioridade, setNovoPrioridade] = useState("Média");

  const toggleConcluida = (id: number) => {
    setTarefas(prev => prev.map(t =>
      t.id === id ? { ...t, concluida: !t.concluida } : t
    ));
    const tarefa = tarefas.find(t => t.id === id);
    if (tarefa && !tarefa.concluida) {
      toast({ title: "Tarefa concluída ✓", description: tarefa.titulo });
    }
  };

  const deleteTarefa = (id: number) => {
    const tarefa = tarefas.find(t => t.id === id);
    setTarefas(prev => prev.filter(t => t.id !== id));
    toast({ title: "Tarefa removida", description: tarefa?.titulo, variant: "destructive" });
  };

  const addTarefa = () => {
    if (!novoTitulo.trim() || !novoHora.trim()) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    const nova: Tarefa = {
      id: Date.now(),
      titulo: novoTitulo,
      hora: novoHora,
      tipo: novoTipo,
      prioridade: novoPrioridade,
      concluida: false,
    };
    setTarefas(prev => [...prev, nova].sort((a, b) => a.hora.localeCompare(b.hora)));
    setNovoTitulo("");
    setNovoHora("");
    setNovoTipo("Reunião");
    setNovoPrioridade("Média");
    setDialogOpen(false);
    toast({ title: "Tarefa criada!", description: nova.titulo });
  };

  const pendentes = tarefas.filter(t => !t.concluida).length;
  const concluidas = tarefas.filter(t => t.concluida).length;
  const taxaConclusao = tarefas.length > 0 ? Math.round((concluidas / tarefas.length) * 100) : 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Agenda</h2>
            <p className="text-sm text-muted-foreground">12 de Fevereiro de 2026 · {pendentes} tarefa{pendentes !== 1 ? "s" : ""} pendente{pendentes !== 1 ? "s" : ""}</p>
          </div>
          <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Nova Tarefa
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Tarefas do Dia */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" /> Tarefas de Hoje
            </h3>
            {tarefas.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">Nenhuma tarefa para hoje 🎉</p>
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
                        <Clock className="h-3 w-3" /> {t.hora}
                      </span>
                      <Badge variant="secondary" className="text-[10px]">{t.tipo}</Badge>
                    </div>
                  </div>
                  <Badge variant={t.prioridade === "Alta" ? "default" : "outline"} className={`text-[10px] ${
                    t.prioridade === "Alta" ? "bg-warning text-warning-foreground" : ""
                  }`}>{t.prioridade}</Badge>
                  <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0 opacity-0 group-hover:opacity-100" onClick={() => deleteTarefa(t.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Resumo Próximos Dias */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Próximos Dias</h3>
            {proximosDias.map((d, i) => (
              <Card key={d.data} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                <CardContent className="flex items-center justify-between py-3 px-4">
                  <span className="text-sm font-medium text-foreground">{d.data}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{d.tarefas} tarefa{d.tarefas !== 1 ? "s" : ""}</span>
                    {d.tarefas >= 5 && <AlertCircle className="h-3.5 w-3.5 text-warning" />}
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-4 px-4 text-center">
                <p className="text-3xl font-bold text-primary">{taxaConclusao}%</p>
                <p className="text-xs text-muted-foreground mt-1">Taxa de conclusão</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialog Nova Tarefa */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Nova Tarefa</DialogTitle>
            <DialogDescription>Adicione uma nova tarefa à agenda de hoje.</DialogDescription>
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
