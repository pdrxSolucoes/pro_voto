// src/services/usuarioService.ts
import { supabase } from "./supabase";

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  cargo: "admin" | "vereador";
  ativo?: boolean;
  data_criacao: Date;
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
    const { data, error } = await supabase
      .from("usuarios")
      .insert(usuario)
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
};
