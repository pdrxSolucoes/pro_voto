import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

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
      // Buscar votação com votos
      const { data: votacao, error: fetchError } = await supabase
        .from("votacoes")
        .select(`*, votos(*)`)
        .eq("id", votacaoId)
        .single();

      if (fetchError) throw fetchError;

      const votosFavor = votacao.votos.filter((v: any) => v.voto === "aprovar").length;
      const votosContra = votacao.votos.filter((v: any) => v.voto === "desaprovar").length;
      const abstencoes = votacao.votos.length - votosFavor - votosContra;
      const resultado = votosFavor > votosContra ? "aprovada" : "reprovada";

      // Finalizar votação
      const { error: updateError } = await supabase
        .from("votacoes")
        .update({
          resultado,
          data_fim: new Date().toISOString(),
          votos_favor: votosFavor,
          votos_contra: votosContra,
          abstencoes
        })
        .eq("id", votacaoId);

      if (updateError) throw updateError;

      const result = { 
        success: true, 
        votacaoId, 
        resultado, 
        votosFavor, 
        votosContra, 
        abstencoes 
      };
      
      setSuccess(true);
      setResultado(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || "Erro ao finalizar votação";
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
