import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GripVertical, Phone, MessageSquare, MoreHorizontal, Maximize2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface SinistroKanbanColumn {
  id: string;
  label: string;
  color: string;
  bgColor: string;
}

export interface SinistroVeiculo {
  fabricante: string;
  modelo: string;
  ano: string;
  placa: string;
  chassi: string;
}

export interface SinistroItem {
  id: string;
  cliente: string;
  clienteId?: string;
  seguradora: string;
  tipo: string;
  dataAbertura: string;
  valor: string;
  status: string;
  prioridade: string;
  telefone: string;
  apolice?: string;
  oficina?: string;
  observacoes?: string;
  veiculo?: SinistroVeiculo;
}

interface SinistroKanbanProps {
  sinistros: SinistroItem[];
  columns: SinistroKanbanColumn[];
  onStatusChange: (sinistroId: string, newStatus: string) => void;
  onItemClick?: (sinistro: SinistroItem) => void;
}

const prioridadeColor = (p: string) => {
  switch (p) {
    case "Crítica": return "bg-destructive text-destructive-foreground";
    case "Alta": return "bg-warning text-warning-foreground";
    case "Média": return "bg-info text-info-foreground";
    default: return "bg-secondary text-secondary-foreground";
  }
};

export function SinistroKanban({ sinistros, columns, onStatusChange, onItemClick }: SinistroKanbanProps) {
  const navigate = useNavigate();
  const [draggedItem, setDraggedItem] = useState<SinistroItem | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [expandedColumn, setExpandedColumn] = useState<SinistroKanbanColumn | null>(null);

  const getColumnItems = (columnId: string) =>
    sinistros.filter(s => s.status === columnId);

  const handleDragStart = (e: React.DragEvent, item: SinistroItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", item.id);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => setDragOverColumn(null);

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    if (draggedItem && draggedItem.status !== columnId) {
      onStatusChange(draggedItem.id, columnId);
    }
    setDraggedItem(null);
  };

  const expandedItems = expandedColumn ? getColumnItems(expandedColumn.id) : [];

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ height: "calc(100vh - 14rem)" }}>
        {columns.map((col) => {
          const colItems = getColumnItems(col.id);
          const isOver = dragOverColumn === col.id;

          return (
            <div
              key={col.id}
              className={`flex-shrink-0 w-72 flex flex-col rounded-lg border transition-all duration-200 ${
                isOver ? "border-accent bg-accent/5 shadow-lg" : "border-border bg-muted/30"
              }`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div
                className="px-3 py-2.5 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedColumn(col)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${col.bgColor}`} />
                    <span className="text-[10px] font-semibold text-foreground uppercase tracking-wider leading-tight">{col.label}</span>
                    <Badge variant="secondary" className="text-[10px] h-5 min-w-[20px] justify-center">{colItems.length}</Badge>
                  </div>
                  <Maximize2 className="h-3.5 w-3.5 text-muted-foreground/60 flex-shrink-0" />
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-1 space-y-1">
                  {colItems.map((item) => (
                    <Card
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      onClick={() => onItemClick?.(item)}
                      className={`cursor-grab active:cursor-grabbing kpi-card-shadow hover:shadow-md transition-all duration-150 ${
                        draggedItem?.id === item.id ? "opacity-40 scale-95" : ""
                      }`}
                    >
                      <CardContent className="p-3 min-w-[275px] max-w-[275px]">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0" />
                            <div className="h-6 w-6 rounded-full bg-accent/15 flex items-center justify-center text-[9px] font-bold text-accent">
                              {item.cliente.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                          </div>
                          <Badge className={`text-[9px] ${prioridadeColor(item.prioridade)}`}>{item.prioridade}</Badge>
                        </div>
                        <p className="text-sm font-medium text-foreground truncate">{item.cliente}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{item.tipo}</p>
                        {item.veiculo && (
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {item.veiculo.fabricante} {item.veiculo.modelo} • <span className="font-mono">{item.veiculo.placa}</span>
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-[9px]">{item.seguradora}</Badge>
                          {item.oficina && <span className="text-[10px] text-muted-foreground truncate">{item.oficina}</span>}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs font-bold text-foreground">{item.valor}</span>
                          <span className="text-[10px] text-muted-foreground">{item.dataAbertura}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                          <span className="text-[10px] text-muted-foreground font-mono">{item.apolice || "—"}</span>
                          <div className="flex gap-0.5">
                            {item.telefone && (
                              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); window.open(`tel:${item.telefone}`); }}>
                                <Phone className="h-3 w-3 text-muted-foreground" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); navigate("/whatsapp"); }}>
                              <MessageSquare className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {colItems.length === 0 && (
                    <div className={`flex items-center justify-center h-20 rounded-lg border-2 border-dashed transition-colors ${
                      isOver ? "border-accent bg-accent/10" : "border-border/50"
                    }`}>
                      <p className="text-[11px] text-muted-foreground">Arraste sinistros aqui</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          );
        })}
      </div>

      <Dialog open={!!expandedColumn} onOpenChange={(open) => !open && setExpandedColumn(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {expandedColumn && <div className={`h-3 w-3 rounded-full ${expandedColumn.bgColor}`} />}
              {expandedColumn?.label}
              <Badge variant="secondary" className="ml-1">{expandedItems.length} sinistros</Badge>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[calc(80vh-120px)] -mx-6 px-6">
            <div className="space-y-2">
              {expandedItems.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum sinistro neste status</p>
              )}
              {expandedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => { setExpandedColumn(null); onItemClick?.(item); }}
                >
                  <div className="h-9 w-9 rounded-full bg-accent/15 flex items-center justify-center text-xs font-bold text-accent flex-shrink-0">
                    {item.cliente.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.cliente}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-muted-foreground">{item.tipo}</span>
                      <Badge variant="secondary" className="text-[9px]">{item.seguradora}</Badge>
                      <Badge className={`text-[9px] ${prioridadeColor(item.prioridade)}`}>{item.prioridade}</Badge>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-foreground">{item.valor}</p>
                    <p className="text-[10px] text-muted-foreground">{item.dataAbertura}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {item.telefone && (
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); window.open(`tel:${item.telefone}`); }}>
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); navigate("/whatsapp"); }}>
                      <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
