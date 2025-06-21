import { supabase } from "./supabase";

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
      const { data, error } = await supabase
        .from('usuarios')
        .select('*');
      
      if (error) throw error;
      
      return {
        success: true,
        data: data || [],
      };
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      return {
        success: false,
        error: "Erro ao buscar usuários",
      };
    }
  },

  create: async (data: CriarUsuarioData) => {
    try {
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.senha,
      });
      
      if (authError) throw authError;
      
      // Criar registro na tabela usuarios
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .insert({
          nome: data.nome,
          email: data.email,
          cargo: data.cargo,
          ativo: true,
          senha: "supabase_auth", // Placeholder, senha real gerenciada pelo Supabase Auth
        })
        .select()
        .single();
      
      if (userError) throw userError;
      
      return {
        success: true,
        data: userData,
      };
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      return {
        success: false,
        error: "Erro ao criar usuário",
      };
    }
  },
};