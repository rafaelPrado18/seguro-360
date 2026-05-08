import { useState, useMemo, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, TrendingUp, Users, BarChart3, Calendar, Loader2, FileText } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import { useLeads } from "@/hooks/useLeads";
import { useAgents } from "@/hooks/useAgents";
import type { Lead } from "@/services/leadsService";
import type { Agent } from "@/services/agentsService";
import * as XLSX from "xlsx";
import {
  startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth,
  subDays, subWeeks, subMonths, format, parseISO, isValid,
} from "date-fns";
import { ptBR } from "date-fns/locale";

// ── Colors ──
const COLORS = [
  "hsl(222, 60%, 22%)", "hsl(38, 92%, 50%)", "hsl(142, 71%, 45%)",
  "hsl(210, 100%, 52%)", "hsl(280, 60%, 50%)", "hsl(0, 72%, 51%)", "hsl(220, 10%, 60%)",
  "hsl(160, 60%, 40%)", "hsl(30, 80%, 55%)", "hsl(320, 60%, 50%)",
];

type Periodo = "dia" | "semana" | "mes";

// ── Helpers ──

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  // Try DD/MM/YYYY HH:mm:ss
  const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/);
  if (match) {
    const [, dd, mm, yyyy, hh, mi, ss] = match;
    const d = new Date(+yyyy, +mm - 1, +dd, +hh, +mi, +ss);
    return isValid(d) ? d : null;
  }
  // Try ISO
  try {
    const d = parseISO(dateStr);
    return isValid(d) ? d : null;
  } catch {
    return null;
  }
}

function getPeriodBuckets(periodo: Periodo): { label: string; start: Date; end: Date }[] {
  const now = new Date();
  if (periodo === "dia") {
    return Array.from({ length: 7 }, (_, i) => {
      const d = subDays(now, 6 - i);
      return { label: format(d, "EEE", { locale: ptBR }), start: startOfDay(d), end: endOfDay(d) };
    });
  }
  if (periodo === "semana") {
    return Array.from({ length: 4 }, (_, i) => {
      const d = subWeeks(now, 3 - i);
      return { label: `Sem ${i + 1}`, start: startOfWeek(d, { locale: ptBR }), end: endOfWeek(d, { locale: ptBR }) };
    });
  }
  // mes
  return Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(now, 5 - i);
    return { label: format(d, "MMM", { locale: ptBR }), start: startOfMonth(d), end: endOfMonth(d) };
  });
}

function getLeadsArray(leadsData: unknown): Lead[] {
  if (!leadsData) return [];
  if (Array.isArray(leadsData)) return leadsData;
  const d = leadsData as Record<string, unknown>;
  if (Array.isArray(d.data)) return d.data;
  return [];
}

// ── Period selector ──
function PeriodSelector({ value, onChange }: { value: Periodo; onChange: (v: Periodo) => void }) {
  return (
    <Select value={value} onValueChange={v => onChange(v as Periodo)}>
      <SelectTrigger className="w-[130px] h-8 text-xs">
        <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="dia">Últimos 7 dias</SelectItem>
        <SelectItem value="semana">Últimas 4 semanas</SelectItem>
        <SelectItem value="mes">Últimos 6 meses</SelectItem>
      </SelectContent>
    </Select>
  );
}

// ── Ranking table ──
interface CorretorTotal {
  nome: string;
  totalLeads: number;
  convertidos: number;
  valorTotal: number;
  conversao: number;
}

