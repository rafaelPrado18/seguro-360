export interface Tarefa {
  id: string;
  id_usuario: string;
  titulo: string;
  hora: string;
  tipo: string;
  prioridade: string;
  concluida: boolean;
}

const BASE_URL = "https://crm-hataseg.com.br";
const HEADERS = {
  "Content-Type": "application/json",
  orchestrator: "crm-hatanaka",
};

function getUserId(): string {
  const match = document.cookie.match(/(^| )userId=([^;]+)/);
  return match ? decodeURIComponent(match[2]) : "";
}

export const agendaService = {
  async getAll(): Promise<Tarefa[]> {
    const id_usuario = getUserId();
    const response = await fetch(
      `${BASE_URL}/v1/read/agenda?id_usuario=${encodeURIComponent(id_usuario)}&searchTag=all`,
      { headers: { orchestrator: "crm-hatanaka" } }
    );
    if (!response.ok) throw new Error("Erro ao buscar tarefas");
    return response.json();
  },

  async getById(id: string): Promise<Tarefa> {
    const id_usuario = getUserId();
    const response = await fetch(
      `${BASE_URL}/v1/read/agenda?id_usuario=${encodeURIComponent(id_usuario)}&searchTag=id&searchValue=${id}`,
      { headers: { orchestrator: "crm-hatanaka" } }
    );
    if (!response.ok) throw new Error("Erro ao buscar tarefa");
    return response.json();
  },

  async create(data: Omit<Tarefa, "id">): Promise<Tarefa> {
    const response = await fetch(`${BASE_URL}/v1/create/agenda`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ ...data, id_usuario: getUserId() }),
    });
    if (!response.ok) throw new Error("Erro ao criar tarefa");
    return response.json();
  },

  async update(data: Partial<Tarefa> & { id: string }): Promise<void> {
    const response = await fetch(`${BASE_URL}/v1/update/agenda`, {
      method: "PATCH",
      headers: HEADERS,
      body: JSON.stringify({ ...data, id_usuario: getUserId() }),
    });
    if (!response.ok) throw new Error("Erro ao atualizar tarefa");
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/v1/delete/agenda`, {
      method: "DELETE",
      headers: HEADERS,
      body: JSON.stringify({ id, id_usuario: getUserId() }),
    });
    if (!response.ok) throw new Error("Erro ao excluir tarefa");
  },
};
