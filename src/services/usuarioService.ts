import { supabase } from "@/lib/supabaseClient";

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  cargo: "admin" | "vereador";
  ativo?: boolean;
  data_criacao: Date;
}

export interface CriarUsuarioData {
  nome: string;
  email: string;
  senha: string;
  cargo: "vereador" | "admin";
}

export const usuarioService = {
  async getUsuarios(): Promise<Usuario[]> {
    const { data, error } = await supabase.from("usuarios").select("*");
    if (error) throw error;
    return data || [];
  },

  async getUsuariosAtivos(): Promise<Usuario[]> {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("ativo", true);
    if (error) throw error;
    return data || [];
  },

  async getUsuarioById(id: number): Promise<Usuario> {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async createUsuario(
    usuario: Omit<Usuario, "id"> & { senha: string }
  ): Promise<Usuario> {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: usuario.email,
      password: usuario.senha,
    });
    
    if (authError) throw authError;
    
    const { data, error } = await supabase
      .from("usuarios")
      .insert({
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo,
        ativo: usuario.ativo ?? true,
        senha: "supabase_auth",
        data_criacao: usuario.data_criacao || new Date(),
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateUsuario(
    id: number,
    usuario: Partial<Usuario> & { senha?: string }
  ): Promise<Usuario> {
    const { data, error } = await supabase
      .from("usuarios")
      .update(usuario)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteUsuario(id: number): Promise<void> {
    const { error } = await supabase.from("usuarios").delete().eq("id", id);
    if (error) throw error;
  },

  async contarUsuariosAtivos(): Promise<number> {
    const { count, error } = await supabase
      .from("usuarios")
      .select("*", { count: "exact", head: true })
      .eq("ativo", true);
    if (error) throw error;
    return count || 0;
  },

  // Métodos com formato de resposta padronizado
  getAll: async () => {
    try {
      const data = await usuarioService.getUsuarios();
      return { success: true, data };
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      return { success: false, error: "Erro ao buscar usuários" };
    }
  },

  create: async (data: CriarUsuarioData) => {
    try {
      const usuario = await usuarioService.createUsuario({
        ...data,
        data_criacao: new Date(),
      });
      return { success: true, data: usuario };
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      return { success: false, error: "Erro ao criar usuário" };
    }
  },
};

// Manter compatibilidade com imports antigos
export const usuariosService = usuarioService;
