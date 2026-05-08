export interface PunchRecord {
  _id?: string;
  userId: string;
  userName: string;
  date: string; // YYYY-MM-DD
  type: "entrada" | "saida_almoco" | "retorno_almoco" | "saida";
  time: string; // HH:mm:ss
  iso: string;
}

const BASE_URL = "https://crm-hataseg.com.br/mango-softwares/clock/punch";
const HEADERS = {
  "Content-Type": "application/json",
  orchestrator: "local",
};

function genMessageId() {
  return Array.from({ length: 24 }, () =>
    Math.floor(Math.random() * 16).toString(16).toUpperCase()
  ).join("");
}

export const pontoService = {
  async list(params: { userId?: string; startDate?: string; endDate?: string } = {}): Promise<PunchRecord[]> {
    const qs = new URLSearchParams();
    if (params.userId) qs.append("userId", params.userId);
    if (params.startDate) qs.append("startDate", params.startDate);
    if (params.endDate) qs.append("endDate", params.endDate);
    const url = qs.toString() ? `${BASE_URL}?${qs.toString()}` : BASE_URL;
    const res = await fetch(url, {
      headers: { orchestrator: "local", messageid: genMessageId() },
    });
    if (!res.ok) throw new Error("Erro ao buscar pontos");
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  },

  async create(record: PunchRecord): Promise<PunchRecord> {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { ...HEADERS, messageid: genMessageId() },
      body: JSON.stringify(record),
    });
    if (!res.ok) throw new Error("Erro ao registrar ponto");
    return res.json().catch(() => record);
  },

  async update(record: PunchRecord & { punchId: string }): Promise<PunchRecord> {
    const res = await fetch("https://crm-hataseg.com.br/clock/punch", {
      method: "PATCH",
      headers: { ...HEADERS, messageid: genMessageId() },
      body: JSON.stringify(record),
    });
    if (!res.ok) throw new Error("Erro ao atualizar ponto");
    return res.json().catch(() => record);
  },
};
