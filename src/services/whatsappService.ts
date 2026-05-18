// Service layer for WhatsApp API integration
// Replace BASE_URL and implement your API endpoints (e.g., WhatsApp Business API, Z-API, Evolution API)

const BASE_URL = "https://crm-hataseg.com.br"; // TODO: Replace with your actual API base URL

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
  chatId: string;
  tipo: "text" | "image" | "document" | "audio" | "video/mp4" | "location" | "template";
  conteudo: string;
  media_url: string | null;
  media_mime_type: string | null;
  direcao: "enviada" | "recebida";
  status: "enviada" | "SERVER" | "DELIVERY" | "READ" | "erro";
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
  chatId: string;
  tipo: WhatsAppMessage["tipo"];
  userId: string;
  message: string;
  instanceId?: string;
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

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(";").shift()!;
  return null;
}  

const userToken = getCookie('userToken')
const whatsappInstanceId = getCookie('whatsappInstanceId')
const whatsappInstanceToken = getCookie('whatsappInstanceToken')

export const whatsappService = {

  
  // GET /api/whatsapp/conversations - Listar conversas
  async getConversations(name?: string): Promise<{
    data: WhatsAppContact[];
    total: number;
  }> {
    const response = await fetch(`${BASE_URL}/v1/whatsapp/conversations?name=${name}`);
    if (!response.ok) throw new Error("Erro ao buscar conversas");
    return response.json();
  },

  // GET /api/whatsapp/conversations/:id/messages - Buscar mensagens de uma conversa
  async getMessages(contatoId: string, consultantId: string): Promise<{
    data: WhatsAppMessage[];
    total: number;
    has_more: boolean;
  }> {
    const response = await fetch(`${BASE_URL}/whatsapp/conversations/${contatoId}/${consultantId}/messages`);
    if (!response.ok) throw new Error("Erro ao buscar mensagens");
    return response.json();
  },

  // PUT /v1/send/message - Enviar mensagem de texto
  async sendMessage(payload: SendMessagePayload): Promise<void> {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${userToken}`);
    
    const resolvedInstanceId = payload.instanceId || whatsappInstanceId || undefined;

    const raw = JSON.stringify({
      userId: payload.userId,
      chatId: payload.chatId,
      message: payload.message,
      ...(resolvedInstanceId ? { instanceId: resolvedInstanceId } : {}),
      ...(whatsappInstanceToken ? { instanceToken: whatsappInstanceToken } : {}),
    });

    const response = await fetch(`${BASE_URL}/v1/send/message`, {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    });

    const result = await response.text();
    console.log("sendMessage result:", result);

    if (!response.ok) throw new Error("Erro ao enviar mensagem");
  },

  // POST /v1/send/media - Enviar mídia (imagem, documento, áudio)
  // TODO: Substituir pelo endpoint real da API
  async sendMedia(payload: {
    userId: string;
    chatId: string;
    tipo: "image" | "document" | "audio";
    file: File;
    caption?: string;
    instanceId?: string;
  }): Promise<void> {
    const fileTypeMap: Record<string, string> = {
      image: "image",
      document: "document",
      audio: "audio",
    };

    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${userToken}`);

    const resolvedInstanceId = payload.instanceId || whatsappInstanceId || undefined;

    const formdata = new FormData();
    formdata.append("file", payload.file, payload.file.name);
    formdata.append("fileType", fileTypeMap[payload.tipo]);
    formdata.append("userId", payload.userId);
    formdata.append("chatId", payload.chatId);
    if (resolvedInstanceId) formdata.append("instanceId", resolvedInstanceId);
    if (whatsappInstanceToken) formdata.append("instanceToken", whatsappInstanceToken);

    const response = await fetch(`${BASE_URL}/v1/send/media`, {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    });

    if (!response.ok) throw new Error("Erro ao enviar mídia");
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

  // GET /v1/read/template - Listar templates
  async getTemplates(filters?: { categoria?: string; status?: string }): Promise<WhatsAppTemplate[]> {
    const params = new URLSearchParams();
    if (filters?.categoria) params.append("categoria", filters.categoria);
    if (filters?.status) params.append("status", filters.status);
    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await fetch(`${BASE_URL}/v1/read/template${query}`, {
      headers: { "Content-Type": "application/json", orchestrator: "crm-hatanaka" },
    });
    if (!response.ok) throw new Error("Erro ao buscar templates");
    const result = await response.json();
    return result.data || result;
  },

  // POST /v1/create/template - Criar template
  async createTemplate(payload: Omit<WhatsAppTemplate, "id">): Promise<void> {
    const response = await fetch(`${BASE_URL}/v1/create/template`, {
      method: "POST",
      headers: { "Content-Type": "application/json", orchestrator: "crm-hatanaka" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Erro ao criar template");
  },

  // PATCH /v1/update/template - Atualizar template
  async updateTemplate(payload: WhatsAppTemplate): Promise<void> {
    const response = await fetch(`${BASE_URL}/v1/update/template`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", orchestrator: "crm-hatanaka" },
      body: JSON.stringify({
        filtros: {
          id: payload.id,
          nome: payload.nome,
          categoria: payload.categoria,
          status: payload.status,
        },
        dados: {
          id: payload.id,
          nome: payload.nome,
          categoria: payload.categoria,
          conteudo: payload.conteudo,
          variaveis: payload.variaveis,
          status: payload.status,
        },
        atualizarTodos: false,
      }),
    });
    if (!response.ok) throw new Error("Erro ao atualizar template");
  },

  // DELETE /v1/delete/template - Excluir template
  async deleteTemplate(payload: WhatsAppTemplate): Promise<void> {
    const response = await fetch(`${BASE_URL}/v1/delete/template`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        orchestrator: "crm-hatanaka",
      },
      body: JSON.stringify({
        filtros: {
          id: payload.id,
          nome: payload.nome,
          categoria: payload.categoria,
          status: payload.status,
        },
        deletarTodos: false,
      }),
    });
    if (!response.ok) throw new Error("Erro ao excluir template");
  },

  // POST /api/whatsapp/conversations/:id/archive - Arquivar conversa
  async archiveConversation(contatoId: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/whatsapp/conversations/${contatoId}/archive`, { method: "POST" });
    if (!response.ok) throw new Error("Erro ao arquivar conversa");
  },

  // POST /v1/mark/as/read/message - Marcar mensagens como lidas
  async markAsRead(telefone: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/v1/mark/as/read/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json", orchestrator: "crm-hatanaka" },
      body: JSON.stringify({ telefone }),
    });
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

  // POST /v1/create/contact - Criar contato
  async createContact(payload: { nome: string; telefone: string; corretor_responsavel: string }): Promise<unknown> {
    const response = await fetch(`${BASE_URL}/v1/create/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Erro ao criar contato");
    return ;
  },

  // MOCK - Verifica se o número possui WhatsApp.
  // TODO: substituir pela chamada real quando o endpoint estiver disponível.
  async checkNumberExists(telefone: string): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 600));
    const digits = telefone.replace(/\D/g, "");
    // Regras simuladas: válido se tiver 12-13 dígitos e não terminar em "0000"
    if (digits.length < 12 || digits.length > 13) return false;
    if (digits.endsWith("0000")) return false;
    return true;
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
