import { supabase } from "@/lib/supabaseClient";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    nome: string;
    email: string;
    cargo: "admin" | "vereador";
  };
}

export interface ValidationResponse {
  valid: boolean;
  user?: {
    id: number;
    nome: string;
    email: string;
    cargo: "admin" | "vereador";
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data: userCount } = await supabase
      .from("usuarios")
      .select("id", { count: "exact" });

    if (userCount?.length === 0 && credentials.email === "pdrxsolucoes@gmail.com") {
      throw new Error("SETUP_REQUIRED");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) throw error;

    const { data: userData, error: userError } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", credentials.email)
      .single();

    if (userError) throw userError;

    return {
      token: data.session?.access_token || "",
      user: {
        id: userData.id,
        nome: userData.nome,
        email: userData.email,
        cargo: userData.cargo,
      },
    };
  },

  async validateToken(): Promise<ValidationResponse> {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) return { valid: false };

      const { data: userData, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("email", session.user.email)
        .single();

      if (error) return { valid: false };

      return {
        valid: true,
        user: {
          id: userData.id,
          nome: userData.nome,
          email: userData.email,
          cargo: userData.cargo,
        },
      };
    } catch (error) {
      return { valid: false };
    }
  },

  async setup(adminData: {
    nome: string;
    email: string;
    senha: string;
  }): Promise<AuthResponse> {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: adminData.email,
      password: adminData.senha,
    });

    if (authError) throw authError;

    const { data: userData, error: userError } = await supabase
      .from("usuarios")
      .insert({
        nome: adminData.nome,
        email: adminData.email,
        cargo: "admin",
        ativo: true,
        senha: "supabase_auth",
        data_criacao: new Date().toISOString(),
      })
      .select()
      .single();

    if (userError) throw userError;

    return {
      token: authData.session?.access_token || "",
      user: {
        id: userData.id,
        nome: userData.nome,
        email: userData.email,
        cargo: userData.cargo,
      },
    };
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },
};
