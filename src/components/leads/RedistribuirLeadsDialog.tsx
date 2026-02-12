import { useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shuffle, Clock, Users, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Corretor {
  id: string;
  nome: string;
}

interface RedistribuirLeadsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  corretores: Corretor[];
  onRedistribuir: (params: { data: Date; horarioPartir: string; corretorOrigem: string | "all" }) => void;
}

export function RedistribuirLeadsDialog({ open, onOpenChange, corretores, onRedistribuir }: RedistribuirLeadsDialogProps) {
  const [data, setData] = useState<Date>(new Date());
  const [horario, setHorario] = useState("08:00");
  const [corretorOrigem, setCorretorOrigem] = useState<string>("all");

  const handleSubmit = () => {
    if (!horario) {
      toast.error("Informe o horário a partir do qual redistribuir.");
      return;
    }
    onRedistribuir({ data, horarioPartir: horario, corretorOrigem });
    toast.success(
      `Leads a partir de ${format(data, "dd/MM/yyyy")} ${horario} ${corretorOrigem === "all" ? "de todos os corretores" : `de ${corretores.find(c => c.id === corretorOrigem)?.nome}`} redistribuídos com sucesso!`
    );
    onOpenChange(false);
  };

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
          {/* Data */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-sm font-medium">
              <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
              Data
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-9 text-sm",
                    !data && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {data ? format(data, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={data}
                  onSelect={(d) => d && setData(d)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Horário */}
          <div className="space-y-2">
            <Label htmlFor="horario" className="flex items-center gap-1.5 text-sm font-medium">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              Horário a partir de
            </Label>
            <Input
              id="horario"
              type="time"
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              className="h-9"
            />
            <p className="text-[11px] text-muted-foreground">
              Todos os leads recebidos a partir desta data/horário serão redistribuídos.
            </p>
          </div>

          {/* Corretor */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-sm font-medium">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              Corretor de origem
            </Label>
            <Select value={corretorOrigem} onValueChange={setCorretorOrigem}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Selecione o corretor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Corretores</SelectItem>
                {corretores.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              Escolha um corretor específico ou redistribua de todos.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
            <Shuffle className="h-4 w-4" />
            Redistribuir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
