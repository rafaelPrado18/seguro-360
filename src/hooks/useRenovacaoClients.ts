import { useQuery } from "@tanstack/react-query";
import { renovacaoClientService } from "@/services/renovacaoClientService";

const KEY = ["renovacao-clients"];

export function useRenovacaoClients() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => renovacaoClientService.getAll(),
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
    retry: 1,
  });
}

export function useRenovacaoClientById(id: string | undefined) {
  return useQuery({
    queryKey: ["renovacao-client", id],
    queryFn: () => renovacaoClientService.getById(id!),
    enabled: !!id,
    retry: 1,
  });
}

export function useRenovacaoClientsByApolice(apoliceId: string | undefined) {
  return useQuery({
    queryKey: ["renovacao-clients-apolice", apoliceId],
    queryFn: () => renovacaoClientService.getByApoliceId(apoliceId!),
    enabled: !!apoliceId,
    retry: 1,
  });
}
