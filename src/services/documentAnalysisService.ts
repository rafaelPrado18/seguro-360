// Service for document analysis (upload & AI extraction)
// TODO: Replace mock with real API endpoint

const BASE_URL = "https://crm-hataseg.com.br";

export interface ExtractedDocumentData {
  tipo: "apolice" | "proposta";
  seguradora: string;
  numero_proposta: string;
  numero_apolice: string;
  ci: string;
  vigencia_inicio: string;
  vigencia_fim: string;
  classe_bonus: string;

  // Segurado
  segurado_nome: string;
  segurado_cpf: string;
  segurado_endereco: string;
  segurado_bairro: string;
  segurado_cidade: string;
  segurado_uf: string;
  segurado_cep: string;
  segurado_telefone: string;
  segurado_celular: string;
  segurado_email: string;

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

  // Financeiro
  premio_liquido: string;
  iof: string;
  premio_total: string;
  parcelas: string;
  valor_parcela: string;
  forma_pagamento: string;
  franquia: string;

  // Coberturas (resumo)
  coberturas: Array<{
    descricao: string;
    limite: string;
    premio: string;
  }>;
}

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(";").shift()!;
  return null;
}

// Mock delay
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const documentAnalysisService = {
  /**
   * Envia o documento para análise e retorna os dados extraídos.
   * TODO: Substituir o mock pelo endpoint real da API.
   */
  async analyzeDocument(
    file: File,
    tipo: "apolice" | "proposta"
  ): Promise<ExtractedDocumentData> {
    // ── MOCK: simula chamada ao backend ──
    // Quando o endpoint estiver pronto, descomente o bloco abaixo:
    /*
    const userToken = getCookie("userToken");
    const formData = new FormData();
    formData.append("file", file, file.name);
    formData.append("tipo", tipo);

    const response = await fetch(`${BASE_URL}/v1/analyze/document`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
      body: formData,
    });

    if (!response.ok) throw new Error("Erro ao analisar documento");
    return response.json();
    */

    await delay(2500); // Simula processamento

    const mockData: ExtractedDocumentData = {
      tipo,
      seguradora: "Tokio Marine Seguradora",
      numero_proposta: "134687851",
      numero_apolice: tipo === "apolice" ? "34478995" : "",
      ci: "61924703958598",
      vigencia_inicio: "22/12/2024",
      vigencia_fim: "22/12/2025",
      classe_bonus: "2",

      segurado_nome: "SILENILDO DE JESUS FREITAS",
      segurado_cpf: "029.131.838-08",
      segurado_endereco: "RUA ARROIO CORDEIRO, 61 - CASA 1",
      segurado_bairro: "CJ HABITACIONAL",
      segurado_cidade: "SAO PAULO",
      segurado_uf: "SP",
      segurado_cep: "08472-340",
      segurado_telefone: "(11) 7728-1404",
      segurado_celular: "(11) 96123-9011",
      segurado_email: "SILENILDOJFREITAS@GMAIL.COM",

      veiculo_fabricante: "CHEVROLET",
      veiculo_modelo: "TRACKER 1.0 TURBO 12V 4P FLEX AUT",
      veiculo_ano: "2021",
      veiculo_placa: "FYP-8B95",
      veiculo_chassi: "9BGEX76H0MB187220",
      veiculo_combustivel: "Flex",
      veiculo_codigo_fipe: "004526-8",
      veiculo_zero_km: "Não",
      veiculo_utilizacao: "Particular - Lazer / ida e volta ao trabalho",

      premio_liquido: "R$ 3.828,37",
      iof: "R$ 282,53",
      premio_total: "R$ 4.110,90",
      parcelas: "12",
      valor_parcela: "R$ 342,51",
      forma_pagamento: "Cartão Visa",
      franquia: "R$ 5.860,00",

      coberturas: [
        { descricao: "Colisão, Incêndio e Roubo/Furto", limite: "100% VMR", premio: "R$ 2.866,35" },
        { descricao: "RCF-V - Danos Materiais", limite: "R$ 100.000,00", premio: "R$ 705,78" },
        { descricao: "RCF-V - Danos Corporais", limite: "R$ 100.000,00", premio: "R$ 141,16" },
        { descricao: "Assistência 24 horas", limite: "Completa", premio: "R$ 59,35" },
        { descricao: "Km adicional de reboque", limite: "Ilimitado", premio: "R$ 55,73" },
      ],
    };

    return mockData;
  },
};
