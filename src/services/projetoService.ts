// src/services/projetoService.ts
import { supabase } from "@/lib/supabaseClient";

export interface Projeto {
  id: number;
  titulo: string;
  descricao: string;
  data_apresentacao: string;
  status: "pendente" | "em_votacao" | "aprovada" | "reprovada";
}

export const projetoService = {
  async getProjetos(): Promise<Projeto[]> {
    const { data, error } = await supabase.from("projetos").select("*");
    if (error) throw error;
    return data || [];
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

  async iniciarVotacao(id: number): Promise<void> {
    const { error } = await supabase
      .from("projetos")
      .update({ status: "em_votacao" })
      .eq("id", id);
    if (error) throw error;
  },
};
