import { supabase } from "@/lib/supabaseClient";
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
      const { data: votacoes, error } = await supabase
        .from("votacoes")
        .select(
          `
          *,
          votos(*)
        `
        )
        .eq("resultado", "em_andamento");

      if (error) throw error;

      const votacoesParaFinalizar = (votacoes || []).filter(
        (v: any) => v.votos.length >= 12
      );

      const result = {
        success: true,
        votacoesParaFinalizar: votacoesParaFinalizar.length,
        votacoes: votacoesParaFinalizar,
      };

      setResult(result);
      return result;
    } catch (err: any) {
      const errorMessage =
        err.message || "Erro ao verificar status das votações";
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
