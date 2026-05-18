import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { whatsappService, type ConversationFilters, type SendMessagePayload } from "@/services/whatsappService";

export function useWhatsAppConversations(name?: string) {
  return useQuery({
    queryKey: ["whatsapp", "conversations", name],
    queryFn: () => whatsappService.getConversations(name),
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

export function useWhatsAppMessages(contatoId: string | null, consultantId: string) {
  return useQuery({
    queryKey: ["whatsapp-messages", contatoId, consultantId],
    queryFn: () => whatsappService.getMessages(contatoId!, consultantId),
    enabled: !!contatoId,

    // 👇 AQUI ESTÁ A MÁGICA
    refetchInterval: contatoId ? 5000 : false, // 10 segundos
    refetchIntervalInBackground: true,

    // evita reload da tela
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

export function useWhatsAppTemplates(filters?: { categoria?: string; status?: string }) {
  return useQuery({
    queryKey: ["whatsapp", "templates", filters],
    queryFn: () => whatsappService.getTemplates(filters),
  });
}

export function useCreateWhatsAppTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<import("@/services/whatsappService").WhatsAppTemplate, "id">) =>
      whatsappService.createTemplate(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp", "templates"] }),
  });
}

export function useUpdateWhatsAppTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: import("@/services/whatsappService").WhatsAppTemplate) =>
      whatsappService.updateTemplate(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp", "templates"] }),
  });
}

export function useDeleteWhatsAppTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: import("@/services/whatsappService").WhatsAppTemplate) =>
      whatsappService.deleteTemplate(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp", "templates"] }),
  });
}

export function useWhatsAppStatus() {
  return useQuery({
    queryKey: ["whatsapp", "status"],
    queryFn: () => whatsappService.getConnectionStatus(),
    refetchInterval: 30000,
  });
}

export function useSendWhatsAppMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendMessagePayload) => whatsappService.sendMessage(payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["whatsapp", "messages", vars.chatId] });
      qc.invalidateQueries({ queryKey: ["whatsapp", "conversations"] });
    },
  });
}

export function useSendWhatsAppMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { userId: string; chatId: string; tipo: "image" | "document" | "audio"; file: File; caption?: string; instanceId?: string }) =>
      whatsappService.sendMedia(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["whatsapp", "messages"] });
      qc.invalidateQueries({ queryKey: ["whatsapp", "conversations"] });
    },
  });
}

export function useSendBulkWhatsAppMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ contatoIds, ...payload }: { contatoIds: string[] } & Omit<SendMessagePayload, "contato_id">) =>
      whatsappService.sendBulkMessage(contatoIds, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp"] }),
  });
}

export function useArchiveConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (contatoId: string) => whatsappService.archiveConversation(contatoId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp", "conversations"] }),
  });
}

export function useMarkAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (contatoId: string) => whatsappService.markAsRead(contatoId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp", "conversations"] }),
  });
}

export function useLinkToLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ contatoId, leadId }: { contatoId: string; leadId: string }) =>
      whatsappService.linkToLead(contatoId, leadId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp", "conversations"] }),
  });
}
