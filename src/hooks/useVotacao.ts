import { useState, useEffect } from "react";
import axios from "axios";
import { api } from "@/lib/api";

export interface Vereador {
  id: number;
  nome: string;
  voto: "aprovar" | "desaprovar" | "abster" | null;
  data_voto: string | null;
}

export interface Projeto {
  id: number;
  titulo: string;
  descricao: string;
  status: string;
}

export interface ResultadoVotacao {
  id: number;
  projeto: Projeto;
  data_inicio: string | null;
  data_fim: string | null;
  resultado: "em_andamento" | "aprovada" | "reprovada";
  votosFavor: number;
  votosContra: number;
  abstencoes: number;
  vereadores: Vereador[];
  total_vereadores: number;
  total_votos: number;
}

export interface UltimoVoto {
  vereador: string;
  voto: string;
  data: string;
}

export function useResultadoVotacao(votacaoId: number) {
  const [resultado, setResultado] = useState<ResultadoVotacao | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [ultimoVoto, setUltimoVoto] = useState<UltimoVoto | null>(null);

  const fetchResultados = async () => {
    // Validação mais robusta do ID
    const id = Number(votacaoId);
    if (isNaN(id) || id <= 0) {
      console.log(`❌ ID inválido: ${votacaoId} (convertido: ${id})`);
      return;
    }

    try {
      setLoading(true);
      setError(null); // Limpar erro anterior
      console.log(`🔍 Buscando resultado da votação ${id}`);

      const response = await axios.get(`/api/votacoes/${id}/resultado`);

      console.log("📊 Resposta da API:", response.data);

      // Verificar se a resposta tem a estrutura esperada
      if (!response.data) {
        throw new Error("Resposta da API está vazia");
      }

      if (!response.data.success) {
        throw new Error(response.data.error || "Erro na API");
      }

      if (!response.data.resultado) {
        throw new Error("Dados do resultado não encontrados na resposta");
      }

      const dadosResultado = response.data.resultado;
      const dadosUltimoVoto = response.data.ultimo_voto || null;

      console.log("✅ Dados processados:", {
        resultado: dadosResultado,
        ultimo_voto: dadosUltimoVoto,
      });

      setResultado(dadosResultado);
      setUltimoVoto(dadosUltimoVoto);
      setError(null);
    } catch (err) {
      console.error("❌ Erro ao buscar resultado da votação:", err);

      // Tratamento de erro mais específico
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          setError(new Error("Votação não encontrada"));
        } else if (err.response?.status === 401) {
          setError(new Error("Não autorizado - faça login novamente"));
        } else {
          setError(
            new Error(
              err.response?.data?.error || "Erro na comunicação com o servidor"
            )
          );
        }
      } else if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error("Erro desconhecido"));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log(
      `🔄 useEffect executado com votacaoId: ${votacaoId} (tipo: ${typeof votacaoId})`
    );

    // Conversão e validação mais robusta
    const id = Number(votacaoId);

    // Resetar estados quando o ID mudar ou for inválido
    if (isNaN(id) || id <= 0) {
      console.log(`❌ ID inválido no useEffect: ${votacaoId} -> ${id}`);
      // setError(new Error(`ID de votação inválido: ${votacaoId}`));
      setLoading(false);
      setResultado(null);
      setUltimoVoto(null);
      return;
    }

    console.log(`✅ ID válido, iniciando busca: ${id}`);

    // Limpar estados antes de buscar novos dados
    setError(null);
    setLoading(true);

    // Buscar dados inicialmente
    let isMounted = true;
    const fetchData = async () => {
      if (isMounted) {
        await fetchResultados();
      }
    };

    fetchData();

    // Configurar intervalo para atualizações automáticas (a cada 3 segundos)
    const intervalId = setInterval(() => {
      if (isMounted) {
        fetchResultados();
      }
    }, 3000);

    // Limpar intervalo quando o componente for desmontado ou o ID mudar
    return () => {
      console.log(`🧹 Limpando interval para votação ${id}`);
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [votacaoId]); // Dependência apenas do votacaoId

  return {
    resultado,
    loading,
    error,
    ultimoVoto,
    refresh: fetchResultados, // Função para atualizar manualmente
  };
}

// Hook para registrar voto
export function useRegistrarVoto() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const registrarVoto = async (
    votacaoId: number,
    vereadorId: number,
    voto: "aprovar" | "desaprovar" | "abster"
  ) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      console.log(`🗳️ Registrando voto:`, { votacaoId, vereadorId, voto });
      const response = await api.post(`votacoes/${votacaoId}/votar`, {
        vereadorId,
        voto,
      });

      console.log("✅ Voto registrado com sucesso:", response.data);

      if (!response.data.success) {
        throw new Error(response.data.error || "Erro ao registrar voto");
      }

      setSuccess(true);
      return true;
    } catch (err) {
      console.error("❌ Erro ao registrar voto:", err);

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 400) {
          setError(new Error(err.response.data?.error || "Dados inválidos"));
        } else if (err.response?.status === 401) {
          setError(new Error("Não autorizado - faça login novamente"));
        } else if (err.response?.status === 409) {
          setError(new Error("Você já votou nesta votação"));
        } else {
          setError(
            new Error(err.response?.data?.error || "Erro ao registrar voto")
          );
        }
        return false;
      } else if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error("Erro desconhecido ao registrar voto"));
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    registrarVoto,
    loading,
    error,
    success,
    clearError: () => setError(null),
    clearSuccess: () => setSuccess(false),
  };
}
