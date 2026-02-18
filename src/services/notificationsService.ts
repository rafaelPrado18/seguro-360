const BASE_URL = "http://173.249.50.11:8000";

function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : "";
}

function getAuthHeaders(): HeadersInit {
  const token = getCookie("userToken");
  return {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export interface NotificationEvent {
  id: string;
  type: "mensagens_novas" | "leads_novos";
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  leadId?: string;
  contatoId?: string;
}

export const notificationsService = {
  async getEvents(userId: string): Promise<NotificationEvent[]> {
    const response = await fetch(`${BASE_URL}/v1/read/events?userId=${userId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erro ao buscar eventos");
    return response.json();
  },

  async markAsRead(eventId: string): Promise<void> {
    console.log(eventId)
    const response = await fetch(`${BASE_URL}/v1/read/event`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ eventId }),
    });
    if (!response.ok) throw new Error("Erro ao marcar evento como lido");
  },

  async markAllAsRead(userId: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/v1/read/events`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error("Erro ao marcar todos eventos como lidos");
  },
};

