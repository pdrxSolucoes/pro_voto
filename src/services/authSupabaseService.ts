// src/services/authSupabaseService.ts
import { supabase } from "@/lib/supabaseClient";

export interface LoginCredentials {
  email: string;
  senha: string;
}

export const authSupabaseService = {
  async login(credentials: LoginCredentials) {
    // Buscar usuário por email e senha (hash seria ideal)
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", credentials.email)
      .eq("senha", credentials.senha) // Em produção, usar hash
      .eq("ativo", true)
      .single();

    if (error || !data) {
      throw new Error("Credenciais inválidas");
    }

    return data;
  },

  async validateUser(userId: number) {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", userId)
      .eq("ativo", true)
      .single();

    if (error) throw error;
    return data;
  },
};
