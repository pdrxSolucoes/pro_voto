import { useState } from "react";
import axios from "axios";

// Hook para registrar voto
export function useRegistrarVoto() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const registrarVoto = async (
    votacaoId: number,
    vereadorId: number,
    voto: "aprovar" | "desaprovar" | "abster"
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      console.log(`🗳️ Registrando voto:`, { votacaoId, vereadorId, voto });

      const response = await axios.post(`/api/votacoes/${votacaoId}/votar`, {
        vereadorId,
        voto,
      });

      console.log("✅ Resposta do servidor:", response.data);

      if (!response.data || !response.data.success) {
        throw new Error(response.data?.error || "Erro ao registrar voto");
      }

      setSuccess(true);
      console.log("✅ Voto registrado com sucesso");
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
        } else if (err.response?.status === 404) {
          setError(new Error("Votação não encontrada"));
        } else {
          setError(
            new Error(err.response?.data?.error || "Erro ao registrar voto")
          );
        }
      } else if (err instanceof Error) {
        setError(err);
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
