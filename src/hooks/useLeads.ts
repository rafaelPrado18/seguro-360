import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leadsService, type LeadFilters, type Lead, type LeadHistoryEntry } from "@/services/leadsService";

export function useLeads(filters?: LeadFilters, currentUser?: string, currentFunction?: string) {
  return useQuery({
    queryKey: ["leads", filters],
    queryFn: () => leadsService.getLeads(filters, currentUser, currentFunction),
    refetchInterval: 10000, // Poll every 10 seconds
    refetchIntervalInBackground: false,
    retry: 1,
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: ["leads", id],
    queryFn: () => leadsService.getLeadById(id),
    enabled: !!id,
  });
}

export function useLeadStats() {
  return useQuery({
    queryKey: ["leads", "stats"],
    queryFn: () => leadsService.getStats(),
  });
}

export function useLeadDistribution() {
  return useQuery({
    queryKey: ["leads", "distribution"],
    queryFn: () => leadsService.getDistribution(),
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof leadsService.createLead>[0]) => leadsService.createLead(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Lead> }) => leadsService.updateLead(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leadsService.deleteLead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
}

export function useAssignLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, corretorId }: { leadId: string; corretorId: string }) => leadsService.assignLead(leadId, corretorId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
}

export function useDistributeLeads() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ leadIds, strategy }: { leadIds: string[]; strategy: "round_robin" | "performance" | "manual" }) =>
      leadsService.distributeLeads(leadIds, strategy),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
}

export function useUpdateLeadStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, observacao }: { id: string; status: Lead["status"]; observacao?: string }) =>
      leadsService.updateStatus(id, status, observacao),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
}

export function useRedistributeLeads() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { startDate: string; startHour: string; corretorOrigem: string[]; corretoresDestino: string[] }) =>
      leadsService.redistributeLeads(params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
}

export function useLeadHistory(leadEmail: string | undefined) {
  return useQuery({
    queryKey: ["lead-history", leadEmail],
    queryFn: () => leadsService.getLeadHistory(leadEmail!),
    enabled: !!leadEmail,
    refetchInterval: 10000,
  });
}
