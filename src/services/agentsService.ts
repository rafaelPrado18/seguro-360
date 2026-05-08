export interface Agent {
  userId: string;
  agentId: string;
  name: string;
  email: string;
  telefone: string;
  status: "online" | "offline";
  isActive: boolean;
  vinculo: string;
  function: string;
  birthDate: string;
  registrationDate: string;
}

function getCookie(name) {
  const match = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/([.*+?^${}()|[\\]\\])/g, '\\$1') + '=([^;]*)')
  );
  return match ? decodeURIComponent(match[1]) : null;
}

const BASE_URL = "https://crm-hataseg.com.br";

export const agentsService = {
  async getAgents(): Promise<Agent[]> {
    const response = await fetch(`${BASE_URL}/v1/read/profile?searchTag=all`);
    if (!response.ok) throw new Error("Erro ao buscar agentes");
    return response.json();
  },

  async createAgent(data: Agent): Promise<void> {
    const response = await fetch(`${BASE_URL}/v1/create/profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getCookie("userToken")}`},
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Erro ao criar agente");
  },

  async updateAgentStatus(data: Partial<Agent>): Promise<void> {
    console.log(data)
    const response = await fetch(`${BASE_URL}/v1/update/agent/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getCookie("userToken")}`},
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Erro ao atualizar agente");
  },

  async updateAgent(id: string, data: Partial<Agent>): Promise<void> {
    const response = await fetch(`${BASE_URL}/v1/update/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getCookie("userToken")}` },
      body: JSON.stringify({ agentId: id, userId: getCookie("userId"), ...data }),
    });
    if (!response.ok) throw new Error("Erro ao atualizar agente");
  },

  async deleteAgent(data: Partial<Agent>): Promise<void> {
    const response = await fetch(`${BASE_URL}/v1/delete/profile`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getCookie("userToken")}`},
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Erro ao excluir agente");
  },
};
