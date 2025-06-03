import api from "@/services/api";
import { useState } from "react";

/**
 * Hook para verificar o status de votações que atingiram 12 votos
 * Útil para componentes que precisam atualizar o status de votações
 */
export function useCheckVotacaoStatus() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  /**
   * Verifica se há votações com 12 votos que precisam ser finalizadas
   */
  const checkVotacaoStatus = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get("votacoes/check-status");
      setResult(response.data);
      return response.data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || "Erro ao verificar status das votações";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    checkVotacaoStatus,
    isLoading,
    error,
    result,
  };
}
