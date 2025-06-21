import { supabase } from "@/lib/supabaseClient";
import { Projeto } from "./projetoService";

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
    const { data: projetos, error } = await supabase
      .from("projetos")
      .select("*");

    if (error) throw error;

    // Buscar informações de votação para projetos em votação
    const votacoesAtivas = await Promise.all(
      (projetos || [])
        .filter((p: Projeto) => p.status === "em_votacao")
        .map(async (p: Projeto) => {
          try {
            // Buscar contagem de votos
            const { count: votosRegistrados } = await supabase
              .from("votos")
              .select("*", { count: "exact", head: true })
              .eq("projeto_id", p.id);

            // Buscar total de vereadores
            const { count: totalVereadores } = await supabase
              .from("usuarios")
              .select("*", { count: "exact", head: true })
              .eq("cargo", "vereador")
              .eq("ativo", true);

            return {
              id: p.id,
              projetoTitulo: p.titulo,
              dataInicio: p.data_apresentacao,
              votosRegistrados: votosRegistrados || 0,
              totalVereadores: totalVereadores || 12,
            };
          } catch (error) {
            console.error(`Erro ao buscar detalhes da votação ${p.id}:`, error);
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
      projetosPendentes: (projetos || []).filter(
        (p: Projeto) => p.status === "pendente"
      ).length,
      projetosAprovadas: (projetos || []).filter(
        (p: Projeto) => p.status === "aprovada"
      ).length,
      projetosReprovadas: (projetos || []).filter(
        (p: Projeto) => p.status === "reprovada"
      ).length,
      votacoesAtivas,
    };
  },
};
