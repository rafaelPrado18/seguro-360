import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GripVertical, Phone, Mail, MoreHorizontal, Maximize2 } from "lucide-react";

export interface RenovacaoKanbanColumn {
  id: string;
  label: string;
  color: string;
  bgColor: string;
}

export interface RenovacaoItem {
  id: number;
  apolice: string;
  cliente: string;
  ramo: string;
  seguradora: string;
  vencimento: string;
  premio: string;
  dias: number;
  status: string;
  observacoes?: string;
  veiculos: { id: string; marca: string; modelo: string; ano: string; placa: string; chassi: string }[];
}

interface RenovacaoKanbanProps {
  renovacoes: RenovacaoItem[];
  columns: RenovacaoKanbanColumn[];
  onStatusChange: (renovacaoId: number, newStatus: string) => void;
  onItemClick?: (renovacao: RenovacaoItem) => void;
}

export function RenovacaoKanban({ renovacoes, columns, onStatusChange, onItemClick }: RenovacaoKanbanProps) {
  const [draggedItem, setDraggedItem] = useState<RenovacaoItem | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [expandedColumn, setExpandedColumn] = useState<RenovacaoKanbanColumn | null>(null);

  const getColumnItems = (columnId: string) =>
    renovacoes.filter(r => r.status === columnId);

  const handleDragStart = (e: React.DragEvent, item: RenovacaoItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(item.id));
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

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
              {/* Column Header */}
              <div
                className="px-3 py-2.5 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedColumn(col)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${col.bgColor}`} />
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider">{col.label}</span>
                    <Badge variant="secondary" className="text-[10px] h-5 min-w-[20px] justify-center">{colItems.length}</Badge>
                  </div>
                  <Maximize2 className="h-3.5 w-3.5 text-muted-foreground/60" />
                </div>
              </div>

              {/* Cards */}
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
                          <Button variant="ghost" size="icon" className="h-5 w-5">
                            <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
                          </Button>
                        </div>
                        <p className="text-sm font-medium text-foreground truncate">{item.cliente}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Apólice {item.apolice}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-[9px]">{item.ramo}</Badge>
                          <span className="text-[10px] text-muted-foreground">{item.seguradora}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs font-bold text-foreground">{item.premio}</span>
                          <span className={`text-[10px] font-bold ${item.dias <= 5 ? "text-destructive" : item.dias <= 15 ? "text-warning" : "text-muted-foreground"}`}>
                            {item.dias}d para vencer
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                          <span className="text-[10px] text-muted-foreground">{item.vencimento}</span>
                          <div className="flex gap-0.5">
                            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => e.stopPropagation()}>
                              <Mail className="h-3 w-3 text-muted-foreground" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => e.stopPropagation()}>
                              <Phone className="h-3 w-3 text-muted-foreground" />
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
                      <p className="text-[11px] text-muted-foreground">Arraste renovações aqui</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          );
        })}
      </div>

      {/* Expanded column dialog */}
      <Dialog open={!!expandedColumn} onOpenChange={(open) => !open && setExpandedColumn(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {expandedColumn && <div className={`h-3 w-3 rounded-full ${expandedColumn.bgColor}`} />}
              {expandedColumn?.label}
              <Badge variant="secondary" className="ml-1">{expandedItems.length} renovações</Badge>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[calc(80vh-120px)] -mx-6 px-6">
            <div className="space-y-2">
              {expandedItems.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma renovação neste status</p>
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
                      <span className="text-[11px] text-muted-foreground">Apólice {item.apolice}</span>
                      <Badge variant="secondary" className="text-[9px]">{item.ramo}</Badge>
                      <span className="text-[10px] text-muted-foreground">{item.seguradora}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-foreground">{item.premio}</p>
                    <p className={`text-[10px] font-bold ${item.dias <= 5 ? "text-destructive" : item.dias <= 15 ? "text-warning" : "text-muted-foreground"}`}>
                      {item.dias}d para vencer
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
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
