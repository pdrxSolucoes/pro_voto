import { useState, useCallback } from "react";
import { useRealTimeData } from "./useRealTime";

// Types
export type Vereador = {
  id: number;
  nome: string;
  voto: "aprovar" | "desaprovar" | "abster" | null;
};

export type ResultadoVotacao = {
  id: number;
  emenda: {
    id: number;
    titulo: string;
    descricao: string;
    status: string;
  };
  data_inicio: string;
  data_fim: string | null;
  resultado: string | null;
  votosFavor: number;
  votosContra: number;
  abstencoes: number;
  vereadores: Vereador[];
  total_vereadores: number;
  total_votos: number;
};

// Hook to fetch votação results
export function useResultadoVotacao(votacaoId: number) {
  const [ultimoVoto, setUltimoVoto] = useState<{
    vereador: string;
    voto: string;
  } | null>(null);

  // Function to fetch resultado da votação
  const fetchResultado = useCallback(async () => {
    try {
      const response = await fetch(`/api/votacoes/${votacaoId}/resultado`);

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();

      // Check if there's a new vote
      if (data.ultimo_voto) {
        setUltimoVoto(data.ultimo_voto);
      }

      return data.resultado as ResultadoVotacao;
    } catch (error) {
      console.error("Error fetching votação result:", error);
      throw error;
    }
  }, [votacaoId]);

  // Use the real-time data hook for auto-updates
  const {
    data: resultado,
    loading,
    error,
    refresh,
  } = useRealTimeData<ResultadoVotacao>(fetchResultado, 3000);

  return { resultado, loading, error, refresh, ultimoVoto };
}

// Hook to register a vote
export function useRegistrarVoto() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);

  const registrarVoto = useCallback(
    async (
      votacaoId: number,
      vereadorId: number,
      voto: "aprovar" | "desaprovar" | "abster"
    ) => {
      setLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const response = await fetch(`/api/votacoes/${votacaoId}/votar`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vereador_id: vereadorId,
            voto,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error ${response.status}`);
        }

        setSuccess(true);
        return await response.json();
      } catch (error) {
        console.error("Error registering vote:", error);
        setError(error instanceof Error ? error : new Error(String(error)));
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { registrarVoto, loading, error, success };
}

// Hook for starting a new voting session
export function useIniciarVotacao() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);

  const iniciarVotacao = useCallback(async (emendaId: number) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/emendas/${emendaId}/iniciar-votacao`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      setSuccess(true);
      return await response.json();
    } catch (error) {
      console.error("Error starting votação:", error);
      setError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { iniciarVotacao, loading, error, success };
}

// Hook for finalizing a voting session
export function useFinalizarVotacao() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);

  const finalizarVotacao = useCallback(async (votacaoId: number) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/votacoes/${votacaoId}/finalizar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      setSuccess(true);
      return await response.json();
    } catch (error) {
      console.error("Error finalizing votação:", error);
      setError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { finalizarVotacao, loading, error, success };
}
