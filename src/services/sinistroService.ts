const BASE_URL = "https://crm-hataseg.com.br";

const HEADERS = {
  "Content-Type": "application/json",
  orchestrator: "crm-hatanaka",
};

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
}

export const sinistroService = {
  async createSinistro(payload: SinistroCreatePayload): Promise<SinistroCreatePayload> {
    const res = await fetch(`${BASE_URL}/v1/create/sinistro`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Erro ao criar sinistro");
    return res.json();
  },
};
