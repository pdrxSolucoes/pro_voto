import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

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

      const { data, error } = await supabase
        .from("votos")
        .insert({
          votacao_id: votacaoId,
          usuario_id: vereadorId,
          voto
        })
        .select()
        .single();

      if (error) throw error;
      console.log("✅ Voto registrado:", data);

      setSuccess(true);
      console.log("✅ Voto registrado com sucesso");
      return true;
    } catch (err) {
      console.error("❌ Erro ao registrar voto:", err);

      if (err instanceof Error) {
        if (err.message.includes('duplicate')) {
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
