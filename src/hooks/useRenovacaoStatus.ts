import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { renovacaoStatusService, type RenovacaoStatus } from "@/services/renovacaoStatusService";

const STATUS_KEY = ["renovacao-statuses"];

export function useRenovacaoStatuses() {
  return useQuery({
    queryKey: STATUS_KEY,
    queryFn: () => renovacaoStatusService.getStatuses(),
  });
}

export function useCreateRenovacaoStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<RenovacaoStatus, "id">) => renovacaoStatusService.createStatus(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: STATUS_KEY }),
  });
}

export function useUpdateRenovacaoStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RenovacaoStatus> }) => renovacaoStatusService.updateStatus(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: STATUS_KEY }),
  });
}

export function useDeleteRenovacaoStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => renovacaoStatusService.deleteStatus(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: STATUS_KEY }),
  });
}
