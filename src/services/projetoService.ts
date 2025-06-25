import type { VotacaoInterface } from "@/interfaces/VotacaoInterface";
import type { VotoInterface } from "@/interfaces/VotoInterface";
import { supabase } from "@/lib/supabaseClient";

export interface Projeto {
  id: number;
  titulo: string;
  descricao: string;
  data_apresentacao: string;
  status: "pendente" | "em_votacao" | "aprovada" | "reprovada";
  votacoes?: VotacaoInterface[];
}

export const projetoService = {
  async getProjetos(): Promise<Projeto[]> {
    const { data, error } = await supabase.from("projetos").select("*");
    if (error) throw error;
    return data || [];
  },

  async getProjetoById(id: number): Promise<Projeto> {
    const { data: projeto, error: projetoError } = await supabase
      .from("projetos")
      .select("*")
      .eq("id", id)
      .single();

    if (projetoError) throw projetoError;

    const { data: votacoes, error: votacoesError } = await supabase
      .from("votacoes")
      .select(
        `
        id,
        data_inicio,
        data_fim,
        data_criacao,
        data_atualizacao,
        resultado,
        votos_favor,
        votos_contra,
        abstencoes,
        votos (
          id,
          voto,
          vereador_id,
          votacao_id,
          data_voto
        )
      `
      )
      .eq("projeto_id", id);

    if (votacoesError) throw votacoesError;

    const votacoesMapeadas: VotacaoInterface[] = (votacoes || []).map(
      (votacao) => ({
        id: votacao.id,
        dataInicio: votacao.data_inicio,
        dataFim: votacao.data_fim,
        data_criacao: votacao.data_criacao || votacao.data_inicio,
        data_atualizacao: votacao.data_atualizacao || votacao.data_inicio,
        resultado: votacao.resultado,
        votosFavor: votacao.votos_favor || 0,
        votosContra: votacao.votos_contra || 0,
        abstencoes: votacao.abstencoes || 0,
        votos: (votacao.votos || []).map((voto: any) => ({
          id: voto.id,
          voto: voto.voto,
          vereadorId: voto.vereador_id,
          votacaoId: voto.votacao_id,
          dataVoto: voto.data_voto || voto.created_at,
        })),
      })
    );

    return { ...projeto, votacoes: votacoesMapeadas };
  },

  async createProjeto(
    projeto: Omit<Projeto, "id" | "data_apresentacao" | "status">
  ): Promise<Projeto> {
    const { data, error } = await supabase
      .from("projetos")
      .insert({
        ...projeto,
        data_apresentacao: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateProjeto(id: number, projeto: Partial<Projeto>): Promise<Projeto> {
    const { data, error } = await supabase
      .from("projetos")
      .update(projeto)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async iniciarVotacao(projeto_id: number): Promise<void> {
    const { error: projetoError } = await supabase
      .from("projetos")
      .update({ status: "em_votacao" })
      .eq("id", projeto_id);

    if (projetoError) throw projetoError;

    const { error: votacaoError } = await supabase.from("votacoes").insert({
      projeto_id: projeto_id,
      data_inicio: new Date().toISOString(),
      resultado: "em_andamento",
      votos_favor: 0,
      votos_contra: 0,
      abstencoes: 0,
    });

    if (votacaoError) throw votacaoError;
  },

  async getUsuarios(): Promise<{ id: number; nome: string }[]> {
    const { data, error } = await supabase.from("usuarios").select("id, nome");
    if (error) throw error;
    return data || [];
  },
};

// Manter compatibilidade com imports antigos
export const projetoSupabaseService = projetoService;
