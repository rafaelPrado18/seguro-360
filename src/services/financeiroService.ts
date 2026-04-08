import { clientService, type Client } from "./clientService";
import type { ParcelaStatus } from "./clientService";

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
  leadId: string;
  nome: string;
  apolice: string;
  totalParcelas: number;
  parcelas: FinanceiroParcela[];
  dadosCliente: FinanceiroDadosCliente;
  dadosApolice: FinanceiroDadosApolice;
  historico: FinanceiroHistoricoEntry[];
}

function mapClientToFinanceiro(client: Client): FinanceiroClient[] {
  return client.vehicles.map((vp) => {
    const fin = vp.financial;
    const totalParcelas = parseInt(fin.parcelas) || 0;

    // Build parcelas from lista_parcelas if available, otherwise generate from total
    const parcelas: FinanceiroParcela[] = fin.lista_parcelas
      ? fin.lista_parcelas.map((lp, i) => ({
          mes: `Parcela ${i + 1}`,
          status: lp.paga ? "pago" as const : "pendente" as const,
        }))
      : Array.from({ length: totalParcelas }, (_, i) => ({
          mes: `Parcela ${i + 1}`,
          status: "pendente" as const,
        }));

    return {
      id: client.id,
      leadId: client.lead_id,
      nome: client.nome,
      apolice: fin.numero_apolice || "",
      totalParcelas,
      parcelas,
      dadosCliente: {
        cpfCnpj: client.cpf,
        email: client.email,
        telefone: client.telefone,
        celular: client.celular,
        endereco: client.endereco,
        bairro: client.bairro,
        cidade: client.cidade,
        uf: client.uf,
        cep: client.cep,
      },
      dadosApolice: {
        numeroApolice: fin.numero_apolice,
        numeroProposta: fin.numero_proposta,
        seguradora: fin.seguradora,
        ramo: "",
        vigenciaInicio: fin.vigencia_inicio,
        vigenciaFim: fin.vigencia_fim,
        premioTotal: fin.premio_total,
        premioLiquido: fin.premio_liquido,
        iof: fin.iof,
        comissao: fin.comissao,
        formaPagamento: fin.forma_pagamento,
        franquia: fin.franquia,
        classeBonus: fin.classe_bonus,
        veiculo: {
          fabricante: vp.vehicle.veiculo_fabricante,
          modelo: vp.vehicle.veiculo_modelo,
          ano: vp.vehicle.veiculo_ano,
          placa: vp.vehicle.veiculo_placa,
          chassi: vp.vehicle.veiculo_chassi,
          combustivel: vp.vehicle.veiculo_combustivel,
          fipe: vp.vehicle.veiculo_codigo_fipe,
        },
      },
      historico: [],
    };
  });
}

export const financeiroService = {
  async getAll(): Promise<FinanceiroClient[]> {
    const clients = await clientService.getClients();
    return clients.flatMap(mapClientToFinanceiro);
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
