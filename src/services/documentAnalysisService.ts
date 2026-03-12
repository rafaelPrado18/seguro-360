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
  comissao: string;

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

    const apiData = result.data || result;
    const customer = apiData.customer_data || {};
    const vehicle = apiData.vehicle_data || {};
    const financial = apiData.financial_data || {};

    // Fetch existing lead data to fill in missing fields
    let leadData: Record<string, any> = {};
    if (customer.lead_id) {
      try {
        const leadRes = await fetch(`${BASE_URL}/v1/read/leads?leadTag=id&leadValue=${customer.lead_id}`);
        if (leadRes.ok) {
          const leadResult = await leadRes.json();
          const leads = leadResult.data || leadResult;
          if (Array.isArray(leads) && leads.length > 0) {
            leadData = leads[0];
          }
        }
      } catch {
        // Continue without lead data
      }
    }

    const data: ExtractedDocumentData = {
      tipo,
      seguradora: financial.seguradora ?? "",
      numero_proposta: financial.numero_proposta ?? "",
      numero_apolice: financial.numero_apolice ?? "",
      ci: financial.ci ?? "",
      vigencia_inicio: financial.vigencia_inicio ?? "",
      vigencia_fim: financial.vigencia_fim ?? "",
      classe_bonus: financial.classe_bonus ?? "",

      segurado_nome: customer.nome || leadData.nome || "",
      segurado_cpf: customer.cpf || leadData.cpf || "",
      segurado_endereco: customer.endereco || leadData.endereco || "",
      segurado_bairro: customer.bairro || leadData.bairro || "",
      segurado_cidade: customer.cidade || leadData.cidade || "",
      segurado_uf: customer.uf || leadData.uf || "",
      segurado_cep: customer.cep || leadData.cep || "",
      segurado_telefone: customer.telefone || leadData.telefone || "",
      segurado_celular: customer.celular || leadData.celular || "",
      segurado_email: customer.email || leadData.email || "",

      veiculo_fabricante: vehicle.veiculo_fabricante ?? "",
      veiculo_modelo: vehicle.veiculo_modelo || leadData.modelo || "",
      veiculo_ano: vehicle.veiculo_ano ?? "",
      veiculo_placa: vehicle.veiculo_placa ?? "",
      veiculo_chassi: vehicle.veiculo_chassi ?? "",
      veiculo_combustivel: vehicle.veiculo_combustivel ?? "",
      veiculo_codigo_fipe: vehicle.veiculo_codigo_fipe ?? "",
      veiculo_zero_km: vehicle.veiculo_zero_km ?? "",
      veiculo_utilizacao: vehicle.veiculo_utilizacao ?? "",

      premio_liquido: financial.premio_liquido ?? "",
      iof: financial.iof ?? "",
      premio_total: financial.premio_total ?? "",
      parcelas: financial.parcelas ?? "",
      valor_parcela: financial.valor_parcela ?? "",
      forma_pagamento: financial.forma_pagamento ?? "",
      franquia: financial.franquia ?? "",
      comissao: financial.comissao ?? "",

      coberturas: Array.isArray(financial.coberturas) ? financial.coberturas : [],
    };

    return data;
  },
};
