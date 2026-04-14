import { useState, useEffect, useCallback } from "react";
import { comissoesService, type ComissoesResponse } from "@/services/comissoesService";

export function useComissoes() {
  const [data, setData] = useState<ComissoesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtroResponsavel, setFiltroResponsavel] = useState<string>("");

  const fetchData = useCallback(async (responsavel?: string) => {
    setLoading(true);
    try {
      const result = await comissoesService.getComissoes(responsavel || undefined);
      setData(result);
    } catch (err) {
      console.error("Erro ao buscar comissões:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(filtroResponsavel);
  }, [filtroResponsavel, fetchData]);

  return { data, loading, filtroResponsavel, setFiltroResponsavel, refetch: () => fetchData(filtroResponsavel) };
}
