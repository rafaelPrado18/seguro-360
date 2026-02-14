// Service layer for Leads API integration
// Replace BASE_URL and implement your API endpoints

const BASE_URL = "http://localhost:5001/mango-softwares"; // TODO: Replace with your actual API base URL

export interface LeadStatus {
  id: string;
  label: string;
  key: string;
  color: string;
  bgColor: string;
  ordem: number;
  is_final: boolean;
  tipo: "ativo" | "ganho" | "perdido";
  template_id: string | null;
}


export const leadsService = { 
  // POST /api/leads - Criar novo lead
  async createLeadStatus(data: Omit<LeadStatus, "id" | "created_at" | "updated_at">): Promise<LeadStatus> {
    const response = await fetch(`http://localhost:5004/mango-softwares/v1/create/lead/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Erro ao criar lead");
    return response.json();
  },
};
