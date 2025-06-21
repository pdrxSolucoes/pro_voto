// src/contexts/AuthContext.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";

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
        
        const validation = await authService.validateToken();
        
        if (validation.valid && validation.user) {
          console.log("✅ Usuário autenticado:", validation.user.nome);
          setUser(validation.user);
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
  }, []);

  const login = async (email: string, senha: string) => {
    try {
      console.log("🔐 Tentativa de login para:", email);
      const result = await authService.login({ email, password: senha });
      
      console.log("✅ Login realizado com sucesso");
      setUser(result.user);
      
      return { success: true };
    } catch (error) {
      console.error("❌ Erro no login:", error);
      
      // Se for erro de setup requerido, redirecionar para setup
      if (error instanceof Error && error.message === "SETUP_REQUIRED") {
        router.push("/setup");
        return { success: false, error: "Redirecionando para configuração inicial..." };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao fazer login",
      };
    }
  };

  const logout = async () => {
    console.log("🚪 Iniciando logout...");
    await authService.logout();
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