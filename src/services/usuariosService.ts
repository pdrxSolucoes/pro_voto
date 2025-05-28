import { api } from "@/lib/api";
import axios from "axios";

// Interface para criação de usuário
export interface CriarUsuarioData {
  nome: string;
  email: string;
  senha: string;
  cargo: "vereador" | "admin";
}

// API de usuários
export const usuariosService = {
  getAll: async () => {
    try {
      const response = await api.get("/usuarios");
      return {
        success: true,
        data: response.data.usuarios,
      };
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.error || "Erro ao buscar usuários"
          : "Erro ao buscar usuários",
      };
    }
  },

  create: async (data: CriarUsuarioData) => {
    try {
      const response = await api.post("/usuarios", data);
      return {
        success: true,
        data: response.data.usuario,
      };
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.error || "Erro ao criar usuário"
          : "Erro ao criar usuário",
      };
    }
  },
};