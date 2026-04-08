import type { ExtractedDocumentData } from "./documentAnalysisService";

const BASE_URL = "https://crm-hataseg.com.br";

export interface ClientCreatePayload {
  customer_data: {
    lead_id: string;
    lead_status: string;
    nome: string;
    cpf: string;
    endereco: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
    telefone: string;
    celular: string;
    email: string;
  };
  vehicle_data: VehicleDataSingle[];
  financial_data: FinancialDataSingle[];
}

export type VehicleDataSingle = {
  veiculo_fabricante: string;
  veiculo_modelo: string;
  veiculo_ano: string;
  veiculo_placa: string;
  veiculo_chassi: string;
  veiculo_combustivel: string;
  veiculo_codigo_fipe: string;
  veiculo_zero_km: string;
  veiculo_utilizacao: string;
  numero_apolice?: string;
};

export type ParcelaStatus = {
  parcela: string;
  paga: boolean;
};

export type FinancialDataSingle = {
  premio_total: string;
  premio_liquido: string;
  parcelas: string;
  valor_parcela: string;
  numero_proposta: string;
  numero_apolice: string;
  ci: string;
  vigencia_inicio: string;
  vigencia_fim: string;
  seguradora: string;
  comissao: string;
  classe_bonus: string;
  iof: string;
  forma_pagamento: string;
  franquia: string;
  coberturas: Array<{ descricao: string; limite: string; premio: string }>;
  lista_parcelas?: ParcelaStatus[];
};

export type VehicleData = VehicleDataSingle;
export type FinancialData = FinancialDataSingle;

export interface VehiclePolicy {
  vehicle: VehicleData;
  financial: FinancialData;
}

export interface ClientApiResponse {
  id: string;
  customer_data: ClientCreatePayload["customer_data"];
  vehicle_data: VehicleData | VehicleData[];
  financial_data: FinancialData | FinancialData[];
  created_at?: string;
  updated_at?: string;
}

export interface Client {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  celular: string;
  endereco: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  lead_id: string;
  lead_status: string;
  vehicles: VehiclePolicy[];
  created_at?: string;
  updated_at?: string;
}

function toArray<T>(val: T | T[]): T[] {
  return Array.isArray(val) ? val : [val];
}

function mapApiToClient(raw: ClientApiResponse): Client {
  const vehicleArr = toArray(raw.vehicle_data);
  const financialArr = toArray(raw.financial_data);
  const vehicles: VehiclePolicy[] = vehicleArr.map((v) => {
    const matched = financialArr.find(f => f.numero_apolice === v.numero_apolice);
    return { vehicle: v, financial: matched || financialArr[0] };
  });

  return {
    id: raw.id,
    ...raw.customer_data,
    vehicles,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  };
}

export function buildClientPayload(
  leadId: string,
  leadStatus: string,
  data: ExtractedDocumentData
): ClientCreatePayload {
  return {
    customer_data: {
      lead_id: leadId,
      lead_status: leadStatus,
      nome: data.segurado_nome,
      cpf: data.segurado_cpf,
      endereco: data.segurado_endereco,
      bairro: data.segurado_bairro,
      cidade: data.segurado_cidade,
      uf: data.segurado_uf,
      cep: data.segurado_cep,
      telefone: data.segurado_telefone,
      celular: data.segurado_celular,
      email: data.segurado_email,
    },
    vehicle_data: [{
      veiculo_fabricante: data.veiculo_fabricante,
      veiculo_modelo: data.veiculo_modelo,
      veiculo_ano: data.veiculo_ano,
      veiculo_placa: data.veiculo_placa,
      veiculo_chassi: data.veiculo_chassi,
      veiculo_combustivel: data.veiculo_combustivel,
      veiculo_codigo_fipe: data.veiculo_codigo_fipe,
      veiculo_zero_km: data.veiculo_zero_km,
      veiculo_utilizacao: data.veiculo_utilizacao,
      numero_apolice: data.numero_apolice,
    }],
    financial_data: [{
      premio_total: data.premio_total,
      premio_liquido: data.premio_liquido,
      parcelas: data.parcelas,
      valor_parcela: data.valor_parcela,
      numero_proposta: data.numero_proposta,
      numero_apolice: data.numero_apolice,
      ci: data.ci,
      vigencia_inicio: data.vigencia_inicio,
      vigencia_fim: data.vigencia_fim,
      seguradora: data.seguradora,
      comissao: "",
      classe_bonus: data.classe_bonus,
      iof: data.iof,
      forma_pagamento: data.forma_pagamento,
      franquia: data.franquia,
      coberturas: data.coberturas,
    }],
  };
}

export interface ClientUpdatePayload {
  customer_data: Partial<ClientCreatePayload["customer_data"]>;
  vehicle_data?: Partial<VehicleDataSingle>[];
  financial_data?: (Partial<FinancialDataSingle> & { lista_parcelas?: ParcelaStatus[] })[];
}

const HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  "orchestrator": "crm-hatanaka",
};

function buildHeaders(): Record<string, string> {
  return {
    ...HEADERS,
    messageid: `MSG-CLIENT-${Date.now()}`,
  };
}

export const clientService = {
  async getClients(): Promise<Client[]> {
    const response = await fetch(`${BASE_URL}/v1/read/client`);
    if (!response.ok) throw new Error("Erro ao buscar clientes");
    const result = await response.json();
    const items: ClientApiResponse[] = result.success?.apolices || result.data || result;
    return items.map(mapApiToClient);
  },

  async getClientById(clientId: string): Promise<Client> {
    const response = await fetch(`${BASE_URL}/v1/read/client/${clientId}`);
    if (!response.ok) throw new Error("Erro ao buscar cliente");
    const result = await response.json();
    const raw: ClientApiResponse = result.success?.apolices?.[0] || result.data || result;
    return mapApiToClient(raw);
  },

  async createClient(payload: ClientCreatePayload): Promise<void> {
    const body = {
      customer_data: payload.customer_data,
      vehicle_data: Array.isArray(payload.vehicle_data) ? payload.vehicle_data : [payload.vehicle_data],
      financial_data: Array.isArray(payload.financial_data) ? payload.financial_data : [payload.financial_data],
    };
    const response = await fetch(`${BASE_URL}/v1/create/client`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error("Erro ao criar cliente");
  },

  async updateClient(_clienteId: string, payload: ClientUpdatePayload): Promise<void> {
    const body: Record<string, unknown> = {
      customer_data: payload.customer_data,
    };
    if (payload.vehicle_data) {
      body.vehicle_data = Array.isArray(payload.vehicle_data) ? payload.vehicle_data : [payload.vehicle_data];
    }
    if (payload.financial_data) {
      body.financial_data = Array.isArray(payload.financial_data) ? payload.financial_data : [payload.financial_data];
    }
    const response = await fetch(`${BASE_URL}/v1/update/client`, {
      method: "PATCH",
      headers: buildHeaders(),
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error("Erro ao atualizar cliente");
  },

  async deleteClient(clienteId: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/v1/delete/client`, {
      method: "DELETE",
      headers: HEADERS,
      body: JSON.stringify({ id: clienteId }),
    });
    if (!response.ok) throw new Error("Erro ao excluir cliente");
  },
};
