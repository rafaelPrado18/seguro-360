import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GripVertical, Phone, MessageSquare, MoreHorizontal } from "lucide-react";
import type { Lead } from "@/services/leadsService";

export interface KanbanColumn {
  id: string;
  label: string;
  color: string;
  bgColor: string;
}

interface LeadKanbanProps {
  leads: Lead[];
  columns: KanbanColumn[];
  onStatusChange: (leadId: string, newStatus: string) => void;
  corretorFilter?: string | null;
  onLeadClick?: (lead: Lead) => void;
}

const origemLabels: Record<string, string> = {
  whatsapp: "WhatsApp", site: "Site", indicacao: "Indicação",
  facebook: "Facebook", instagram: "Instagram", google_ads: "Google Ads", outro: "Outro",
};

export function LeadKanban({ leads, columns, onStatusChange, corretorFilter, onLeadClick }: LeadKanbanProps) {
  const navigate = useNavigate();
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const filteredLeads = corretorFilter
    ? leads.filter(l => l.corretor_responsavel === corretorFilter)
    : leads;

  const getColumnLeads = (columnId: string) =>
    filteredLeads.filter(l => l.status === columnId);

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", lead.id);
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
    if (draggedLead && draggedLead.status !== columnId) {
      onStatusChange(draggedLead.id, columnId);
    }
    setDraggedLead(null);
  };

  const getColumnTotal = (columnId: string) => {
    return getColumnLeads(columnId).reduce((sum, l) => sum + (l.valor_estimado ?? 0), 0);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4" style={{ height: "calc(100vh - 22rem)" }}>
      {columns.map((col) => {
        const colLeads = getColumnLeads(col.id);
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
            <div className="px-3 py-2.5 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${col.bgColor}`} />
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wider">{col.label}</span>
                  <Badge variant="secondary" className="text-[10px] h-5 min-w-[20px] justify-center">{colLeads.length}</Badge>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                R$ {getColumnTotal(col.id).toLocaleString()}
              </p>
            </div>

            {/* Cards */}
            <ScrollArea className="flex-1 min-h-0">
            <div className="p-2 space-y-2 overflow-hidden">
              {colLeads.map((lead) => (
                <Card
                  key={lead.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead)}
                  onClick={() => onLeadClick?.(lead)}
                  className={`cursor-grab active:cursor-grabbing kpi-card-shadow hover:shadow-md transition-all duration-150 min-w-0 max-w-full overflow-hidden ${
                    draggedLead?.id === lead.id ? "opacity-40 scale-95" : ""
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0" />
                        <div className="h-6 w-6 rounded-full bg-accent/15 flex items-center justify-center text-[9px] font-bold text-accent">
                          {(lead.nome ?? "").split(" ").filter(Boolean).map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-5 w-5">
                        <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    </div>
                    <p className="text-sm font-medium text-foreground truncate">{lead.nome ?? "Sem nome"}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{lead.ramo_interesse ?? "—"}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-bold text-foreground">R$ {(lead.valor_estimado ?? 0).toLocaleString()}</span>
                      {lead.origem ? (
                        <Badge variant="secondary" className="text-[9px]">{origemLabels[lead.origem] || lead.origem}</Badge>
                      ) : null}
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                      <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                        {lead.corretor_responsavel || "Sem corretor"}
                      </span>
                      <div className="flex gap-0.5">
                        {lead.telefone && (
                          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); window.open(`tel:${lead.telefone}`); }}>
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

              {colLeads.length === 0 && (
                <div className={`flex items-center justify-center h-20 rounded-lg border-2 border-dashed transition-colors ${
                  isOver ? "border-accent bg-accent/10" : "border-border/50"
                }`}>
                  <p className="text-[11px] text-muted-foreground">Arraste leads aqui</p>
                </div>
              )}
            </div>
            </ScrollArea>
          </div>
        );
      })}
    </div>
  );
}
