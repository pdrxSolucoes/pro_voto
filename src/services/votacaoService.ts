// src/services/votacaoService.ts
import type {
  ResultadoVotacaoInterface,
  VotacaoInterface,
} from "@/interfaces/VotacaoInterface";
import type { VotoInterface } from "@/interfaces/VotoInterface";
import { supabase } from "@/lib/supabaseClient";

export const votacaoService = {
  async getVotacoesAtivas(): Promise<VotacaoInterface[]> {
    const { data, error } = await supabase
      .from("votacoes")
      .select(
        `
        *,
        projetos (*),
        votos (
          *,
          usuarios (
            id,
            nome,
            cargo
          )
        )
      `
      )
      .eq("resultado", "em_andamento")
      .order("data_inicio", { ascending: false });

    if (error) {
      console.error("Erro ao buscar votações ativas:", error);
      throw new Error(`Erro ao buscar votações: ${error.message}`);
    }

    return data || [];
  },

  async checkVotacao(): Promise<{ emAndamento: boolean; votacaoId?: number }> {
    const { data, error } = await supabase
      .from("votacoes")
      .select("id")
      .eq("resultado", "em_andamento")
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Erro ao verificar votação:", error);
      throw new Error(`Erro ao verificar votação: ${error.message}`);
    }

    return {
      emAndamento: !!data,
      votacaoId: data?.id,
    };
  },

  async getVotacaoComVotos(id: number): Promise<VotacaoInterface | null> {
    const { data, error } = await supabase
      .from("votacoes")
      .select(
        `
        *,
        projetos (*),
        votos (
          *,
          usuarios (
            id,
            nome,
            cargo,
            partido
          )
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Votação não encontrada
      }
      console.error("Erro ao buscar votação com votos:", error);
      throw new Error(`Erro ao buscar votação: ${error.message}`);
    }

    return data;
  },

  async getResultadoVotacao(id: number): Promise<ResultadoVotacaoInterface> {
    const { data: votacao, error: votacaoError } = await supabase
      .from("votacoes")
      .select("votos_favor, votos_contra, abstencoes")
      .eq("id", id)
      .single();

    if (votacaoError) {
      console.error("Erro ao buscar resultado da votação:", votacaoError);
      throw new Error(`Votação não encontrada: ${votacaoError.message}`);
    }

    const total_votos =
      votacao.votos_favor + votacao.votos_contra + votacao.abstencoes;

    const { count: total_vereadores, error: countError } = await supabase
      .from("usuarios")
      .select("*", { count: "exact", head: true })
      .eq("cargo", "vereador")
      .eq("ativo", true);

    if (countError) {
      console.error("Erro ao contar vereadores:", countError);
      throw new Error(`Erro ao contar vereadores: ${countError.message}`);
    }

    return {
      total_votos,
      total_vereadores: total_vereadores || 0,
      votos_sim: votacao.votos_favor,
      votos_nao: votacao.votos_contra,
      abstencoes: votacao.abstencoes,
      aprovada: votacao.votos_favor > votacao.votos_contra,
    };
  },

  async iniciarVotacao(projeto_id: number): Promise<VotacaoInterface> {
    // Verificar se o projeto existe
    const { data: projeto, error: projetoError } = await supabase
      .from("projetos")
      .select("id")
      .eq("id", projeto_id)
      .single();

    if (projetoError) {
      console.error("Erro ao verificar projeto:", projetoError);
      throw new Error(`Projeto não encontrado: ${projetoError.message}`);
    }

    // Verificar se já existe uma votação em andamento
    const { data: votacaoExistente } = await supabase
      .from("votacoes")
      .select("id")
      .eq("resultado", "em_andamento")
      .limit(1);

    if (votacaoExistente && votacaoExistente.length > 0) {
      throw new Error("Já existe uma votação em andamento");
    }

    const { data, error } = await supabase
      .from("votacoes")
      .insert({
        projeto_id: projeto_id,
        data_inicio: new Date().toISOString(),
        resultado: "em_andamento",
        votos_favor: 0,
        votos_contra: 0,
        abstencoes: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao iniciar votação:", error);
      throw new Error(`Erro ao iniciar votação: ${error.message}`);
    }

    return data;
  },

  async finalizarVotacao(votacaoId: number): Promise<VotacaoInterface> {
    // Buscar a votação atual para verificar os votos
    const { data: votacao, error: fetchError } = await supabase
      .from("votacoes")
      .select("votos_favor, votos_contra")
      .eq("id", votacaoId)
      .single();

    if (fetchError) {
      console.error("Erro ao buscar votação:", fetchError);
      throw new Error(`Votação não encontrada: ${fetchError.message}`);
    }

    // Determinar resultado baseado nos votos
    const aprovada = votacao.votos_favor > votacao.votos_contra;

    const { data, error } = await supabase
      .from("votacoes")
      .update({
        data_fim: new Date().toISOString(),
        resultado: aprovada ? "aprovada" : "reprovada",
        data_atualizacao: new Date().toISOString(),
      })
      .eq("id", votacaoId)
      .select()
      .single();

    if (error) {
      console.error("Erro ao finalizar votação:", error);
      throw new Error(`Erro ao finalizar votação: ${error.message}`);
    }

    return data;
  },

  async registrarVoto(
    votacaoId: number,
    vereadorId: number,
    voto: "aprovar" | "desaprovar" | "abster"
  ): Promise<VotoInterface> {
    // Verificar se a votação existe e está ativa
    const { data: votacao, error: votacaoError } = await supabase
      .from("votacoes")
      .select("id, resultado")
      .eq("id", votacaoId)
      .eq("resultado", "em_andamento")
      .single();

    if (votacaoError) {
      console.error("Erro ao verificar votação:", votacaoError);
      throw new Error("Votação não encontrada ou já finalizada");
    }

    // Verificar se o vereador existe e está ativo
    const { data: vereador, error: vereadorError } = await supabase
      .from("usuarios")
      .select("id")
      .eq("id", vereadorId)
      .eq("cargo", "vereador")
      .eq("ativo", true)
      .single();

    if (vereadorError) {
      console.error("Erro ao verificar vereador:", vereadorError);
      throw new Error("Vereador não encontrado ou inativo");
    }

    // Verificar se já votou
    const { data: votoExistente } = await supabase
      .from("votos")
      .select("id")
      .eq("votacao_id", votacaoId)
      .eq("vereador_id", vereadorId)
      .single();

    if (votoExistente) {
      throw new Error("Vereador já votou nesta votação");
    }

    // Inserir o novo voto
    const { data: novoVoto, error: votoError } = await supabase
      .from("votos")
      .insert({
        votacao_id: votacaoId,
        vereador_id: vereadorId,
        voto: voto,
        data_voto: new Date().toISOString(),
      })
      .select(
        `
        *,
        usuarios (
          id,
          nome,
          cargo,
          partido
        )
      `
      )
      .single();

    if (votoError) {
      console.error("Erro ao registrar voto:", votoError);
      throw new Error(`Erro ao registrar voto: ${votoError.message}`);
    }

    // Recalcular contadores
    await this.recalcularContadores(votacaoId);

    return novoVoto;
  },

  async recalcularContadores(votacaoId: number): Promise<void> {
    // Buscar todos os votos da votação
    const { data: votos, error } = await supabase
      .from("votos")
      .select("voto")
      .eq("votacao_id", votacaoId);

    if (error) {
      console.error("Erro ao buscar votos:", error);
      throw new Error(`Erro ao recalcular contadores: ${error.message}`);
    }

    // Contar votos
    const contadores = (votos || []).reduce(
      (acc, voto) => {
        switch (voto.voto) {
          case "aprovar":
            acc.votosFavor++;
            break;
          case "desaprovar":
            acc.votosContra++;
            break;
          case "abster":
            acc.abstencoes++;
            break;
        }
        return acc;
      },
      { votosFavor: 0, votosContra: 0, abstencoes: 0 }
    );

    // Atualizar votação
    const { error: updateError } = await supabase
      .from("votacoes")
      .update({
        votos_favor: contadores.votosFavor,
        votos_contra: contadores.votosContra,
        abstencoes: contadores.abstencoes,
        data_atualizacao: new Date().toISOString(),
      })
      .eq("id", votacaoId);

    if (updateError) {
      console.error("Erro ao atualizar contadores:", updateError);
      throw new Error(`Erro ao atualizar contadores: ${updateError.message}`);
    }
  },

  async getVotos(votacaoId: number): Promise<VotoInterface[]> {
    const { data, error } = await supabase
      .from("votos")
      .select(
        `
        *,
        usuarios (
          id,
          nome,
          cargo,
          partido
        )
      `
      )
      .eq("votacao_id", votacaoId)
      .order("data_voto", { ascending: true });

    if (error) {
      console.error("Erro ao buscar votos:", error);
      throw new Error(`Erro ao buscar votos: ${error.message}`);
    }

    return data || [];
  },

  async criarVotacao(projeto_id: number): Promise<VotacaoInterface> {
    return await this.iniciarVotacao(projeto_id);
  },

  async verificarVotoVereador(
    votacaoId: number,
    vereadorId: number
  ): Promise<VotoInterface | null> {
    const { data, error } = await supabase
      .from("votos")
      .select(
        `
        *,
        usuarios (
          id,
          nome,
          cargo,
          partido
        )
      `
      )
      .eq("votacao_id", votacaoId)
      .eq("vereador_id", vereadorId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Erro ao verificar voto do vereador:", error);
      throw new Error(`Erro ao verificar voto: ${error.message}`);
    }

    return data || null;
  },

  async getEstatisticasTempoReal(votacaoId: number) {
    const votacao = await this.getVotacaoComVotos(votacaoId);

    if (!votacao) {
      throw new Error("Votação não encontrada");
    }

    const { count: totalVereadores, error: countError } = await supabase
      .from("usuarios")
      .select("*", { count: "exact", head: true })
      .eq("cargo", "vereador")
      .eq("ativo", true);

    if (countError) {
      console.error("Erro ao contar vereadores:", countError);
      throw new Error(`Erro ao contar vereadores: ${countError.message}`);
    }

    const votosComputados = votacao.votos?.length || 0;
    const pendentes = (totalVereadores || 0) - votosComputados;

    return {
      totalVereadores: totalVereadores || 0,
      votosComputados,
      pendentes,
      votosFavor: votacao.votos_favor,
      votosContra: votacao.votos_contra,
      abstencoes: votacao.abstencoes,
      percentualParticipacao: totalVereadores
        ? (votosComputados / totalVereadores) * 100
        : 0,
      votos: votacao.votos || [],
    };
  },

  // Métodos adicionais para melhor funcionalidade

  async getHistoricoVotacoes(limit: number = 10): Promise<VotacaoInterface[]> {
    const { data, error } = await supabase
      .from("votacoes")
      .select(
        `
        *,
        projetos (*)
      `
      )
      .neq("resultado", "em_andamento")
      .order("data_fim", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Erro ao buscar histórico:", error);
      throw new Error(`Erro ao buscar histórico: ${error.message}`);
    }

    return data || [];
  },

  async cancelarVotacao(votacaoId: number): Promise<void> {
    // Verificar se a votação existe e está em andamento
    const { data: votacao, error: fetchError } = await supabase
      .from("votacoes")
      .select("id, resultado")
      .eq("id", votacaoId)
      .eq("resultado", "em_andamento")
      .single();

    if (fetchError) {
      throw new Error("Votação não encontrada ou já finalizada");
    }

    // Excluir todos os votos da votação
    const { error: deleteVotosError } = await supabase
      .from("votos")
      .delete()
      .eq("votacao_id", votacaoId);

    if (deleteVotosError) {
      console.error("Erro ao excluir votos:", deleteVotosError);
      throw new Error(`Erro ao excluir votos: ${deleteVotosError.message}`);
    }

    // Excluir a votação``
    const { error: deleteVotacaoError } = await supabase
      .from("votacoes")
      .delete()
      .eq("id", votacaoId);

    if (deleteVotacaoError) {
      console.error("Erro ao cancelar votação:", deleteVotacaoError);
      throw new Error(
        `Erro ao cancelar votação: ${deleteVotacaoError.message}`
      );
    }
  },
};
