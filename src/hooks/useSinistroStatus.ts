import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sinistroStatusService, type SinistroStatus } from "@/services/sinistroStatusService";

const STATUS_KEY = ["sinistro-statuses"];

export function useSinistroStatuses() {
  return useQuery({
    queryKey: STATUS_KEY,
    queryFn: () => sinistroStatusService.getStatuses(),
  });
}

export function useCreateSinistroStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<SinistroStatus, "id">) => sinistroStatusService.createStatus(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: STATUS_KEY }),
  });
}

export function useUpdateSinistroStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SinistroStatus> }) => sinistroStatusService.updateStatus(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: STATUS_KEY }),
  });
}

export function useDeleteSinistroStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sinistroStatusService.deleteStatus(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: STATUS_KEY }),
  });
}
