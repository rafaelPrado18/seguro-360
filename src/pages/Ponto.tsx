import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { LogIn, Coffee, Utensils, LogOut, Clock, CalendarDays, Loader2, Pencil, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useRole } from "@/contexts/RoleContext";
import { pontoService, PunchRecord } from "@/services/pontoService";
import { agentsService, Agent } from "@/services/agentsService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type PunchType = PunchRecord["type"];

const PUNCH_LABEL: Record<PunchType, string> = {
  entrada: "Entrada",
  saida_almoco: "Saída p/ Almoço",
  retorno_almoco: "Retorno do Almoço",
  saida: "Saída do Expediente",
};

const PUNCH_ORDER: PunchType[] = ["entrada", "saida_almoco", "retorno_almoco", "saida"];

const PUNCH_ICON: Record<PunchType, typeof LogIn> = {
  entrada: LogIn,
  saida_almoco: Coffee,
  retorno_almoco: Utensils,
  saida: LogOut,
};

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function firstDayOfMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

const STANDARD_WORK_MS = 8 * 3600000;
const EXPECTED_ENTRY_HOUR = 9;
const EXPECTED_ENTRY_MIN = 0;
const ENTRY_TOLERANCE_MS = 15 * 60000;

function totalWorkedMs(records: PunchRecord[]): number | null {
  const get = (t: PunchType) => records.find(r => r.type === t);
  const e = get("entrada");
  const sa = get("saida_almoco");
  const ra = get("retorno_almoco");
  const s = get("saida");
  if (!e) return null;
  const end = s ? new Date(s.iso).getTime() : Date.now();
  let totalMs = end - new Date(e.iso).getTime();
  if (sa && ra) totalMs -= new Date(ra.iso).getTime() - new Date(sa.iso).getTime();
  if (totalMs < 0) totalMs = 0;
  return totalMs;
}

