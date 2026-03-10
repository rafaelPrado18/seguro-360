const API_BASE = "https://crm-hataseg.com.br/apolices";

export interface Cobertura {
  descricao: string;
  limite: string;
  premio: string;
}

export interface ApoliceAPI {
  financial_data: {
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
    coberturas: Cobertura[];
  };
  vehicle_data: {
    veiculo_fabricante: string;
    veiculo_modelo: string;
    veiculo_ano: string;
    veiculo_placa: string;
    veiculo_chassi: string;
    veiculo_combustivel: string;
    veiculo_codigo_fipe: string;
    veiculo_zero_km: string;
    veiculo_utilizacao: string;
  };
  customer_data: {
    id: string | null;
    nome: string;
  };
  created_at: string;
  updated_at: string | null;
}

export interface ApoliceFormatted {
  id: string;
  numeroProposta: string;
  cliente: string;
  placa: string;
  seguradora: string;
  inicio: string;
  fim: string;
  premio: string;
  premioLiquido: string;
  comissao: string;
  status: string;
  ci: string;
  parcelas: string;
  valorParcela: string;
  classeBonus: string;
  iof: string;
  formaPagamento: string;
  franquia: string;
  coberturas: Cobertura[];
  veiculo: {
    fabricante: string;
    modelo: string;
    ano: string;
    placa: string;
    chassi: string;
    combustivel: string;
    codigoFipe: string;
    zeroKm: string;
    utilizacao: string;
  };
}

function isVigente(fimStr: string): boolean {
  if (!fimStr) return false;
  const parts = fimStr.split("/");
  if (parts.length !== 3) return false;
  const [day, month, year] = parts;
  const fim = new Date(Number(year), Number(month) - 1, Number(day));
  return fim >= new Date();
}

function formatApolice(raw: ApoliceAPI): ApoliceFormatted {
  const f = raw.financial_data;
  const v = raw.vehicle_data;
  const c = raw.customer_data;

  return {
    id: f.numero_apolice || "—",
    numeroProposta: f.numero_proposta || "—",
    cliente: c.nome || "—",
    placa: v.veiculo_placa || "—",
    seguradora: f.seguradora || "—",
    inicio: f.vigencia_inicio || "—",
    fim: f.vigencia_fim || "—",
    premio: f.premio_total ? `R$ ${f.premio_total}` : "—",
    premioLiquido: f.premio_liquido ? `R$ ${f.premio_liquido}` : "—",
    comissao: f.comissao ? `R$ ${f.comissao}` : "—",
    status: isVigente(f.vigencia_fim) ? "Vigente" : "Vencida",
    ci: f.ci || "—",
    parcelas: f.parcelas || "—",
    valorParcela: f.valor_parcela ? `R$ ${f.valor_parcela}` : "—",
    classeBonus: f.classe_bonus || "—",
    iof: f.iof ? `R$ ${f.iof}` : "—",
    formaPagamento: f.forma_pagamento || "—",
    franquia: f.franquia ? `R$ ${f.franquia}` : "—",
    coberturas: f.coberturas || [],
    veiculo: {
      fabricante: v.veiculo_fabricante || "—",
      modelo: v.veiculo_modelo || "—",
      ano: v.veiculo_ano || "—",
      placa: v.veiculo_placa || "—",
      chassi: v.veiculo_chassi || "—",
      combustivel: v.veiculo_combustivel || "—",
      codigoFipe: v.veiculo_codigo_fipe || "—",
      zeroKm: v.veiculo_zero_km || "—",
      utilizacao: v.veiculo_utilizacao || "—",
    },
  };
}

export const apolicesService = {
  async getAll(): Promise<ApoliceFormatted[]> {
    const res = await fetch(`${API_BASE}/financial-data`, {
      headers: { accept: "application/json" },
    });
    if (!res.ok) throw new Error("Erro ao buscar apólices");
    const data = await res.json();
    const apolices: ApoliceAPI[] = data?.success?.apolices || [];
    return apolices.map(formatApolice);
  },
};
