// Service layer for Bot Functions (reusable actions available to Bot Flow Action nodes).
// Endpoints follow the project's orchestrator contract.

const BASE_URL = "https://crm-hataseg.com.br";

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(";").shift()!;
  return null;
}

const orchestratorHeaders = (): HeadersInit => ({
  "Content-Type": "application/json",
  orchestrator: "crm-hatanaka",
  Authorization: `Bearer ${getCookie("userToken") ?? ""}`,
});

export type BotFunctionType = "http" | "internal";
export type InternalAction = "create_lead" | "transfer" | "tag" | "schedule_task" | "send_template";

export interface BotFunctionParam {
  name: string;
  label?: string;
  required?: boolean;
}

export interface BotFunction {
  id?: string;
  nome: string;
  descricao?: string;
  tipo: BotFunctionType;
  ativo: boolean;
  // HTTP
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  url?: string;
  headers?: Record<string, string>;
  body?: string; // JSON template with {{vars}}
  // Internal
  internalAction?: InternalAction;
  defaultPayload?: Record<string, string>;
  // Common
  parametros?: BotFunctionParam[];
  updated_at?: string;
}

export const botFunctionService = {
  async list(): Promise<BotFunction[]> {
    const res = await fetch(`${BASE_URL}/v1/read/bot-function`, { headers: orchestratorHeaders() });
    if (!res.ok) throw new Error("Erro ao listar funções");
    const json = await res.json().catch(() => ({}));
    return (json.data || json || []) as BotFunction[];
  },

  async create(payload: Omit<BotFunction, "id">): Promise<BotFunction> {
    const res = await fetch(`${BASE_URL}/v1/create/bot-function`, {
      method: "POST",
      headers: orchestratorHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Erro ao criar função");
    return res.json();
  },

  async update(payload: BotFunction): Promise<BotFunction> {
    const res = await fetch(`${BASE_URL}/v1/update/bot-function`, {
      method: "PATCH",
      headers: orchestratorHeaders(),
      body: JSON.stringify({
        filtros: { id: payload.id },
        dados: payload,
        atualizarTodos: false,
      }),
    });
    if (!res.ok) throw new Error("Erro ao atualizar função");
    return res.json();
  },

  async remove(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/v1/delete/bot-function`, {
      method: "DELETE",
      headers: orchestratorHeaders(),
      body: JSON.stringify({ filtros: { id }, deletarTodos: false }),
    });
    if (!res.ok) throw new Error("Erro ao excluir função");
  },
};
