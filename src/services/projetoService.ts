// src/services/projetoService.ts
import api from "./api";

export interface Projeto {
  id: number;
  titulo: string;
  descricao: string;
  data_apresentacao: string;
  status: "pendente" | "em_votacao" | "aprovada" | "reprovada";
}

export const projetoService = {
  async getProjetos(): Promise<Projeto[]> {
    const { data } = await api.get("/projetos");
    return data.data;
  },

  async createProjeto(
    projeto: Omit<Projeto, "id" | "data_apresentacao" | "status">
  ) {
    return api.post("/projetos", projeto);
  },

  async updateProjeto(id: number, projeto: Partial<Projeto>) {
    return api.put(`/projetos/${id}`, projeto);
  },

  async iniciarVotacao(id: number) {
    return api.post(`/projetos/${id}/iniciar-votacao`);
  },
};
