const BASE_URL = "https://crm-hataseg.com.br";

const HEADERS = {
  "Content-Type": "application/json",
  orchestrator: "crm-hatanaka",
};

export interface SinistroTerceiro {
  nome: string;
  telefone: string;
  cpf: string;
  cep: string;
  endereco: string;
  email: string;
  numero_sinistro: string;
}

export interface SinistroCreatePayload {
  id: string;
  cliente: string;
  clienteId: string;
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
  veiculo?: {
    fabricante: string;
    modelo: string;
    ano: string;
    placa: string;
    chassi: string;
  };
  terceiros?: SinistroTerceiro[];
}

export interface SinistroReadResponse {
  status: string;
  data: (SinistroCreatePayload & { created_at?: string; updated_at?: string | null })[];
}

export const sinistroService = {
  async fetchSinistros(params?: { status?: string; seguradora?: string }): Promise<SinistroCreatePayload[]> {
    const url = new URL(`${BASE_URL}/v1/read/sinistro`);
    if (params?.status) url.searchParams.set("status", params.status);
    if (params?.seguradora) url.searchParams.set("seguradora", params.seguradora);
    const res = await fetch(url.toString(), { headers: HEADERS });
    if (!res.ok) throw new Error("Erro ao buscar sinistros");
    const json: SinistroReadResponse = await res.json();
    return json.data || [];
  },

  async createSinistro(payload: SinistroCreatePayload): Promise<SinistroCreatePayload> {
    const res = await fetch(`${BASE_URL}/v1/create/sinistro`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Erro ao criar sinistro");
    return res.json();
  },

  async updateSinistro(filtros: Record<string, string>, dados: Record<string, unknown>, atualizarTodos = false): Promise<{ matched_count: number; modified_count: number }> {
    const res = await fetch(`${BASE_URL}/v1/update/sinistro`, {
      method: "PATCH",
      headers: HEADERS,
      body: JSON.stringify({ filtros, dados, atualizarTodos }),
    });
    if (!res.ok) throw new Error("Erro ao atualizar sinistro");
    return res.json();
  },
};
