"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface AuthContextType {
  user: any;
  loading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    senha: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  isAuthenticated: false,
  login: async () => ({ success: false }),
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Verificar autenticação ao iniciar
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        console.log("🚀 Iniciando verificação de autenticação...");

        const {
          data: { session },
        } = await supabase.auth.getSession();
        console.log("🔑 Sessão atual:", session);
        if (session?.user) {
          const { data: userData, error } = await supabase
            .from("usuarios")
            .select("*")
            .eq("email", session.user.email)
            .single();

          if (!error && userData) {
            console.log("✅ Usuário autenticado:", userData.nome);
            setUser({
              id: userData.id,
              nome: userData.nome,
              email: userData.email,
              cargo: userData.cargo,
            });
          } else {
            console.log("❌ Usuário não encontrado na base de dados");
            setUser(null);
          }
        } else {
          console.log("❌ Usuário não autenticado");
          setUser(null);
        }
      } catch (error) {
        console.error("❌ Erro na verificação de autenticação:", error);
        setUser(null);
      } finally {
        setLoading(false);
        console.log("✅ Verificação de autenticação concluída");
      }
    };

    verifyAuth();

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Mudança de estado de autenticação:", event);

      if (session?.user) {
        const { data: userData } = await supabase
          .from("usuarios")
          .select("*")
          .eq("email", session.user.email)
          .single();

        if (userData) {
          setUser({
            id: userData.id,
            nome: userData.nome,
            email: userData.email,
            cargo: userData.cargo,
          });
        }
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, senha: string) => {
    try {
      console.log("🔐 Tentativa de login para:", email);

      // Verificar se há usuários no sistema
      const { data: userCount } = await supabase
        .from("usuarios")
        .select("id", { count: "exact" });

      if (userCount?.length === 0 && email === "pdrxsolucoes@gmail.com") {
        router.push("/setup");
        return {
          success: false,
          error: "Redirecionando para configuração inicial...",
        };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) throw error;

      const { data: userData, error: userError } = await supabase
        .from("usuarios")
        .select("*")
        .eq("email", email)
        .single();

      if (userError) throw userError;

      console.log("✅ Login realizado com sucesso");
      setUser({
        id: userData.id,
        nome: userData.nome,
        email: userData.email,
        cargo: userData.cargo,
      });

      return { success: true };
    } catch (error) {
      console.error("❌ Erro no login:", error);

      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao fazer login",
      };
    }
  };

  const logout = async () => {
    console.log("🚪 Iniciando logout...");
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  };

  // Debug: Verificar estado atual
  useEffect(() => {
    if (!loading) {
      console.log("📊 Estado atual da autenticação:");
      console.log("  User:", user ? user.nome : "null");
      console.log("  Loading:", loading);
      console.log("  IsAdmin:", user?.cargo === "admin");
      console.log("  IsAuthenticated:", !!user);
    }
  }, [user, loading]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.cargo === "admin",
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
