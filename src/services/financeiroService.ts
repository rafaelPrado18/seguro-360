import { clientService } from "./clientService";
import type { ParcelaStatus } from "./clientService";

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

  async updateParcela(clientId: string, parcelaIndex: number, status: "pago" | "pendente", allParcelas: FinanceiroParcela[], leadId: string): Promise<void> {
    // Build lista_parcelas from current state with the updated parcela
    const listaParcelas: ParcelaStatus[] = allParcelas.map((p, i) => ({
      parcela: `${i + 1}/${allParcelas.length}`,
      paga: i === parcelaIndex ? status === "pago" : p.status === "pago",
    }));

    await clientService.updateClient(clientId, {
      customer_data: { lead_id: leadId },
      financial_data: [{
        lista_parcelas: listaParcelas,
      }],
    });
  },
};
