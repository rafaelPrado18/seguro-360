export interface Tarefa {
  id: string;
  titulo: string;
  hora: string;
  tipo: string;
  prioridade: string;
  concluida: boolean;
}

const BASE_URL = "https://crm-hataseg.com.br";
const HEADERS = {
  "Content-Type": "application/json",
  orchestrator: "local",
};

export const agendaService = {
  async getAll(): Promise<Tarefa[]> {
    const response = await fetch(
      `${BASE_URL}/v1/read/agenda?searchTag=all`,
      { headers: { orchestrator: "local" } }
    );
    if (!response.ok) throw new Error("Erro ao buscar tarefas");
    return response.json();
  },

  async getById(id: string): Promise<Tarefa> {
    const response = await fetch(
      `${BASE_URL}/v1/read/agenda?searchTag=id&searchValue=${id}`,
      { headers: { orchestrator: "local" } }
    );
    if (!response.ok) throw new Error("Erro ao buscar tarefa");
    return response.json();
  },

  async create(data: Omit<Tarefa, "id">): Promise<Tarefa> {
    const response = await fetch(`${BASE_URL}/v1/create/agenda`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Erro ao criar tarefa");
    return response.json();
  },

  async update(data: Partial<Tarefa> & { id: string }): Promise<void> {
    const response = await fetch(`${BASE_URL}/v1/update/agenda`, {
      method: "PATCH",
      headers: HEADERS,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Erro ao atualizar tarefa");
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/v1/delete/agenda`, {
      method: "DELETE",
      headers: HEADERS,
      body: JSON.stringify({ id }),
    });
    if (!response.ok) throw new Error("Erro ao excluir tarefa");
  },
};
