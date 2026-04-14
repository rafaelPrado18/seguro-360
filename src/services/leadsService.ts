// Service layer for Leads API integration
// Replace BASE_URL and implement your API endpoints

const BASE_URL = "https://crm-hataseg.com.br"; // TODO: Replace with your actual API base URL

export interface Lead {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  origem: "site" | "indicacao" | "whatsapp" | "facebook" | "instagram" | "google_ads" | "meta_ads" | "outro";
  ramo_interesse: string;
  status: "novo" | "em_contato" | "qualificado" | "proposta_enviada" | "convertido" | "perdido";
  corretor_responsavel: string | null;
  valor_estimado: number;
  modelo?: string;
  placa?: string;
  observacoes: string;
  cliente_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadFilters {
  status?: Lead["status"];
  origem?: Lead["origem"];
  corretor_responsavel?: string;
  data_inicio?: string;
  data_fim?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface LeadDistribution {
  corretor_id: string;
  corretor_nome: string;
  total_leads: number;
  convertidos: number;
  taxa_conversao: number;
  valor_total_convertido: number;
}

export interface LeadHistoryEntry {
  leadId: string;
  historyType: string;
  textContent: string;
  timestamp: string;
  profile: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export const leadsService = { 
  // GET /api/leads - Listar leads com filtros e paginação
  async getLeads(filters?: LeadFilters, currentUser?: string, userFunction?: string): Promise<PaginatedResponse<Lead>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    if (userFunction != 'administrador'){
      const response = await fetch(`${BASE_URL}/v1/read/leads?leadTag=corretor_responsavel&leadValue=${currentUser}`);
      if (!response.ok) throw new Error("Erro ao buscar leads");
      return response.json();
    }else{
      const response = await fetch(`${BASE_URL}/v1/read/leads`);
      if (!response.ok) throw new Error("Erro ao buscar leads");
      return response.json();
    }

  },

  // GET /v1/read/leads?leadTag=telefone&leadValue=... - Buscar lead por telefone
  async getLeadByPhone(telefone: string): Promise<Lead | null> {
    try {
      const response = await fetch(`${BASE_URL}/v1/read/leads?leadTag=telefone&leadValue=${telefone}`);
      if (!response.ok) return null;
      const result = await response.json();
      const leads = result.data || result;
      if (Array.isArray(leads) && leads.length > 0) return leads[0];
      return null;
    } catch {
      return null;
    }
  },

  // GET /api/leads/:id - Buscar lead por ID
  async getLeadById(id: string): Promise<Lead> {
    const response = await fetch(`${BASE_URL}/leads/${id}`);
    if (!response.ok) throw new Error("Erro ao buscar lead");
    return response.json();
  },

  // POST /v1/create/lead - Criar novo lead
  async createLead(data: {
    nome: string;
    email: string;
    telefone: string;
    origem: string;
    corretor_responsavel: string;
    valor_estimado: string;
    modelo: string;
    observacoes: string;
  }): Promise<unknown> {
    const response = await fetch(`${BASE_URL}/v1/create/lead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Erro ao criar lead");
    return 
  },

  // PATCH /v1/update/lead - Atualizar lead
  async updateLead(id: string, data: Partial<Lead>): Promise<void> {
    const response = await fetch(`${BASE_URL}/v1/update/lead`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    if (!response.ok) throw new Error("Erro ao atualizar lead");
  },

  // DELETE /api/leads/:id - Remover lead
  async deleteLead(id: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/leads/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Erro ao remover lead");
  },

  // POST /api/leads/:id/assign - Atribuir lead a corretor
  async assignLead(leadId: string, corretorId: string): Promise<Lead> {
    const response = await fetch(`${BASE_URL}/leads/${leadId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ corretor_id: corretorId }),
    });
    if (!response.ok) throw new Error("Erro ao atribuir lead");
    return response.json();
  },

  // POST /api/leads/distribute - Distribuir leads automaticamente
  async distributeLeads(leadIds: string[], strategy: "round_robin" | "performance" | "manual"): Promise<Lead[]> {
    const response = await fetch(`${BASE_URL}/leads/distribute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead_ids: leadIds, strategy }),
    });
    if (!response.ok) throw new Error("Erro ao distribuir leads");
    return response.json();
  },

  // GET /api/leads/distribution - Relatório de distribuição por corretor
  async getDistribution(): Promise<LeadDistribution[]> {
    const response = await fetch(`${BASE_URL}/leads/distribution`);
    if (!response.ok) throw new Error("Erro ao buscar distribuição");
    return response.json();
  },

  // GET /api/leads/stats - Estatísticas gerais de leads
  async getStats(): Promise<{
    total: number;
    novos: number;
    em_contato: number;
    qualificados: number;
    convertidos: number;
    perdidos: number;
    taxa_conversao: number;
    por_origem: Record<string, number>;
  }> {
    const response = await fetch(`${BASE_URL}/leads/stats`);
    if (!response.ok) throw new Error("Erro ao buscar estatísticas");
    return response.json();
  },

  // PATCH /api/leads/:id/status - Alterar status do lead
  async updateStatus(id: string, status: Lead["status"], observacao?: string): Promise<Lead> {
    const response = await fetch(`${BASE_URL}/v1/update/lead/real/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, observacao }),
    });
    if (!response.ok) throw new Error("Erro ao atualizar status");
    return;
  },

  // POST /v1/redistribute/leads - Redistribuir leads
  async redistributeLeads(params: {
    startDate: string;
    startHour: string;
    corretorOrigem: string[];
    corretoresDestino: string[];
  }): Promise<void> {
    console.log
    const response = await fetch(`${BASE_URL}/v1/redistribute/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    console.log(response.status)
    if (!response.ok) throw new Error("Erro ao redistribuir leads");
  },

  // GET /v1/get/lead/history - Buscar histórico do lead por leadId
  async getLeadHistory(leadId: string): Promise<LeadHistoryEntry[]> {
    const response = await fetch(`${BASE_URL}/v1/get/lead/history?searchTag=leadId&searchValue=${encodeURIComponent(leadId)}`, {
      method: "GET",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    if (!response.ok) throw new Error("Erro ao buscar histórico do lead");
    const result = await response.json();
    return Array.isArray(result) ? result : result.data || [];
  },

  // POST /v1/create/lead/history - Criar entrada no histórico do lead
  async createLeadHistory(data: {
    leadId: string;
    historyType: string;
    textContent: string;
    profile: string;
  }): Promise<unknown> {
    const response = await fetch(`${BASE_URL}/v1/create/lead/history/note`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Erro ao criar histórico do lead");
    return ;
  },

  // POST /v1/create/lead/history/file - Upload de arquivo no histórico do lead
  async uploadLeadFile(file: File, fileType: "image" | "proposta" | "apolice" | "pdf", profile: string, leadId: string): Promise<void> {
    const formData = new FormData();
    formData.append("leadId", leadId);
    formData.append("fileType", fileType);
    formData.append("profile", profile);
    formData.append("file", file, file.name);

    const response = await fetch(`${BASE_URL}/v1/create/lead/history/file`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) throw new Error("Erro ao enviar arquivo");
  },
};
