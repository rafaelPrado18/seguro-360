import { useQuery } from "@tanstack/react-query";
import { apolicesService, type ApoliceFormatted } from "@/services/apolicesService";

export function useApolices() {
  return useQuery<ApoliceFormatted[]>({
    queryKey: ["apolices"],
    queryFn: () => apolicesService.getAll(),
    refetchInterval: 30000,
  });
}
