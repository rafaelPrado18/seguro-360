import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { statusService, type LeadStatus } from "@/services/statusService";

const STATUS_KEY = ["lead-statuses"];

export function useLeadStatuses() {
  return useQuery({
    queryKey: STATUS_KEY,
    queryFn: () => statusService.getLeadStatuses(),
  });
}

export function useCreateLeadStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<LeadStatus, "id">) => statusService.createLeadStatus(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: STATUS_KEY }),
  });
}

export function useUpdateLeadStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LeadStatus> }) => statusService.updateLeadStatus(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: STATUS_KEY }),
  });
}

export function useDeleteLeadStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => statusService.deleteLeadStatus(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: STATUS_KEY }),
  });
}
