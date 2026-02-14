import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { agentsService, type Agent } from "@/services/agentsService";

const AGENTS_KEY = ["agents"];

export function useAgents() {
  return useQuery({
    queryKey: AGENTS_KEY,
    queryFn: () => agentsService.getAgents(),
  });
}

export function useCreateAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Agent, "agentId">) => agentsService.createAgent(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: AGENTS_KEY }),
  });
}

export function useUpdateAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Agent> }) => agentsService.updateAgent(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: AGENTS_KEY }),
  });
}

export function useDeleteAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => agentsService.deleteAgent(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: AGENTS_KEY }),
  });
}