function CorretorRankingTable({ data }: { data: CorretorTotal[] }) {
  const sorted = [...data].sort((a, b) => b.convertidos - a.convertidos || b.totalLeads - a.totalLeads);
  if (sorted.length === 0) {
    return <p className="text-sm text-muted-foreground p-4">Nenhum dado disponível.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground text-xs">#</th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground text-xs">Corretor</th>
            <th className="px-4 py-2.5 text-center font-medium text-muted-foreground text-xs">Leads</th>
            <th className="px-4 py-2.5 text-center font-medium text-muted-foreground text-xs">Convertidos</th>
            <th className="px-4 py-2.5 text-right font-medium text-muted-foreground text-xs">Valor Total</th>
            <th className="px-4 py-2.5 text-center font-medium text-muted-foreground text-xs">Conversão</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((c, i) => (
            <tr key={c.nome} className="border-b border-border hover:bg-muted/30 transition-colors">
              <td className="px-4 py-2.5">
                <Badge variant={i === 0 ? "default" : "secondary"} className="text-[10px] w-6 justify-center">
                  {i + 1}º
                </Badge>
              </td>
              <td className="px-4 py-2.5 font-medium">{c.nome}</td>
              <td className="px-4 py-2.5 text-center font-semibold">{c.totalLeads}</td>
              <td className="px-4 py-2.5 text-center font-semibold">{c.convertidos}</td>
              <td className="px-4 py-2.5 text-right font-semibold">
                {c.valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </td>
              <td className="px-4 py-2.5 text-center">
                <Badge variant="outline" className={`text-[10px] ${c.conversao >= 50 ? "border-success text-success" : c.conversao >= 30 ? "border-warning text-warning" : "border-destructive text-destructive"}`}>
                  {c.conversao}%
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main ──

const Relatorios = () => {
  const [periodo, setPeriodo] = useState<Periodo>("mes");
  const [activeTab, setActiveTab] = useState("corretor");

  const { data: leadsRaw, isLoading: loadingLeads } = useLeads(undefined, undefined, "administrador");
  const { data: agentsRaw, isLoading: loadingAgents } = useAgents();

  const leads = useMemo(() => getLeadsArray(leadsRaw), [leadsRaw]);
  const agents = useMemo(() => (Array.isArray(agentsRaw) ? agentsRaw : []) as Agent[], [agentsRaw]);

  const agentNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    agents.forEach(a => {
      map[a.name?.toLowerCase()] = a.name;
      map[a.email?.toLowerCase()] = a.name;
      if (a.agentId) map[a.agentId] = a.name;
    });
    return map;
  }, [agents]);

  const resolveCorretorName = useCallback((corretor: string | null) => {
    if (!corretor) return "Sem corretor";
    const key = corretor.toLowerCase();
    return agentNameMap[key] || corretor;
  }, [agentNameMap]);

  const buckets = useMemo(() => getPeriodBuckets(periodo), [periodo]);

  // Corretores únicos
  const corretorNames = useMemo(() => {
    const set = new Set<string>();
    leads.forEach(l => set.add(resolveCorretorName(l.corretor_responsavel)));
    set.delete("Sem corretor");
    return Array.from(set).sort();
  }, [leads, resolveCorretorName]);

  // Origens únicas
  const origens = useMemo(() => {
    const set = new Set<string>();
    leads.forEach(l => { if (l.origem) set.add(l.origem); });
    return Array.from(set).sort();
  }, [leads]);

  // ── Chart data: Corretor por período ──
  const corretorChartData = useMemo(() => {
    return buckets.map(b => {
      const row: Record<string, string | number> = { label: b.label };
      corretorNames.forEach(nome => { row[nome] = 0; });
      leads.forEach(l => {
        const d = parseDate(l.created_at);
        if (!d || d < b.start || d > b.end) return;
        const name = resolveCorretorName(l.corretor_responsavel);
        if (name !== "Sem corretor" && row[name] !== undefined) {
          (row[name] as number)++;
        }
      });
      return row;
    });
  }, [buckets, leads, corretorNames, resolveCorretorName]);

  // ── Ranking totals por corretor ──
  const corretorTotals = useMemo<CorretorTotal[]>(() => {
    const map: Record<string, { total: number; convertidos: number; valor: number }> = {};
    leads.forEach(l => {
      const name = resolveCorretorName(l.corretor_responsavel);
      if (name === "Sem corretor") return;
      if (!map[name]) map[name] = { total: 0, convertidos: 0, valor: 0 };
      map[name].total++;
      if (l.status === "convertido") {
        map[name].convertidos++;
        map[name].valor += Number(l.valor_estimado) || 0;
      }
    });
    return Object.entries(map).map(([nome, d]) => ({
      nome,
      totalLeads: d.total,
      convertidos: d.convertidos,
      valorTotal: d.valor,
      conversao: d.total > 0 ? Math.round((d.convertidos / d.total) * 100) : 0,
    }));
  }, [leads, resolveCorretorName]);

  // ── Status distribution (pie) ──
  const statusLabels: Record<string, string> = {
    novo: "Novo", em_contato: "Em Contato", qualificado: "Qualificado",
    proposta_enviada: "Proposta Enviada", convertido: "Convertido", perdido: "Perdido",
  };

  const statusPieData = useMemo(() => {
    const map: Record<string, number> = {};
    leads.forEach(l => {
      const key = l.status || "novo";
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([key, value], i) => ({
      name: statusLabels[key] || key,
      value,
      color: COLORS[i % COLORS.length],
    }));
  }, [leads]);

  // ── Origem chart data ──
  const origemChartData = useMemo(() => {
    return buckets.map(b => {
      const row: Record<string, string | number> = { label: b.label };
      origens.forEach(o => { row[o] = 0; });
      leads.forEach(l => {
        const d = parseDate(l.created_at);
        if (!d || d < b.start || d > b.end) return;
        if (l.origem && row[l.origem] !== undefined) {
          (row[l.origem] as number)++;
        }
      });
      return row;
    });
  }, [buckets, leads, origens]);

  // ── Origem pie ──
  const origemPieData = useMemo(() => {
    const map: Record<string, number> = {};
    leads.forEach(l => { if (l.origem) map[l.origem] = (map[l.origem] || 0) + 1; });
    return Object.entries(map).map(([name, value], i) => ({
      name, value, color: COLORS[i % COLORS.length],
    }));
  }, [leads]);

  // ── Export ──
  const handleExport = useCallback(() => {
    const rows = corretorTotals.map(c => ({
      "Corretor": c.nome,
      "Total Leads": c.totalLeads,
      "Convertidos": c.convertidos,
      "Valor Total": c.valorTotal,
      "Taxa Conversão (%)": c.conversao,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório Corretores");
    XLSX.writeFile(wb, `relatorio_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }, [corretorTotals]);

  // ── Filter leads by current period buckets ──
  const periodLeads = useMemo(() => {
    const start = buckets[0]?.start;
    const end = buckets[buckets.length - 1]?.end;
    if (!start || !end) return leads;
    return leads.filter(l => {
      const d = parseDate(l.created_at);
      return d && d >= start && d <= end;
    });
  }, [leads, buckets]);

  const periodLabel = useMemo(() => {
    return periodo === "dia" ? "Últimos 7 dias" : periodo === "semana" ? "Últimas 4 semanas" : "Últimos 6 meses";
  }, [periodo]);

  const buildPdfHeader = useCallback((doc: jsPDF, title: string, subtitle?: string) => {
    doc.setFillColor(28, 41, 84);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 22, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("HataSeg - Seguros & Previdência", 14, 10);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(title, 14, 17);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    const right = `Gerado em ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`;
    doc.text(right, doc.internal.pageSize.getWidth() - 14, 17, { align: "right" });
    if (subtitle) {
      doc.setFontSize(10);
      doc.text(subtitle, 14, 30);
      return 36;
    }
    return 30;
  }, []);

  const drawKpis = useCallback((doc: jsPDF, y: number, ls: Lead[]) => {
    const total = ls.length;
    const convertidos = ls.filter(l => l.status === "convertido").length;
    const perdidos = ls.filter(l => l.status === "perdido").length;
    const valor = ls.reduce((s, l) => s + (Number(l.valor_estimado) || 0), 0);
    const conv = total > 0 ? Math.round((convertidos / total) * 100) : 0;
    autoTable(doc, {
      startY: y,
      head: [["Total Leads", "Convertidos", "Perdidos", "Taxa Conversão", "Valor Total"]],
      body: [[
        String(total),
        String(convertidos),
        String(perdidos),
        `${conv}%`,
        valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
      ]],
      theme: "grid",
      headStyles: { fillColor: [28, 41, 84], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 10, halign: "center", fontStyle: "bold" },
      margin: { left: 14, right: 14 },
    });
    return (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
  }, []);

  const handleExportPdfGeral = useCallback(() => {
    const doc = new jsPDF();
    let y = buildPdfHeader(doc, "Relatório Geral de Produção", `Total de leads: ${leads.length}`);
    y = drawKpis(doc, y, leads);

    // Ranking
    const ranking = [...corretorTotals].sort((a, b) => b.convertidos - a.convertidos || b.totalLeads - a.totalLeads);
    autoTable(doc, {
      startY: y,
      head: [["#", "Corretor", "Leads", "Convertidos", "Valor Total", "Conversão"]],
      body: ranking.map((c, i) => [
        `${i + 1}º`,
        c.nome,
        String(c.totalLeads),
        String(c.convertidos),
        c.valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
        `${c.conversao}%`,
      ]),
      theme: "striped",
      headStyles: { fillColor: [28, 41, 84], textColor: 255 },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
      didDrawPage: () => { buildPdfHeader(doc, "Relatório Geral de Produção"); },
    });

    // Status distribution
    let y2 = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
    autoTable(doc, {
      startY: y2,
      head: [["Status", "Quantidade", "%"]],
      body: statusPieData.map(s => [s.name, String(s.value), `${leads.length > 0 ? Math.round((s.value / leads.length) * 100) : 0}%`]),
      theme: "grid",
      headStyles: { fillColor: [28, 41, 84], textColor: 255 },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });

    doc.save(`relatorio_geral_${new Date().toISOString().slice(0, 10)}.pdf`);
  }, [leads, corretorTotals, statusPieData, buildPdfHeader, drawKpis]);

  const handleExportPdfPeriodo = useCallback(() => {
    const doc = new jsPDF();
    let y = buildPdfHeader(doc, `Relatório por Período — ${periodLabel}`, `Leads no período: ${periodLeads.length}`);
    y = drawKpis(doc, y, periodLeads);

    // Por bucket
    autoTable(doc, {
      startY: y,
      head: [["Período", "Total", "Convertidos", "Perdidos", "Valor"]],
      body: buckets.map(b => {
        const inB = leads.filter(l => {
          const d = parseDate(l.created_at);
          return d && d >= b.start && d <= b.end;
        });
        const conv = inB.filter(l => l.status === "convertido").length;
        const perd = inB.filter(l => l.status === "perdido").length;
        const valor = inB.reduce((s, l) => s + (Number(l.valor_estimado) || 0), 0);
        return [
          `${b.label} (${format(b.start, "dd/MM", { locale: ptBR })}-${format(b.end, "dd/MM", { locale: ptBR })})`,
          String(inB.length),
          String(conv),
          String(perd),
          valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
        ];
      }),
      theme: "striped",
      headStyles: { fillColor: [28, 41, 84], textColor: 255 },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });

    doc.save(`relatorio_periodo_${new Date().toISOString().slice(0, 10)}.pdf`);
  }, [periodLeads, buckets, leads, periodLabel, buildPdfHeader, drawKpis]);

  const handleExportPdfUsuario = useCallback(() => {
    const doc = new jsPDF();
    buildPdfHeader(doc, "Relatório por Usuário (Corretores)", `${corretorNames.length} corretores · ${leads.length} leads`);
    let y = 36;

    corretorNames.forEach((nome, idx) => {
      const userLeads = leads.filter(l => resolveCorretorName(l.corretor_responsavel) === nome);
      if (userLeads.length === 0) return;

      if (y > doc.internal.pageSize.getHeight() - 60) {
        doc.addPage();
        buildPdfHeader(doc, "Relatório por Usuário (Corretores)");
        y = 30;
      }

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(28, 41, 84);
      doc.text(`${idx + 1}. ${nome}`, 14, y);
      y += 4;

      y = drawKpis(doc, y, userLeads);

      // Status breakdown
      const statusMap: Record<string, number> = {};
      userLeads.forEach(l => { const k = l.status || "novo"; statusMap[k] = (statusMap[k] || 0) + 1; });
      autoTable(doc, {
        startY: y,
        head: [["Status", "Qtde"]],
        body: Object.entries(statusMap).map(([k, v]) => [statusLabels[k] || k, String(v)]),
        theme: "grid",
        headStyles: { fillColor: [200, 200, 200], textColor: 0, fontSize: 8 },
        styles: { fontSize: 8 },
        margin: { left: 14, right: 14 },
        tableWidth: 80,
      });
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
    });

    doc.save(`relatorio_usuarios_${new Date().toISOString().slice(0, 10)}.pdf`);
  }, [corretorNames, leads, resolveCorretorName, buildPdfHeader, drawKpis, statusLabels]);


  const isLoading = loadingLeads || loadingAgents;

  // ── KPIs ──
  const kpis = useMemo(() => {
    const total = leads.length;
    const convertidos = leads.filter(l => l.status === "convertido").length;
    const perdidos = leads.filter(l => l.status === "perdido").length;
    const valorTotal = leads.reduce((s, l) => s + (Number(l.valor_estimado) || 0), 0);
    return { total, convertidos, perdidos, valorTotal, conversao: total > 0 ? Math.round((convertidos / total) * 100) : 0 };
  }, [leads]);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Relatórios</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Análise detalhada da produção e desempenho
              {!isLoading && <span className="ml-2 text-muted-foreground/70">({leads.length} leads)</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PeriodSelector value={periodo} onChange={setPeriodo} />
            <Button variant="outline" size="sm" className="gap-2 h-8 text-xs" onClick={handleExport} disabled={isLoading}>
              <Download className="h-3.5 w-3.5" /> Exportar
            </Button>
          </div>
        </div>

        {/* KPIs */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Leads", value: kpis.total.toString() },
              { label: "Convertidos", value: kpis.convertidos.toString() },
              { label: "Taxa Conversão", value: `${kpis.conversao}%` },
              { label: "Valor Total", value: kpis.valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) },
            ].map((k, i) => (
              <Card key={k.label} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                <CardContent className="pt-4 pb-3 px-4">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{k.label}</p>
                  <p className="mt-1 text-xl font-bold text-foreground">{k.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="corretor" className="gap-1.5 text-xs">
              <Users className="h-3.5 w-3.5" /> Corretores
            </TabsTrigger>
            <TabsTrigger value="status" className="gap-1.5 text-xs">
              <TrendingUp className="h-3.5 w-3.5" /> Status
            </TabsTrigger>
            <TabsTrigger value="origem" className="gap-1.5 text-xs">
              <BarChart3 className="h-3.5 w-3.5" /> Origem
            </TabsTrigger>
          </TabsList>

          {/* ── Por Corretor ── */}
          <TabsContent value="corretor" className="space-y-6 mt-4">
            {isLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-[340px] rounded-lg" />
                <Skeleton className="h-[340px] rounded-lg" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Leads por Corretor — Período</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {corretorNames.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-8 text-center">Nenhum corretor encontrado.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={corretorChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                          <XAxis dataKey="label" fontSize={11} stroke="hsl(220, 10%, 46%)" />
                          <YAxis fontSize={11} stroke="hsl(220, 10%, 46%)" allowDecimals={false} />
                          <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                          <Legend wrapperStyle={{ fontSize: "11px" }} />
                          {corretorNames.map((nome, i) => (
                            <Bar key={nome} dataKey={nome} fill={COLORS[i % COLORS.length]} radius={[3, 3, 0, 0]} />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Ranking de Corretores</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <CorretorRankingTable data={corretorTotals} />
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* ── Por Status ── */}
          <TabsContent value="status" className="space-y-6 mt-4">
            {isLoading ? (
              <Skeleton className="h-[340px] rounded-lg" />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Distribuição por Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={statusPieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                          fontSize={10}
                        >
                          {statusPieData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Resumo por Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {statusPieData.map((s, i) => (
                        <div key={s.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                            <span className="text-sm font-medium">{s.name}</span>
                          </div>
                          <span className="text-sm font-bold">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* ── Por Origem ── */}
          <TabsContent value="origem" className="space-y-6 mt-4">
            {isLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-[340px] rounded-lg" />
                <Skeleton className="h-[340px] rounded-lg" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Leads por Origem — Período</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {origens.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-8 text-center">Nenhuma origem encontrada.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={origemChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                          <XAxis dataKey="label" fontSize={11} stroke="hsl(220, 10%, 46%)" />
                          <YAxis fontSize={11} stroke="hsl(220, 10%, 46%)" allowDecimals={false} />
                          <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                          <Legend wrapperStyle={{ fontSize: "11px" }} />
                          {origens.map((o, i) => (
                            <Line key={o} type="monotone" dataKey={o} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Distribuição por Origem</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={origemPieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                          fontSize={10}
                        >
                          {origemPieData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Relatorios;
