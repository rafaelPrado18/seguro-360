export interface Agent {
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

const BASE_URL = "http://localhost:5004/mango-softwares/v1";

export const agentsService = {
  async getAgents(): Promise<Agent[]> {
    const response = await fetch(`${BASE_URL}/read/agents`);
    if (!response.ok) throw new Error("Erro ao buscar agentes");
    return response.json();
  },

  async createAgent(data: Omit<Agent, "agentId">): Promise<void> {
    const response = await fetch(`${BASE_URL}/create/agent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Erro ao criar agente");
  },

  async updateAgent(id: string, data: Partial<Agent>): Promise<void> {
    const response = await fetch(`${BASE_URL}/update/agent/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Erro ao atualizar agente");
  },

  async deleteAgent(id: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/delete/agent/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Erro ao excluir agente");
  },
};
