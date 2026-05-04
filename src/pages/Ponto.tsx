import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogIn, Coffee, Utensils, LogOut, Clock, CalendarDays } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useRole } from "@/contexts/RoleContext";

type PunchType = "entrada" | "saida_almoco" | "retorno_almoco" | "saida";

interface PunchRecord {
  userId: string;
  userName: string;
  date: string; // YYYY-MM-DD
  type: PunchType;
  time: string; // HH:mm:ss
  iso: string;
}

const STORAGE_KEY = "hataseg_ponto_records";

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
  return new Date().toISOString().slice(0, 10);
}

function loadRecords(): PunchRecord[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecords(records: PunchRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function diffHours(records: PunchRecord[]): string {
  const get = (t: PunchType) => records.find(r => r.type === t);
  const e = get("entrada");
  const sa = get("saida_almoco");
  const ra = get("retorno_almoco");
  const s = get("saida");
  if (!e) return "—";
  let totalMs = 0;
  const end = s ? new Date(s.iso).getTime() : Date.now();
  totalMs = end - new Date(e.iso).getTime();
  if (sa && ra) totalMs -= new Date(ra.iso).getTime() - new Date(sa.iso).getTime();
  if (totalMs < 0) totalMs = 0;
  const h = Math.floor(totalMs / 3600000);
  const m = Math.floor((totalMs % 3600000) / 60000);
  return `${h}h ${m}m`;
}

const Ponto = () => {
  const { currentUser, isAdmin } = useRole();
  const [records, setRecords] = useState<PunchRecord[]>(loadRecords());
  const [now, setNow] = useState(new Date());
  const [filterUser, setFilterUser] = useState<string>("__me__");

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const today = todayKey();

  const myToday = useMemo(
    () => records.filter(r => r.userId === currentUser.id && r.date === today),
    [records, currentUser.id, today]
  );

  const nextPunch = useMemo(() => {
    return PUNCH_ORDER.find(t => !myToday.some(r => r.type === t));
  }, [myToday]);

  const handlePunch = (type: PunchType) => {
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
    const updated = [...records, newRec];
    setRecords(updated);
    saveRecords(updated);
    toast({ title: `${PUNCH_LABEL[type]} registrada`, description: `às ${newRec.time}` });
  };

  // History data
  const historyRecords = useMemo(() => {
    let base = records;
    if (!isAdmin || filterUser === "__me__") {
      base = base.filter(r => r.userId === currentUser.id);
    } else if (filterUser !== "__all__") {
      base = base.filter(r => r.userId === filterUser);
    }
    return base.filter(r => r.date !== today);
  }, [records, isAdmin, filterUser, currentUser.id, today]);

  const groupedHistory = useMemo(() => {
    const map = new Map<string, PunchRecord[]>();
    historyRecords.forEach(r => {
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
  }, [historyRecords]);

  const allUsers = useMemo(() => {
    const map = new Map<string, string>();
    records.forEach(r => map.set(r.userId, r.userName));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [records]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Batimento de Ponto</h1>
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
                        disabled={!!rec}
                        onClick={() => handlePunch(type)}
                      >
                        Bater Ponto
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
            {isAdmin && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Filtrar por usuário:</span>
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupedHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-10 text-muted-foreground">
                          Nenhum registro anterior
                        </TableCell>
                      </TableRow>
                    ) : (
                      groupedHistory.map(g => {
                        const t = (type: PunchType) => g.records.find(r => r.type === type)?.time.slice(0, 5) || "—";
                        return (
                          <TableRow key={`${g.userId}-${g.date}`}>
                            <TableCell className="font-medium">
                              {new Date(g.date + "T00:00:00").toLocaleDateString("pt-BR")}
                            </TableCell>
                            {isAdmin && <TableCell>{g.userName}</TableCell>}
                            <TableCell>{t("entrada")}</TableCell>
                            <TableCell>{t("saida_almoco")}</TableCell>
                            <TableCell>{t("retorno_almoco")}</TableCell>
                            <TableCell>{t("saida")}</TableCell>
                            <TableCell className="font-semibold">{diffHours(g.records)}</TableCell>
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
    </AppLayout>
  );
};

export default Ponto;
