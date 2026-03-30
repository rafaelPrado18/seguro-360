const BASE_URL = "https://crm-hataseg.com.br/mango-softwares";

export interface FinanceiroParcela {
  mes: string;
  status: "pago" | "pendente";
}

export interface FinanceiroDadosCliente {
  cpfCnpj: string;
  email: string;
  telefone: string;
  celular: string;
  endereco: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
}

export interface FinanceiroDadosApolice {
  numeroApolice: string;
  numeroProposta: string;
  seguradora: string;
  ramo: string;
  vigenciaInicio: string;
  vigenciaFim: string;
  premioTotal: string;
  premioLiquido: string;
  iof: string;
  comissao: string;
  formaPagamento: string;
  franquia: string;
  classeBonus: string;
  veiculo?: {
    fabricante: string;
    modelo: string;
    ano: string;
    placa: string;
    chassi: string;
    combustivel: string;
    fipe: string;
  };
}

export interface FinanceiroHistoricoEntry {
  data: string;
  tipo: "nota" | "ligacao" | "email" | "whatsapp" | "documento" | "pagamento" | "apolice";
  descricao: string;
  autor: string;
}

export interface FinanceiroClient {
  id: string;
  nome: string;
  apolice: string;
  totalParcelas: number;
  parcelas: FinanceiroParcela[];
  dadosCliente: FinanceiroDadosCliente;
  dadosApolice: FinanceiroDadosApolice;
  historico: FinanceiroHistoricoEntry[];
}

export const financeiroService = {
  async getAll(): Promise<FinanceiroClient[]> {
    const response = await fetch(`${BASE_URL}/v1/read/financeiro/client?searchTag=all`, {
      headers: {
        "orchestrator": "crm_hatanaka",
      },
    });
    if (!response.ok) throw new Error("Erro ao buscar dados financeiros");
    const data = await response.json();
    // Normalize: API may return array directly or nested
    return Array.isArray(data) ? data : data?.success || data?.data || [];
  },

  async updateParcela(clientId: string, parcelaIndex: number, status: "pago" | "pendente"): Promise<void> {
    const response = await fetch(`${BASE_URL}/v1/update/financeiro/client`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "orchestrator": "crm_hatanaka",
      },
      body: JSON.stringify({
        id: clientId,
        updates: {
          [`parcelas.${parcelaIndex}.status`]: status,
        },
      }),
    });
    if (!response.ok) throw new Error("Erro ao atualizar parcela");
  },
};
