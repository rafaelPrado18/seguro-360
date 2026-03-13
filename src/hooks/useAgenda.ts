import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { agendaService, Tarefa } from "@/services/agendaService";

export function useAgenda() {
  const queryClient = useQueryClient();

  const { data: tarefas = [], isLoading, error } = useQuery<Tarefa[]>({
    queryKey: ["agenda"],
    queryFn: agendaService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<Tarefa, "id" | "id_usuario">) => agendaService.create(data as Omit<Tarefa, "id">),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["agenda"] }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Tarefa> & { id: string }) => agendaService.update(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["agenda"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => agendaService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["agenda"] }),
  });

  return {
    tarefas,
    isLoading,
    error,
    createTarefa: createMutation.mutateAsync,
    updateTarefa: updateMutation.mutateAsync,
    deleteTarefa: deleteMutation.mutateAsync,
  };
}
