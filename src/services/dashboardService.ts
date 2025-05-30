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
    // Buscar todos os projetos
    const { data: projetosData } = await api.get("/projetos");
    const projetos: Projeto[] = projetosData.data;
    
    // Buscar informações de votação para projetos em votação
    const votacoesAtivas = await Promise.all(
      projetos
        .filter((p: Projeto) => p.status === "em_votacao")
        .map(async (p: Projeto) => {
          try {
            // Buscar detalhes da votação para obter contagem de votos
            const { data: votacaoData } = await api.get(`/votacoes/${p.id}/resultado`);
            const votosRegistrados = votacaoData.resultado?.total_votos || 0;
            const totalVereadores = votacaoData.resultado?.total_vereadores || 12;
            
            return {
              id: p.id,
              projetoTitulo: p.titulo,
              dataInicio: p.data_apresentacao,
              votosRegistrados,
              totalVereadores,
            };
          } catch (error) {
            console.error(`Erro ao buscar detalhes da votação ${p.id}:`, error);
            // Retornar objeto com valores padrão em caso de erro
            return {
              id: p.id,
              projetoTitulo: p.titulo,
              dataInicio: p.data_apresentacao,
              votosRegistrados: 0,
              totalVereadores: 12,
            };
          }
        })
    );

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
      votacoesAtivas,
    };
  },
};