function formatHM(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

function diffHours(records: PunchRecord[]): string {
  const ms = totalWorkedMs(records);
  if (ms == null) return "—";
  return formatHM(ms);
}

function overtime(records: PunchRecord[]): string {
  const ms = totalWorkedMs(records);
  if (ms == null) return "—";
  const extra = ms - STANDARD_WORK_MS;
  if (extra <= 0) return "0h 0m";
  return formatHM(extra);
}

function atraso(records: PunchRecord[]): string {
  const e = records.find(r => r.type === "entrada");
  if (!e) return "—";
  const d = new Date(e.iso);
  const expected = new Date(d);
  expected.setHours(EXPECTED_ENTRY_HOUR, EXPECTED_ENTRY_MIN, 0, 0);
  const diff = d.getTime() - expected.getTime();
  if (diff <= ENTRY_TOLERANCE_MS) return "0h 0m";
  return formatHM(diff);
}

const Ponto = () => {
  const { currentUser, isAdmin } = useRole();
  const [records, setRecords] = useState<PunchRecord[]>([]);
  const [now, setNow] = useState(new Date());
  const [filterUser, setFilterUser] = useState<string>("__me__");
  const [loading, setLoading] = useState(false);
  const [punching, setPunching] = useState<PunchType | null>(null);
  const [startDate, setStartDate] = useState(firstDayOfMonth());
  const [endDate, setEndDate] = useState(todayKey());
  const [editing, setEditing] = useState<PunchRecord | null>(null);
  const [editTime, setEditTime] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const handleSaveEdit = async () => {
    if (!editing) return;
    const punchId = editing.punchId || editing._id;
    if (!punchId) {
      toast({ title: "Registro sem ID", variant: "destructive" });
      return;
    }
    const time = editTime.length === 5 ? `${editTime}:00` : editTime;
    const iso = new Date(`${editing.date}T${time}`).toISOString();
    setSavingEdit(true);
    try {
      await pontoService.update({ ...editing, punchId, time, iso });
      toast({ title: "Registro atualizado" });
      setEditing(null);
      await fetchRecords();
    } catch (e) {
      console.error(e);
      toast({ title: "Erro ao atualizar registro", variant: "destructive" });
    } finally {
      setSavingEdit(false);
    }
  };

  const openEdit = (rec: PunchRecord) => {
    setEditing(rec);
    setEditTime(rec.time.slice(0, 5));
  };

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const today = todayKey();

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params: { userId?: string; startDate?: string; endDate?: string } = {
        startDate,
        endDate,
      };
      if (!isAdmin || filterUser === "__me__") {
        params.userId = currentUser.id;
      } else if (filterUser !== "__all__") {
        params.userId = filterUser;
      }
      const data = await pontoService.list(params);
      setRecords(data);
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao buscar registros", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterUser, startDate, endDate, currentUser.id, isAdmin]);

  const myToday = useMemo(
    () => records.filter(r => r.userId === currentUser.id && r.date === today),
    [records, currentUser.id, today]
  );

  const nextPunch = useMemo(() => {
    return PUNCH_ORDER.find(t => !myToday.some(r => r.type === t));
  }, [myToday]);

  const handlePunch = async (type: PunchType) => {
    if (myToday.some(r => r.type === type)) {
      toast({ title: "Batida já registrada", description: PUNCH_LABEL[type], variant: "destructive" });
      return;
    }
    const d = new Date();
    const newRec: PunchRecord = {
      userId: currentUser.id,
      userName: currentUser.nome,
      date: today,
      type,
      time: d.toTimeString().slice(0, 8),
      iso: d.toISOString(),
    };
    setPunching(type);
    try {
      await pontoService.create(newRec);
      // Sync agent online/offline status with punch type
      const newStatus: "online" | "offline" =
        type === "entrada" || type === "retorno_almoco" ? "online" : "offline";
      try {
        await agentsService.updateAgentStatus({
          agentId: currentUser.id,
          status: newStatus,
          userId: currentUser.id,
        });
        document.cookie = `userStatus=${newStatus}; path=/;`;
      } catch (e) {
        console.error("Erro ao atualizar status do agente:", e);
      }
      toast({ title: `${PUNCH_LABEL[type]} registrada`, description: `às ${newRec.time}` });
      await fetchRecords();
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao registrar ponto", variant: "destructive" });
    } finally {
      setPunching(null);
    }
  };

  const groupedHistory = useMemo(() => {
    const map = new Map<string, PunchRecord[]>();
    records.forEach(r => {
      const key = `${r.userId}__${r.date}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    });
    return Array.from(map.entries())
      .map(([key, recs]) => {
        const [userId, date] = key.split("__");
        return { userId, userName: recs[0].userName, date, records: recs };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [records]);

  const allUsers = useMemo(() => {
    const map = new Map<string, string>();
    records.forEach(r => map.set(r.userId, r.userName));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [records]);

  const handleExportPdf = () => {
    const doc = new jsPDF();
    // Header
    doc.setFillColor(28, 41, 84);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 22, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("HataSeg - Seguros & Previdência", 14, 10);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Relatório de Ponto", 14, 17);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text(
      `Gerado em ${new Date().toLocaleString("pt-BR")}`,
      doc.internal.pageSize.getWidth() - 14,
      17,
      { align: "right" }
    );

    const fmtDate = (s: string) => new Date(s + "T00:00:00").toLocaleDateString("pt-BR");
    const subtitle = `Período: ${fmtDate(startDate)} a ${fmtDate(endDate)}`;
    const userInfo = !isAdmin || filterUser === "__me__"
      ? `Usuário: ${currentUser.nome}`
      : filterUser === "__all__"
        ? "Usuário: Todos"
        : `Usuário: ${allUsers.find(u => u.id === filterUser)?.name || filterUser}`;
    doc.setFontSize(10);
    doc.text(subtitle, 14, 30);
    doc.text(userInfo, 14, 36);

    // Aggregate totals
    let totalMs = 0;
    let totalExtraMs = 0;
    let totalAtrasoMs = 0;
    groupedHistory.forEach(g => {
      const ms = totalWorkedMs(g.records);
      if (ms != null) {
        totalMs += ms;
        totalExtraMs += Math.max(0, ms - STANDARD_WORK_MS);
      }
      const e = g.records.find(r => r.type === "entrada");
      if (e) {
        const d = new Date(e.iso);
        const expected = new Date(d);
        expected.setHours(EXPECTED_ENTRY_HOUR, EXPECTED_ENTRY_MIN, 0, 0);
        const diff = d.getTime() - expected.getTime();
        if (diff > ENTRY_TOLERANCE_MS) totalAtrasoMs += diff;
      }
    });

    autoTable(doc, {
      startY: 42,
      head: [["Dias registrados", "Total trabalhado", "Total horas extras", "Total atrasos"]],
      body: [[
        String(groupedHistory.length),
        formatHM(totalMs),
        formatHM(totalExtraMs),
        formatHM(totalAtrasoMs),
      ]],
      theme: "grid",
      headStyles: { fillColor: [28, 41, 84], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 10, halign: "center", fontStyle: "bold" },
      margin: { left: 14, right: 14 },
    });

    const yStart = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

    const showUser = isAdmin && filterUser !== "__me__";
    const head = showUser
      ? [["Data", "Usuário", "Entrada", "S. Almoço", "R. Almoço", "Saída", "Total", "Extra", "Atraso"]]
      : [["Data", "Entrada", "S. Almoço", "R. Almoço", "Saída", "Total", "Extra", "Atraso"]];

    const rows = groupedHistory.map(g => {
      const t = (type: PunchType) => g.records.find(r => r.type === type)?.time.slice(0, 5) || "—";
      const base = [
        new Date(g.date + "T00:00:00").toLocaleDateString("pt-BR"),
        t("entrada"),
        t("saida_almoco"),
        t("retorno_almoco"),
        t("saida"),
        diffHours(g.records),
        overtime(g.records),
        atraso(g.records),
      ];
      return showUser ? [base[0], g.userName, ...base.slice(1)] : base;
    });

    autoTable(doc, {
      startY: yStart,
      head,
      body: rows,
      theme: "striped",
      headStyles: { fillColor: [28, 41, 84], textColor: 255, fontSize: 9 },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    });

    doc.save(`relatorio_ponto_${startDate}_${endDate}.pdf`);
  };


  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Registro de Ponto</h1>
            <p className="text-muted-foreground">Registre suas entradas e saídas do expediente</p>
          </div>
          <Card className="px-4 py-3">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">{now.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}</div>
                <div className="text-2xl font-bold tabular-nums">{now.toLocaleTimeString("pt-BR")}</div>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="hoje">
          <TabsList>
            <TabsTrigger value="hoje">Hoje</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="hoje" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {PUNCH_ORDER.map(type => {
                const rec = myToday.find(r => r.type === type);
                const Icon = PUNCH_ICON[type];
                const isNext = nextPunch === type;
                return (
                  <Card key={type} className={isNext ? "border-primary shadow-md" : ""}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        {PUNCH_LABEL[type]}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {rec ? (
                        <div>
                          <div className="text-2xl font-bold tabular-nums">{rec.time.slice(0, 5)}</div>
                          <Badge variant="secondary" className="mt-1">Registrado</Badge>
                        </div>
                      ) : (
                        <div>
                          <div className="text-2xl font-bold text-muted-foreground">--:--</div>
                          <Badge variant="outline" className="mt-1">Pendente</Badge>
                        </div>
                      )}
                      <Button
                        className="w-full"
                        variant={isNext ? "default" : "outline"}
                        disabled={!!rec || punching !== null}
                        onClick={() => handlePunch(type)}
                      >
                        {punching === type ? <Loader2 className="h-4 w-4 animate-spin" /> : "Bater Ponto"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" /> Resumo do dia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-6">
                  <div>
                    <p className="text-xs text-muted-foreground">Batidas registradas</p>
                    <p className="text-xl font-semibold">{myToday.length} / 4</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total trabalhado</p>
                    <p className="text-xl font-semibold">{diffHours(myToday)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Próxima batida</p>
                    <p className="text-xl font-semibold">{nextPunch ? PUNCH_LABEL[nextPunch] : "Concluído ✓"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historico" className="space-y-4">
            <div className="flex items-end gap-3 flex-wrap">
              {isAdmin && (
                <div>
                  <Label className="text-xs text-muted-foreground">Usuário</Label>
                  <Select value={filterUser} onValueChange={setFilterUser}>
                    <SelectTrigger className="w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__me__">Meus registros</SelectItem>
                      <SelectItem value="__all__">Todos os usuários</SelectItem>
                      {allUsers.map(u => (
                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label className="text-xs text-muted-foreground">Início</Label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-44" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Fim</Label>
                <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-44" />
              </div>
              <Button variant="outline" onClick={fetchRecords} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Atualizar"}
              </Button>
              <Button variant="outline" onClick={handleExportPdf} disabled={loading || groupedHistory.length === 0} className="gap-2">
                <FileText className="h-4 w-4" /> Exportar PDF
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      {isAdmin && <TableHead>Usuário</TableHead>}
                      <TableHead>Entrada</TableHead>
                      <TableHead>Saída Almoço</TableHead>
                      <TableHead>Retorno Almoço</TableHead>
                      <TableHead>Saída</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Hora Extra</TableHead>
                      <TableHead>Atrasos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={isAdmin ? 9 : 8} className="text-center py-10">
                          <Loader2 className="h-5 w-5 animate-spin inline" />
                        </TableCell>
                      </TableRow>
                    ) : groupedHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={isAdmin ? 9 : 8} className="text-center py-10 text-muted-foreground">
                          Nenhum registro anterior
                        </TableCell>
                      </TableRow>
                    ) : (
                      groupedHistory.map(g => {
                        const cell = (type: PunchType) => {
                          const rec = g.records.find(r => r.type === type);
                          if (!rec) return <span className="text-muted-foreground">—</span>;
                          return (
                            <div className="flex items-center gap-1">
                              <span>{rec.time.slice(0, 5)}</span>
                              {isAdmin && (
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => openEdit(rec)}>
                                  <Pencil className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          );
                        };
                        return (
                          <TableRow key={`${g.userId}-${g.date}`}>
                            <TableCell className="font-medium">
                              {new Date(g.date + "T00:00:00").toLocaleDateString("pt-BR")}
                            </TableCell>
                            {isAdmin && <TableCell>{g.userName}</TableCell>}
                            <TableCell>{cell("entrada")}</TableCell>
                            <TableCell>{cell("saida_almoco")}</TableCell>
                            <TableCell>{cell("retorno_almoco")}</TableCell>
                            <TableCell>{cell("saida")}</TableCell>
                            <TableCell className="font-semibold">{diffHours(g.records)}</TableCell>
                            <TableCell className="text-emerald-600 font-medium">{overtime(g.records)}</TableCell>
                            <TableCell className="text-destructive font-medium">{atraso(g.records)}</TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Registro de Ponto</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {editing.userName} — {new Date(editing.date + "T00:00:00").toLocaleDateString("pt-BR")} — {PUNCH_LABEL[editing.type]}
              </div>
              <div>
                <Label>Horário</Label>
                <Input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button onClick={handleSaveEdit} disabled={savingEdit}>
              {savingEdit ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Ponto;
