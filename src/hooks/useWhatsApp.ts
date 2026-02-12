import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { whatsappService, type ConversationFilters, type SendMessagePayload } from "@/services/whatsappService";

export function useWhatsAppConversations(filters?: ConversationFilters) {
  return useQuery({
    queryKey: ["whatsapp", "conversations", filters],
    queryFn: () => whatsappService.getConversations(filters),
  });
}

export function useWhatsAppMessages(contatoId: string | null, page?: number) {
  return useQuery({
    queryKey: ["whatsapp", "messages", contatoId, page],
    queryFn: () => whatsappService.getMessages(contatoId!, page),
    enabled: !!contatoId,
  });
}

export function useWhatsAppTemplates() {
  return useQuery({
    queryKey: ["whatsapp", "templates"],
    queryFn: () => whatsappService.getTemplates(),
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
      qc.invalidateQueries({ queryKey: ["whatsapp", "messages", vars.contato_id] });
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
