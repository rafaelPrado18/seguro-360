import type { ExtractedDocumentData } from "./documentAnalysisService";

const BASE_URL = "https://crm-hataseg.com.br";

export interface ClientPayload {
  lead_id: string;
  // Segurado
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
  // Veículo
  veiculo_fabricante: string;
  veiculo_modelo: string;
  veiculo_ano: string;
  veiculo_placa: string;
  veiculo_chassi: string;
  veiculo_combustivel: string;
  veiculo_codigo_fipe: string;
  veiculo_zero_km: string;
  veiculo_utilizacao: string;
  // Seguro
  seguradora: string;
  numero_proposta: string;
  numero_apolice: string;
  ci: string;
  vigencia_inicio: string;
  vigencia_fim: string;
  classe_bonus: string;
  // Financeiro
  premio_liquido: string;
  iof: string;
  premio_total: string;
  parcelas: string;
  valor_parcela: string;
  forma_pagamento: string;
  franquia: string;
  // Coberturas
  coberturas: Array<{ descricao: string; limite: string; premio: string }>;
}

export function buildClientPayload(leadId: string, data: ExtractedDocumentData): ClientPayload {
  return {
    lead_id: leadId,
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
    veiculo_fabricante: data.veiculo_fabricante,
    veiculo_modelo: data.veiculo_modelo,
    veiculo_ano: data.veiculo_ano,
    veiculo_placa: data.veiculo_placa,
    veiculo_chassi: data.veiculo_chassi,
    veiculo_combustivel: data.veiculo_combustivel,
    veiculo_codigo_fipe: data.veiculo_codigo_fipe,
    veiculo_zero_km: data.veiculo_zero_km,
    veiculo_utilizacao: data.veiculo_utilizacao,
    seguradora: data.seguradora,
    numero_proposta: data.numero_proposta,
    numero_apolice: data.numero_apolice,
    ci: data.ci,
    vigencia_inicio: data.vigencia_inicio,
    vigencia_fim: data.vigencia_fim,
    classe_bonus: data.classe_bonus,
    premio_liquido: data.premio_liquido,
    iof: data.iof,
    premio_total: data.premio_total,
    parcelas: data.parcelas,
    valor_parcela: data.valor_parcela,
    forma_pagamento: data.forma_pagamento,
    franquia: data.franquia,
    coberturas: data.coberturas,
  };
}

export const clientService = {
  async createClient(payload: ClientPayload): Promise<{ cliente_id: string }> {
    const response = await fetch(`${BASE_URL}/v1/create/client`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Erro ao criar cliente");
    return response.json();
  },

  async updateClient(clienteId: string, payload: Partial<ClientPayload>): Promise<unknown> {
    const response = await fetch(`${BASE_URL}/v1/update/client`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: clienteId, ...payload }),
    });
    if (!response.ok) throw new Error("Erro ao atualizar cliente");
    return response.json();
  },
};
