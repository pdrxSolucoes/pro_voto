// src/services/votacaoService.ts
import { supabase } from "./supabase";
import type { VotacaoInterface } from "@/interfaces/VotacaoService";
import type { VotoInterface } from "@/interfaces/VotoInterface";
import type { VotacaoAtiva } from "@/types/models";

export interface ResultadoVotacao {
  total_votos: number;
  total_vereadores: number;
  votos_sim: number;
  votos_nao: number;
  abstencoes: number;
  aprovada: boolean;
}

export const votacaoService = {
  async getVotacoesAtivas(): Promise<VotacaoAtiva[]> {
    const { data, error } = await supabase
      .from("votacoes")
      .select("*, projetos(*)")
      .eq("resultado", "em_andamento");
    if (error) throw error;
    return data || [];
  },

  async checkVotacao(): Promise<{ emAndamento: boolean; votacaoId?: number }> {
    const { data, error } = await supabase
      .from("votacoes")
      .select("id")
      .eq("resultado", "em_andamento")
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return {
      emAndamento: !!data,
      votacaoId: data?.id,
    };
  },

  async getResultadoVotacao(id: number): Promise<ResultadoVotacao> {
    const { data, error } = await supabase
      .from("votacoes")
      .select("votos_favor, votos_contra, abstencoes")
      .eq("id", id)
      .single();

    if (error) throw error;

    const total_votos = data.votos_favor + data.votos_contra + data.abstencoes;
    const { count: total_vereadores } = await supabase
      .from("usuarios")
      .select("*", { count: "exact", head: true })
      .eq("cargo", "vereador")
      .eq("ativo", true);

    return {
      total_votos,
      total_vereadores: total_vereadores || 0,
      votos_sim: data.votos_favor,
      votos_nao: data.votos_contra,
      abstencoes: data.abstencoes,
      aprovada: data.votos_favor > data.votos_contra,
    };
  },

  async iniciarVotacao(projetoId: number): Promise<any> {
    const { data, error } = await supabase
      .from("votacoes")
      .insert({
        projeto_id: projetoId,
        data_inicio: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async finalizarVotacao(votacaoId: number): Promise<any> {
    const { data, error } = await supabase
      .from("votacoes")
      .update({
        data_fim: new Date().toISOString(),
        resultado: "aprovada", // ou "reprovada" baseado na lógica
      })
      .eq("id", votacaoId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async registrarVoto(
    votacaoId: number,
    voto: "aprovar" | "desaprovar" | "abster"
  ): Promise<VotoInterface> {
    const { data, error } = await supabase
      .from("votos")
      .insert({
        votacao_id: votacaoId,
        vereador_id: 1, // Pegar do contexto de auth
        voto,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getVotos(votacaoId: number): Promise<VotoInterface[]> {
    const { data, error } = await supabase
      .from("votos")
      .select("*, usuarios(nome)")
      .eq("votacao_id", votacaoId);
    if (error) throw error;
    return data || [];
  },

  async criarVotacao(projetoId: number): Promise<any> {
    const { data, error } = await supabase
      .from("votacoes")
      .insert({
        projeto_id: projetoId,
        data_inicio: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
