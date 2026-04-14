const BASE_URL = "https://crm-hataseg.com.br";

export interface ComissaoRegistro {
  client_id: string;
  cliente: string;
  cpf: string;
  responsavel: string;
  numero_apolice: string;
  numero_proposta: string;
  seguradora: string;
  premio_liquido: number;
  comissao_percentual: string;
  comissao_valor: number;
}

export interface ComissaoResumo {
  total_registros: number;
  total_premio_liquido: number;
  total_comissao: number;
}

export interface ComissaoPorUsuario {
  responsavel: string;
  total_clientes: number;
  total_premio_liquido: number;
  total_comissao: number;
}

export interface ComissoesResponse {
  resumo_geral: ComissaoResumo;
  por_usuario: ComissaoPorUsuario[];
  filtro_responsavel: string | null;
  registros: ComissaoRegistro[];
}

export const comissoesService = {
  async getComissoes(responsavel?: string): Promise<ComissoesResponse> {
    const url = new URL(`${BASE_URL}/v1/read/client/commission`);
    if (responsavel) {
      url.searchParams.set("responsavel", responsavel);
    }
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error("Erro ao buscar comissões");
    const result = await response.json();
    return result.data;
  },
};
