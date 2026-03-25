const BASE_URL = "https://crm-hataseg.com.br/mango-softwares";

export interface RenovacaoClient {
  id: string;
  apolice: string;
  cliente: string;
  ramo: string;
  seguradora: string;
  vencimento: string;
  premio: string;
  dias: number;
  status: string;
  observacoes?: string;
  veiculos: {
    id: string;
    marca: string;
    modelo: string;
    ano: string;
    placa: string;
    chassi: string;
  }[];
  renovacao_data?: {
    source_apolice_id?: string;
    [key: string]: unknown;
  };
}

export const renovacaoClientService = {
  async getAll(): Promise<RenovacaoClient[]> {
    const response = await fetch(`${BASE_URL}/v1/read/renovacao/client?searchTag=all`);
    if (!response.ok) throw new Error("Erro ao buscar clientes de renovação");
    return response.json();
  },

  async getById(id: string): Promise<RenovacaoClient> {
    const response = await fetch(
      `${BASE_URL}/v1/read/renovacao/client?searchTag=id&searchValue=${encodeURIComponent(id)}`
    );
    if (!response.ok) throw new Error("Erro ao buscar renovação por ID");
    return response.json();
  },

  async getByApoliceId(apoliceId: string): Promise<RenovacaoClient[]> {
    const response = await fetch(
      `${BASE_URL}/v1/read/renovacao/client?searchTag=renovacao_data.source_apolice_id&searchValue=${encodeURIComponent(apoliceId)}`
    );
    if (!response.ok) throw new Error("Erro ao buscar renovações por apólice");
    return response.json();
  },
};
