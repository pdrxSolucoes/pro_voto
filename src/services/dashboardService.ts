// src/services/dashboardService.ts
import api from "./api";
import { Projeto } from "./projetoService"; // Import do tipo

export interface VotacaoAtiva {
  id: number;
  projetoTitulo: string;
  dataInicio: string;
  votosRegistrados: number;
  totalVereadores: number;
}

export interface HomeContent {
  projetosPendentes: number;
  projetosAprovadas: number;
  projetosReprovadas: number;
  votacoesAtivas: VotacaoAtiva[];
}

export const dashboardService = {
  async getDashboardData(): Promise<HomeContent> {
    const { data } = await api.get("/projetos");
    const projetos: Projeto[] = data.data;

    return {
      projetosPendentes: projetos.filter(
        (p: Projeto) => p.status === "pendente"
      ).length,
      projetosAprovadas: projetos.filter(
        (p: Projeto) => p.status === "aprovada"
      ).length,
      projetosReprovadas: projetos.filter(
        (p: Projeto) => p.status === "reprovada"
      ).length,
      votacoesAtivas: projetos
        .filter((p: Projeto) => p.status === "em_votacao")
        .map((p: Projeto) => ({
          id: p.id,
          projetoTitulo: p.titulo,
          dataInicio: p.data_apresentacao,
          votosRegistrados: 0,
          totalVereadores: 9,
        })),
    };
  },
};
