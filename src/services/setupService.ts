import { supabase } from "@/lib/supabaseClient";

export const setupService = {
  async checkSetup(): Promise<{ hasAdmin: boolean }> {
    try {
      const { count, error } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true })
        .eq('cargo', 'admin')
        .eq('ativo', true);
      
      if (error) throw error;
      
      return { hasAdmin: (count || 0) > 0 };
    } catch (error) {
      console.error('Erro ao verificar setup:', error);
      throw error;
    }
  }
};