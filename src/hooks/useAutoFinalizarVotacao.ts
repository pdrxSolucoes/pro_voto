import api from "@/services/api";
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
      // Se um ID específico foi fornecido, verifica apenas essa votação
      if (votacaoId) {
        const response = await api.get(`votacoes/${votacaoId}/resultado`);
        const votacao = response.data.resultado;

        // Se a votação tem exatamente 12 votos e ainda está em andamento
        if (
          votacao.total_votos === 12 &&
          votacao.resultado === "em_andamento"
        ) {
          // Chama o endpoint para finalizar a votação
          const finalizacaoResponse = await api.get("votacoes/check-status");
          setLastResult(finalizacaoResponse.data);
          return finalizacaoResponse.data;
        }

        return null;
      } else {
        // Verifica todas as votações em andamento
        const response = await api.get("votacoes/check-status");
        setLastResult(response.data);
        return response.data;
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || "Erro ao verificar votações";
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
