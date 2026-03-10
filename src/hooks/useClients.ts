import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientService, type ClientCreatePayload, type ClientUpdatePayload } from "@/services/clientService";

export function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: () => clientService.getClients(),
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
    retry: 1,
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ClientCreatePayload) => clientService.createClient(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ClientCreatePayload> }) =>
      clientService.updateClient(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientService.deleteClient(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });
}
