import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leadsService, type LeadStatus } from "@/services/statusService";


export function useCreateLeadStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: LeadStatus) => leadsService.createLeadStatus(payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["whatsapp", "messages"] });
      qc.invalidateQueries({ queryKey: ["whatsapp", "conversations"] });
    },
  });
}
