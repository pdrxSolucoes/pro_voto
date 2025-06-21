import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";

/**
 * Hook para monitorar e finalizar automaticamente votações que atingiram 12 votos
 * @param votacaoId - ID da votação a ser monitorada (opcional)
 * @param intervalo - Intervalo em milissegundos para verificar (padrão: 10000ms)
 */
export function useAutoFinalizarVotacao(votacaoId?: number, intervalo = 10000) {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Inicia o monitoramento
  const iniciarMonitoramento = () => {
    setIsMonitoring(true);
  };

  // Para o monitoramento
  const pararMonitoramento = () => {
    setIsMonitoring(false);
  };

  // Verifica se há votações com 12 votos que precisam ser finalizadas
  const verificarVotacoes = async () => {
    try {
      if (votacaoId) {
        const { data: votacao, error } = await supabase
          .from("votacoes")
          .select(`*, votos(*)`)
          .eq("id", votacaoId)
          .single();

        if (error) throw error;

        if (votacao.votos.length >= 12 && votacao.resultado === "em_andamento") {
          // Finalizar votação
          const votosFavor = votacao.votos.filter((v: any) => v.voto === "aprovar").length;
          const votosContra = votacao.votos.filter((v: any) => v.voto === "desaprovar").length;
          const resultado = votosFavor > votosContra ? "aprovada" : "reprovada";

          await supabase
            .from("votacoes")
            .update({ 
              resultado,
              data_fim: new Date().toISOString(),
              votos_favor: votosFavor,
              votos_contra: votosContra,
              abstencoes: votacao.votos.length - votosFavor - votosContra
            })
            .eq("id", votacaoId);

          const result = { success: true, votacaoFinalizada: votacaoId, resultado };
          setLastResult(result);
          return result;
        }
        return null;
      } else {
        const { data: votacoes, error } = await supabase
          .from("votacoes")
          .select(`*, votos(*)`)
          .eq("resultado", "em_andamento");

        if (error) throw error;

        const result = { success: true, votacoesVerificadas: votacoes?.length || 0 };
        setLastResult(result);
        return result;
      }
    } catch (err: any) {
      const errorMessage = err.message || "Erro ao verificar votações";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Efeito para monitorar periodicamente
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isMonitoring) {
      // Verifica imediatamente ao iniciar
      verificarVotacoes();

      // Configura o intervalo para verificações periódicas
      intervalId = setInterval(verificarVotacoes, intervalo);
    }

    // Limpa o intervalo quando o componente é desmontado ou o monitoramento é parado
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isMonitoring, votacaoId, intervalo]);

  return {
    iniciarMonitoramento,
    pararMonitoramento,
    verificarVotacoes,
    isMonitoring,
    lastResult,
    error,
  };
}
