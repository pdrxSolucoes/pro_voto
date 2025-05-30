// src/services/votacaoService.ts
import type { VotacaoInterface } from "@/interfaces/VotacaoService";
import api from "./api";
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
    const { data } = await api.get("/votacoes/ativas");
    return data.votacoes;
  },

  async checkVotacao(): Promise<{ emAndamento: boolean; votacaoId?: number }> {
    const { data } = await api.get("/votacoes/check");
    return data;
  },

  async getResultadoVotacao(id: number): Promise<ResultadoVotacao> {
    const { data } = await api.get(`/votacoes/${id}/resultado`);
    return data.resultado;
  },

  async iniciarVotacao(projetoId: number): Promise<VotoInterface> {
    const { data } = await api.post(`/projetos/${projetoId}/iniciar-votacao`);
    return data.votacao;
  },

  async finalizarVotacao(votacaoId: number): Promise<VotoInterface> {
    const { data } = await api.post(`/votacoes/${votacaoId}/finalizar`);
    return data.votacao;
  },

  async registrarVoto(
    votacaoId: number,
    voto: "aprovar" | "desaprovar" | "abster"
  ): Promise<VotoInterface> {
    const { data } = await api.post(`/votacoes/${votacaoId}/votar`, { voto });
    return data.voto;
  },

  async getVotos(votacaoId: number): Promise<VotoInterface[]> {
    const { data } = await api.get(`/votacoes/${votacaoId}/votos`);
    return data.votos;
  },

  async criarVotacao(projetoId: number): Promise<VotoInterface> {
    const { data } = await api.post("/votacoes", { projeto_id: projetoId });
    return data.votacao;
  },
};
