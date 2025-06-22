import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

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

      const { data: votacao, error } = await supabase
        .from("votacoes")
        .select(
          `
          *,
          projetos(*),
          votos(*, usuarios(nome))
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      if (!votacao) throw new Error("Votação não encontrada");

      const votos = votacao.votos || [];
      const votosFavor = votos.filter((v: any) => v.voto === "aprovar").length;
      const votosContra = votos.filter(
        (v: any) => v.voto === "desaprovar"
      ).length;
      const abstencoes = votos.filter((v: any) => v.voto === "abster").length;

      const dadosResultado = {
        id: votacao.id,
        projeto: votacao.projetos,
        data_inicio: votacao.data_inicio,
        data_fim: votacao.data_fim,
        resultado: votacao.resultado,
        votosFavor,
        votosContra,
        abstencoes,
        vereadores: votos.map((v: any) => ({
          id: v.usuarios.id,
          nome: v.usuarios.nome,
          voto: v.voto,
          data_voto: v.created_at,
        })),
        total_vereadores: 12,
        total_votos: votos.length,
      };

      const dadosUltimoVoto =
        votos.length > 0
          ? {
              vereador: votos[votos.length - 1].usuarios.nome,
              voto: votos[votos.length - 1].voto,
              data: votos[votos.length - 1].created_at,
            }
          : null;

      console.log("✅ Dados processados:", {
        resultado: dadosResultado,
        ultimo_voto: dadosUltimoVoto,
      });

      setResultado(dadosResultado);
      setUltimoVoto(dadosUltimoVoto);
      setError(null);
    } catch (err) {
      console.error("❌ Erro ao buscar resultado da votação:", err);

      if (err instanceof Error) {
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

      const { data, error } = await supabase
        .from("votos")
        .insert({
          votacao_id: votacaoId,
          usuario_id: vereadorId,
          voto,
        })
        .select()
        .single();

      if (error) throw error;
      console.log("✅ Voto registrado com sucesso:", data);

      setSuccess(true);
      return true;
    } catch (err) {
      console.error("❌ Erro ao registrar voto:", err);

      if (err instanceof Error) {
        if (err.message.includes("duplicate")) {
          setError(new Error("Você já votou nesta votação"));
        } else {
          setError(err);
        }
      } else {
        setError(new Error("Erro desconhecido ao registrar voto"));
      }
      return false;
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
