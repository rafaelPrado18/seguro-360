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
    const formData = new FormData();
    formData.append("file", file, file.name);

    const response = await fetch(`${BASE_URL}/v1/extract/document`, {
      method: "POST",
      body: formData,
      redirect: "follow",
    });

    if (!response.ok) throw new Error("Erro ao analisar documento");

    const result = await response.json();

    // Map API response to our interface, falling back to empty strings
    const data: ExtractedDocumentData = {
      tipo,
      seguradora: result.seguradora ?? "",
      numero_proposta: result.numero_proposta ?? "",
      numero_apolice: result.numero_apolice ?? "",
      ci: result.ci ?? "",
      vigencia_inicio: result.vigencia_inicio ?? "",
      vigencia_fim: result.vigencia_fim ?? "",
      classe_bonus: result.classe_bonus ?? "",

      segurado_nome: result.segurado_nome ?? "",
      segurado_cpf: result.segurado_cpf ?? "",
      segurado_endereco: result.segurado_endereco ?? "",
      segurado_bairro: result.segurado_bairro ?? "",
      segurado_cidade: result.segurado_cidade ?? "",
      segurado_uf: result.segurado_uf ?? "",
      segurado_cep: result.segurado_cep ?? "",
      segurado_telefone: result.segurado_telefone ?? "",
      segurado_celular: result.segurado_celular ?? "",
      segurado_email: result.segurado_email ?? "",

      veiculo_fabricante: result.veiculo_fabricante ?? "",
      veiculo_modelo: result.veiculo_modelo ?? "",
      veiculo_ano: result.veiculo_ano ?? "",
      veiculo_placa: result.veiculo_placa ?? "",
      veiculo_chassi: result.veiculo_chassi ?? "",
      veiculo_combustivel: result.veiculo_combustivel ?? "",
      veiculo_codigo_fipe: result.veiculo_codigo_fipe ?? "",
      veiculo_zero_km: result.veiculo_zero_km ?? "",
      veiculo_utilizacao: result.veiculo_utilizacao ?? "",

      premio_liquido: result.premio_liquido ?? "",
      iof: result.iof ?? "",
      premio_total: result.premio_total ?? "",
      parcelas: result.parcelas ?? "",
      valor_parcela: result.valor_parcela ?? "",
      forma_pagamento: result.forma_pagamento ?? "",
      franquia: result.franquia ?? "",

      coberturas: Array.isArray(result.coberturas) ? result.coberturas : [],
    };

    return data;
  },
};
