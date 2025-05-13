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
        // Verificar se há um token no localStorage
        const token = authUtils.getToken();
        if (!token) {
          setLoading(false);
          return;
        }

        // Obter o usuário armazenado
        const storedUser = authUtils.getUser();
        if (storedUser) {
          setUser(storedUser);
        }

        // Verificar a validade do token
        const validationResult = await authApi.validateToken();
        if (validationResult.success) {
          // Se o usuário não foi definido a partir do localStorage
          if (!storedUser && validationResult.data?.user) {
            setUser(validationResult.data.user);
            authUtils.setUser(validationResult.data.user);
          }
        } else {
          // Token inválido, limpar autenticação
          authUtils.logout();
          setUser(null);
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        // Em caso de erro, manter o usuário deslogado
        authUtils.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = async (email: string, senha: string) => {
    try {
      const result = await authApi.login(email, senha);

      if (result.success) {
        setUser(result.data.user);
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao fazer login",
      };
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    router.push("/login");
  };

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
