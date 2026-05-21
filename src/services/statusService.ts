// Service layer for Leads API integration
// Replace BASE_URL and implement your API endpoints

export interface LeadSubStatus {
  id?: string;
  label: string;
  key: string;
  send_message?: boolean;
  template_id?: string | null;
  delay_days?: number;
  send_time?: string | null;
}

export interface LeadSubStatusPayload {
  label: string;
  key: string;
  send_message?: boolean;
  template_id?: string | null;
  delay_days?: number;
  send_time?: string | null;
}

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
  substatus?: LeadSubStatus[];
}

const BASE_URL = "https://crm-hataseg.com.br";

const ORCHESTRATOR = "crm_hatanaka";

function stripSubstatusIds(data: any) {
  if (!data) return data;
  const { substatus, ...rest } = data;
  return {
    ...rest,
    substatus: substatus?.map(({ label, key, send_message, template_id }: LeadSubStatusPayload) => ({
      label,
      key,
      send_message: send_message ?? false,
      template_id: template_id ?? null,
    })) || [],
  };
}

export const statusService = {
  async getLeadStatuses(): Promise<LeadStatus[]> {
    const response = await fetch(`${BASE_URL}/v1/read/lead/status`, {
      headers: { orchestrator: ORCHESTRATOR },
    });
    if (!response.ok) throw new Error("Erro ao buscar status");
    return response.json();
  },

  async createLeadStatus(data: Omit<LeadStatus, "id">): Promise<LeadStatus> {
    const response = await fetch(`${BASE_URL}/v1/create/lead/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json", orchestrator: ORCHESTRATOR },
      body: JSON.stringify(stripSubstatusIds(data)),
    });
    if (!response.ok) throw new Error("Erro ao criar status");
    return;
  },

  async updateLeadStatus(id: string, data: Partial<LeadStatus>): Promise<void> {
    const response = await fetch(`${BASE_URL}/v1/update/lead/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", orchestrator: ORCHESTRATOR },
      body: JSON.stringify(stripSubstatusIds({ statusId: id, ...data })),
    });
    if (!response.ok) throw new Error("Erro ao atualizar status");
  },

  async deleteLeadStatus(id: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/v1/delete/lead/status`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", orchestrator: ORCHESTRATOR },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) throw new Error("Erro ao excluir status");
  },
};
