import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, CheckCircle2, AlertCircle, Calendar } from "lucide-react";

const tarefasHoje = [
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
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Agenda</h2>
            <p className="text-sm text-muted-foreground">12 de Fevereiro de 2026 · {tarefasHoje.filter(t => !t.concluida).length} tarefas pendentes</p>
          </div>
          <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
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
            {tarefasHoje.map((t, i) => (
              <Card key={t.id} className={`animate-fade-in ${t.concluida ? "opacity-60" : ""}`} style={{ animationDelay: `${i * 60}ms` }}>
                <CardContent className="flex items-center gap-4 py-3 px-4">
                  <button className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors flex-shrink-0 ${
                    t.concluida ? "border-success bg-success" : "border-border hover:border-primary"
                  }`}>
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
                <p className="text-3xl font-bold text-primary">83%</p>
                <p className="text-xs text-muted-foreground mt-1">Taxa de conclusão semanal</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Agenda;
