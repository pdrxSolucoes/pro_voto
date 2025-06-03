import { useState } from "react";
import { api } from "@/lib/api";

/**
 * Hook para finalizar manualmente uma votação
 */
export function useFinalizarVotacao() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resultado, setResultado] = useState<any>(null);

  /**
   * Finaliza manualmente uma votação
   * @param votacaoId ID da votação a ser finalizada
   */
  const finalizarVotacao = async (votacaoId: number) => {
    if (!votacaoId) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await api.post(
        `votacoes/${votacaoId}/trigger-finalizacao`
      );

      if (response.data.success) {
        setSuccess(true);
        setResultado(response.data);
        return response.data;
      } else {
        throw new Error(response.data.error || "Erro ao finalizar votação");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || err.message || "Erro ao finalizar votação";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    finalizarVotacao,
    loading,
    error,
    success,
    resultado,
    reset: () => {
      setError(null);
      setSuccess(false);
      setResultado(null);
    },
  };
}
