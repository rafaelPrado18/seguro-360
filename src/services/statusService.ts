// Service layer for Leads API integration
// Replace BASE_URL and implement your API endpoints

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

const BASE_URL = "http://173.249.50.11:8000";

export const statusService = {
  async getLeadStatuses(): Promise<LeadStatus[]> {
    const response = await fetch(`${BASE_URL}/v1/read/lead/status`);
    if (!response.ok) throw new Error("Erro ao buscar status");
    return response.json();
  },

  async createLeadStatus(data: Omit<LeadStatus, "id">): Promise<LeadStatus> {
    const response = await fetch(`${BASE_URL}/v1/create/lead/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Erro ao criar status");
    return;
  },

  async updateLeadStatus(id: string, data: Partial<LeadStatus>): Promise<LeadStatus> {
    const response = await fetch(`${BASE_URL}/update/lead/status/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Erro ao atualizar status");
    return;
  },

  async deleteLeadStatus(id: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/v1/delete/lead/status`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({id}),
    });
    if (!response.ok) throw new Error("Erro ao excluir status");
  },
};
