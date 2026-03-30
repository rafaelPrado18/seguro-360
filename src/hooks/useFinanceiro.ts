import { useQuery } from "@tanstack/react-query";
import { financeiroService, type FinanceiroClient } from "@/services/financeiroService";

export function useFinanceiro() {
  return useQuery<FinanceiroClient[]>({
    queryKey: ["financeiro-clients"],
    queryFn: () => financeiroService.getAll(),
    staleTime: 30_000,
  });
}
