// Service layer for WhatsApp API integration
// Replace BASE_URL and implement your API endpoints (e.g., WhatsApp Business API, Z-API, Evolution API)

const BASE_URL = "/api"; // TODO: Replace with your actual API base URL

export interface WhatsAppContact {
  id: string;
  nome: string;
  telefone: string;
  foto_url: string | null;
  lead_id: string | null;
  cliente_id: string | null;
  ultima_mensagem: string;
  ultima_mensagem_at: string;
  nao_lidas: number;
  status: "ativo" | "arquivado" | "bloqueado";
  tags: string[];
}

export interface WhatsAppMessage {
  id: string;
  contato_id: string;
  tipo: "text" | "image" | "document" | "audio" | "video" | "location" | "template";
  conteudo: string;
  media_url: string | null;
  media_mime_type: string | null;
  direcao: "enviada" | "recebida";
  status: "enviada" | "entregue" | "lida" | "erro";
  remetente: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export interface WhatsAppTemplate {
  id: string;
  nome: string;
  categoria: string;
  conteudo: string;
  variaveis: string[];
  status: "aprovado" | "pendente" | "rejeitado";
}

export interface SendMessagePayload {
  contato_id: string;
  tipo: WhatsAppMessage["tipo"];
  conteudo: string;
  media_url?: string;
  template_id?: string;
  template_vars?: Record<string, string>;
}

export interface ConversationFilters {
  search?: string;
  status?: WhatsAppContact["status"];
  tags?: string[];
  nao_lidas?: boolean;
  page?: number;
  per_page?: number;
}

export const whatsappService = {
  // GET /api/whatsapp/conversations - Listar conversas
  async getConversations(filters?: ConversationFilters): Promise<{
    data: WhatsAppContact[];
    total: number;
  }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            params.append(key, value.join(","));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }
    const response = await fetch(`${BASE_URL}/whatsapp/conversations?${params.toString()}`);
    if (!response.ok) throw new Error("Erro ao buscar conversas");
    return response.json();
  },

  // GET /api/whatsapp/conversations/:id/messages - Buscar mensagens de uma conversa
  async getMessages(contatoId: string, page?: number, perPage?: number): Promise<{
    data: WhatsAppMessage[];
    total: number;
    has_more: boolean;
  }> {
    const params = new URLSearchParams();
    if (page) params.append("page", String(page));
    if (perPage) params.append("per_page", String(perPage));
    const response = await fetch(`${BASE_URL}/whatsapp/conversations/${contatoId}/messages?${params.toString()}`);
    if (!response.ok) throw new Error("Erro ao buscar mensagens");
    return response.json();
  },

  // POST /api/whatsapp/messages/send - Enviar mensagem
  async sendMessage(payload: SendMessagePayload): Promise<WhatsAppMessage> {
    const response = await fetch(`${BASE_URL}/whatsapp/messages/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Erro ao enviar mensagem");
    return response.json();
  },

  // POST /api/whatsapp/messages/send-bulk - Enviar mensagem em massa
  async sendBulkMessage(contatoIds: string[], payload: Omit<SendMessagePayload, "contato_id">): Promise<{
    enviadas: number;
    erros: number;
    detalhes: Array<{ contato_id: string; status: string; error?: string }>;
  }> {
    const response = await fetch(`${BASE_URL}/whatsapp/messages/send-bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contato_ids: contatoIds, ...payload }),
    });
    if (!response.ok) throw new Error("Erro ao enviar mensagens em massa");
    return response.json();
  },

  // GET /api/whatsapp/templates - Listar templates
  async getTemplates(): Promise<WhatsAppTemplate[]> {
    const response = await fetch(`${BASE_URL}/whatsapp/templates`);
    if (!response.ok) throw new Error("Erro ao buscar templates");
    return response.json();
  },

  // POST /api/whatsapp/conversations/:id/archive - Arquivar conversa
  async archiveConversation(contatoId: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/whatsapp/conversations/${contatoId}/archive`, { method: "POST" });
    if (!response.ok) throw new Error("Erro ao arquivar conversa");
  },

  // POST /api/whatsapp/conversations/:id/read - Marcar como lida
  async markAsRead(contatoId: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/whatsapp/conversations/${contatoId}/read`, { method: "POST" });
    if (!response.ok) throw new Error("Erro ao marcar como lida");
  },

  // POST /api/whatsapp/conversations/:id/tags - Adicionar tags
  async addTags(contatoId: string, tags: string[]): Promise<WhatsAppContact> {
    const response = await fetch(`${BASE_URL}/whatsapp/conversations/${contatoId}/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags }),
    });
    if (!response.ok) throw new Error("Erro ao adicionar tags");
    return response.json();
  },

  // POST /api/whatsapp/conversations/:id/link-lead - Vincular conversa a um lead
  async linkToLead(contatoId: string, leadId: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/whatsapp/conversations/${contatoId}/link-lead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead_id: leadId }),
    });
    if (!response.ok) throw new Error("Erro ao vincular lead");
  },

  // GET /api/whatsapp/webhook - Endpoint de webhook para receber mensagens (server-side)
  // POST /api/whatsapp/webhook - Receber notificações de mensagens (server-side)
  // Nota: O webhook deve ser configurado no painel da sua API WhatsApp apontando para o seu backend

  // GET /api/whatsapp/status - Status da conexão WhatsApp
  async getConnectionStatus(): Promise<{
    connected: boolean;
    phone_number: string;
    instance_name: string;
    battery: number;
    uptime: number;
  }> {
    const response = await fetch(`${BASE_URL}/whatsapp/status`);
    if (!response.ok) throw new Error("Erro ao verificar status");
    return response.json();
  },
};
