export interface SinistroStatus {
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

export const sinistroStatusService = {
  async getStatuses(): Promise<SinistroStatus[]> {
    const response = await fetch(`${BASE_URL}/v1/read/sinistro/status?searchTag=all`);
    if (!response.ok) throw new Error("Erro ao buscar status de sinistro");
    return response.json();
  },

  async createStatus(data: Omit<SinistroStatus, "id">): Promise<void> {
    const response = await fetch(`${BASE_URL}/v1/create/sinistro/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Erro ao criar status de sinistro");
  },

  async updateStatus(id: string, data: Partial<SinistroStatus>): Promise<void> {
    const response = await fetch(`${BASE_URL}/v1/update/sinistro/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statusId: id, ...data }),
    });
    if (!response.ok) throw new Error("Erro ao atualizar status de sinistro");
  },

  async deleteStatus(id: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/v1/delete/sinistro/status`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) throw new Error("Erro ao excluir status de sinistro");
  },
};
