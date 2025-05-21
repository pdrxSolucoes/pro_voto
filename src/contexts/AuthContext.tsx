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
import { authApi, authUtils } from "@/lib/api";

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

        // Primeiro, verificar persistência dos dados
        const persistence = authUtils.checkPersistence();

        if (!persistence.hasToken) {
          console.log("❌ Nenhum token encontrado, usuário não autenticado");
          setLoading(false);
          return;
        }

        // Obter o usuário armazenado primeiro
        const storedUser = authUtils.getUser();
        if (storedUser) {
          console.log("👤 Definindo usuário do localStorage:", storedUser.nome);
          setUser(storedUser);
        }

        // Validar token no servidor
        console.log("🔄 Validando token no servidor...");
        const validationResult = await authApi.validateToken();

        if (validationResult.success) {
          console.log("✅ Token válido confirmado pelo servidor");

          // Atualizar usuário se retornado pela validação
          if (validationResult.data?.user) {
            console.log("🔄 Atualizando dados do usuário da validação");
            setUser(validationResult.data.user);
            authUtils.setUser(validationResult.data.user);
          }
        } else {
          console.log(
            "❌ Token inválido, limpando autenticação:",
            validationResult.error
          );
          // Token inválido, limpar tudo
          authUtils.logout();
          setUser(null);
        }
      } catch (error) {
        console.error("❌ Erro crítico na verificação de autenticação:", error);
        // Em caso de erro crítico, limpar autenticação
        authUtils.logout();
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
      const result = await authApi.login(email, senha);

      if (result.success && result.data) {
        console.log("✅ Login realizado com sucesso");
        setUser(result.data.user);

        // Verificar se os dados foram persistidos corretamente
        setTimeout(() => {
          authUtils.checkPersistence();
        }, 100);

        return { success: true };
      }

      console.log("❌ Falha no login:", result.error);
      return { success: false, error: result.error };
    } catch (error) {
      console.error("❌ Erro crítico no login:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao fazer login",
      };
    }
  };

  const logout = () => {
    console.log("🚪 Iniciando logout...");
    authApi.logout();
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
