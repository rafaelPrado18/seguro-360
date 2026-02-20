import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Shuffle, Clock, Users, CalendarIcon, Circle, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAgents } from "@/hooks/useAgents";

interface RedistribuirLeadsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  corretores: { id: string; nome: string }[];
  onRedistribuir: (params: { startDate: Date; startHour: string; corretorOrigem: string[]; corretoresDestino: string[] }) => void;
}

export function RedistribuirLeadsDialog({ open, onOpenChange, corretores, onRedistribuir }: RedistribuirLeadsDialogProps) {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [horario, setHorario] = useState("08:00");
  const [selectedOrigem, setSelectedOrigem] = useState<string[]>([]);
  const [selectedDestino, setSelectedDestino] = useState<string[]>([]);

  const { data: agents, isLoading: agentsLoading } = useAgents();

  const onlineCorretores = useMemo(() => {
    if (!agents) return [];
    return agents.filter(
      (a) => a.status === "online" && a.isActive && a.function !== "administrador" && a.function !== "Super Admin"
    );
  }, [agents]);

  const allCorretores = useMemo(() => {
    if (!agents) return [];
    return agents.filter(
      (a) => a.isActive && a.function !== "administrador" && a.function !== "Super Admin"
    );
  }, [agents]);

  const toggleOrigem = (id: string) => {
    setSelectedOrigem(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleDestino = (id: string) => {
    setSelectedDestino(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSubmit = () => {
    if (!horario) {
      toast.error("Informe o horário a partir do qual redistribuir.");
      return;
    }
    if (selectedDestino.length === 0) {
      toast.error("Selecione ao menos um corretor de destino.");
      return;
    }
    onRedistribuir({ startDate, startHour: horario, corretorOrigem: selectedOrigem, corretoresDestino: selectedDestino });
    toast.success(`Leads redistribuídos para ${selectedDestino.length} corretor(es) com sucesso!`);
    onOpenChange(false);
  };

  const origemLabel = selectedOrigem.length === 0
    ? "Todos os Corretores"
    : selectedOrigem.length === 1
    ? allCorretores.find(a => a.agentId === selectedOrigem[0])?.name || "1 corretor"
    : `${selectedOrigem.length} corretores`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shuffle className="h-5 w-5 text-accent" />
            Redistribuir Leads
          </DialogTitle>
          <DialogDescription>
            Redistribua os leads a partir de uma data e horário específicos, de um ou todos os corretores.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Data inicio */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-sm font-medium">
              <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
              Data início
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal h-9 text-sm", !startDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={startDate} onSelect={(d) => d && setStartDate(d)} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          </div>

          {/* Horário */}
          <div className="space-y-2">
            <Label htmlFor="horario" className="flex items-center gap-1.5 text-sm font-medium">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              Horário a partir de
            </Label>
            <Input id="horario" type="time" value={horario} onChange={(e) => setHorario(e.target.value)} className="h-9" />
            <p className="text-[11px] text-muted-foreground">
              Todos os leads recebidos a partir desta data/horário serão redistribuídos.
            </p>
          </div>

          {/* Corretor de origem - multi-select */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-sm font-medium">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              Corretor(es) de origem
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between font-normal h-9 text-sm">
                  <span className="truncate">{origemLabel}</span>
                  <ChevronDown className="h-3.5 w-3.5 ml-1 shrink-0 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="start">
                <div className="space-y-1">
                  <label className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/60 cursor-pointer transition-colors" onClick={() => setSelectedOrigem([])}>
                    <Checkbox checked={selectedOrigem.length === 0} onCheckedChange={() => setSelectedOrigem([])} />
                    <span className="text-sm font-medium">Todos</span>
                  </label>
                  {allCorretores.map(a => (
                    <label key={a.name} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/60 cursor-pointer transition-colors">
                      <Checkbox
                        checked={selectedOrigem.includes(a.name)}
                        onCheckedChange={() => toggleOrigem(a.name)}
                      />
                      <span className="text-sm">{a.name}</span>
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <p className="text-[11px] text-muted-foreground">
              Escolha corretores específicos ou redistribua de todos.
            </p>
          </div>

          {/* Corretores de destino (online) - multi-select */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-sm font-medium">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              Corretores de destino
              <Badge variant="secondary" className="ml-auto text-[10px]">
                {onlineCorretores.length} online
              </Badge>
            </Label>

            {agentsLoading ? (
              <p className="text-sm text-muted-foreground py-2">Carregando corretores…</p>
            ) : onlineCorretores.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">Nenhum corretor online no momento.</p>
            ) : (
              <div className="border rounded-md">
                <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/30">
                  <Checkbox
                    id="select-all-dest"
                    checked={selectedDestino.length === onlineCorretores.length && onlineCorretores.length > 0}
                    onCheckedChange={(checked) => {
                      setSelectedDestino(checked ? onlineCorretores.map(c => c.name) : []);
                    }}
                  />
                  <label htmlFor="select-all-dest" className="text-sm font-medium cursor-pointer">
                    Selecionar todos ({onlineCorretores.length})
                  </label>
                </div>
                <ScrollArea className="max-h-[160px]">
                  <div className="divide-y">
                    {onlineCorretores.map((agent) => (
                      <div
                        key={agent.name}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-muted/20 cursor-pointer"
                        onClick={() => toggleDestino(agent.name)}
                      >
                        <Checkbox checked={selectedDestino.includes(agent.name)} onCheckedChange={() => toggleDestino(agent.name)} />
                        <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500" />
                        <span className="text-sm">{agent.name}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
            <p className="text-[11px] text-muted-foreground">
              {selectedDestino.length > 0
                ? `${selectedDestino.length} corretor(es) selecionado(s)`
                : "Selecione os corretores que receberão os leads."}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedDestino.length === 0}
            className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Shuffle className="h-4 w-4" />
            Redistribuir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
