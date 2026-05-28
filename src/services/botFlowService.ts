// Service layer for Bot Flow (chatbot paths) integration with the orchestrator API.
// Endpoints below are stubs — replace paths once backend is ready. Headers follow
// the project's standard orchestrator contract.

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

export type BotNodeType = "message" | "question" | "condition" | "action";

export interface BotFlowNodeData extends Record<string, unknown> {
  label: string;
  message?: string;
  options?: { label: string; value: string }[];
  variable?: string;
  operator?: "eq" | "neq" | "contains" | "gt" | "lt";
  value?: string;
  actionType?: "create_lead" | "transfer" | "call_api" | "tag";
  actionPayload?: Record<string, string>;
}

export interface BotFlowNode {
  id: string;
  type: BotNodeType;
  position: { x: number; y: number };
  data: BotFlowNodeData;
}

export interface BotFlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  label?: string;
}

export interface BotFlow {
  id?: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  trigger?: string;
  nodes: BotFlowNode[];
  edges: BotFlowEdge[];
  updated_at?: string;
}

export const botFlowService = {
  async list(): Promise<BotFlow[]> {
    const res = await fetch(`${BASE_URL}/v1/read/bot-flow`, { headers: orchestratorHeaders() });
    if (!res.ok) throw new Error("Erro ao listar fluxos");
    const json = await res.json().catch(() => ({}));
    return (json.data || json || []) as BotFlow[];
  },

  async create(payload: Omit<BotFlow, "id">): Promise<BotFlow> {
    const res = await fetch(`${BASE_URL}/v1/create/bot-flow`, {
      method: "POST",
      headers: orchestratorHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Erro ao criar fluxo");
    return res.json();
  },

  async update(payload: BotFlow): Promise<BotFlow> {
    const res = await fetch(`${BASE_URL}/v1/update/bot-flow`, {
      method: "PATCH",
      headers: orchestratorHeaders(),
      body: JSON.stringify({
        filtros: { id: payload.id },
        dados: payload,
        atualizarTodos: false,
      }),
    });
    if (!res.ok) throw new Error("Erro ao atualizar fluxo");
    return res.json();
  },

  async remove(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/v1/delete/bot-flow`, {
      method: "DELETE",
      headers: orchestratorHeaders(),
      body: JSON.stringify({ filtros: { id }, deletarTodos: false }),
    });
    if (!res.ok) throw new Error("Erro ao excluir fluxo");
  },
};
