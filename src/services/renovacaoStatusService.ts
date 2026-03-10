export interface RenovacaoStatus {
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

const BASE_URL = "https://crm-hataseg.com.br";

export const renovacaoStatusService = {
  async getStatuses(): Promise<RenovacaoStatus[]> {
    const response = await fetch(`${BASE_URL}/v1/read/renovacao/status?searchTag=all`);
    if (!response.ok) throw new Error("Erro ao buscar status de renovação");
    return response.json();
  },

  async createStatus(data: Omit<RenovacaoStatus, "id">): Promise<RenovacaoStatus> {
    const response = await fetch(`${BASE_URL}/v1/create/renovacao/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Erro ao criar status de renovação");
    return response.json();
  },

  async updateStatus(id: string, data: Partial<RenovacaoStatus>): Promise<RenovacaoStatus> {
    const response = await fetch(`${BASE_URL}/v1/update/renovacao/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statusId: id, ...data }),
    });
    if (!response.ok) throw new Error("Erro ao atualizar status de renovação");
    return response.json();
  },

  async deleteStatus(id: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/v1/delete/renovacao/status`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) throw new Error("Erro ao excluir status de renovação");
  },
};
