// src/lib/api.ts
import axios from "axios";
import { useRouter } from "next/navigation";

// Crie e exporte a instância do Axios
export const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔑 Token adicionado ao header da requisição");
    } else {
      console.log("⚠️ Nenhum token encontrado para adicionar ao header");
    }
  }
  return config;
});

// Interceptor para tratar respostas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se receber 401 (não autorizado), limpar dados de autenticação
    if (error.response?.status === 401) {
      console.log("❌ Token expirado ou inválido (401), limpando dados");
      authUtils.logout();
    }
    return Promise.reject(error);
  }
);

// Funções auxiliares para tratamento de autenticação
export const authUtils = {
  getToken: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      console.log(
        "🔍 Buscando token no localStorage:",
        token ? "✅ Encontrado" : "❌ Não encontrado"
      );
      return token;
    }
    return null;
  },

  setToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token);
      console.log("💾 Token salvo no localStorage com sucesso");
    }
  },

  removeToken: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      console.log("🗑️ Token removido do localStorage");
    }
  },

  getUser: () => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          console.log("👤 Usuário obtido do localStorage:", user.nome);
          return user;
        } catch (error) {
          console.error("❌ Erro ao fazer parse do usuário:", error);
          localStorage.removeItem("user"); // Remove dados corrompidos
          return null;
        }
      } else {
        console.log("👤 Nenhum usuário encontrado no localStorage");
      }
    }
    return null;
  },

  setUser: (user: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user));
      console.log("💾 Usuário salvo no localStorage:", user.nome);
    }
  },

  removeUser: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      console.log("🗑️ Usuário removido do localStorage");
    }
  },

  logout: () => {
    console.log("🚪 Executando logout completo...");
    authUtils.removeToken();
    authUtils.removeUser();
    console.log("✅ Logout concluído");
  },

  // Nova função para verificar se os dados estão persistidos
  checkPersistence: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      const user = localStorage.getItem("user");
      console.log("🔍 Verificação de persistência:");
      console.log("  Token:", token ? "✅ Presente" : "❌ Ausente");
      console.log("  Usuário:", user ? "✅ Presente" : "❌ Ausente");
      return { hasToken: !!token, hasUser: !!user };
    }
    return { hasToken: false, hasUser: false };
  },
};

// API de projetos
export const projetosApi = {
  getAll: async () => {
    try {
      const response = await api.get("/projetos");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Erro ao buscar projetos:", error);
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.error || "Erro ao buscar projetos"
          : "Erro ao buscar projetos",
      };
    }
  },

  getById: async (id: number) => {
    try {
      const response = await api.get(`/projetos/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(`Erro ao buscar projeto ${id}:`, error);
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.error || `Erro ao buscar projeto ${id}`
          : `Erro ao buscar projeto ${id}`,
      };
    }
  },

  create: async (data: { titulo: string; descricao: string }) => {
    try {
      const response = await api.post("/projetos", data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Erro ao criar projeto:", error);
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.error || "Erro ao criar projeto"
          : "Erro ao criar projeto",
      };
    }
  },

  update: async (
    id: number,
    data: { titulo?: string; descricao?: string; status?: string }
  ) => {
    try {
      const response = await api.put(`/projetos/${id}`, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(`Erro ao atualizar projeto ${id}:`, error);
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.error || `Erro ao atualizar projeto ${id}`
          : `Erro ao atualizar projeto ${id}`,
      };
    }
  },

  iniciarVotacao: async (id: number) => {
    try {
      const response = await api.post(`/projetos/${id}/iniciar-votacao`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(`Erro ao iniciar votação para projeto ${id}:`, error);
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.error || `Erro ao iniciar votação`
          : `Erro ao iniciar votação`,
      };
    }
  },
};

// API de autenticação
export const authApi = {
  login: async (email: string, senha: string) => {
    try {
      console.log("🔐 Iniciando processo de login...");
      const response = await api.post("/auth/login", { email, senha });

      if (response.data.success && response.data.token) {
        console.log("✅ Login bem-sucedido, salvando dados...");

        // Salvar token e usuário
        authUtils.setToken(response.data.token);
        authUtils.setUser(response.data.user);

        // Verificar se foi salvo corretamente
        authUtils.checkPersistence();

        return {
          success: true,
          data: response.data,
        };
      } else {
        console.log("❌ Login falhou:", response.data.message);
        return {
          success: false,
          error: response.data.message || "Erro no login",
        };
      }
    } catch (error) {
      console.error("❌ Erro ao fazer login:", error);
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.error ||
            error.response?.data?.message ||
            "Erro ao fazer login"
          : "Erro ao fazer login",
      };
    }
  },

  logout: () => {
    authUtils.logout();
    return { success: true };
  },

  getUser: authUtils.getUser,

  isAuthenticated: () => {
    const hasToken = !!authUtils.getToken();
    console.log(
      "🔍 Verificando autenticação:",
      hasToken ? "✅ Autenticado" : "❌ Não autenticado"
    );
    return hasToken;
  },

  validateToken: async () => {
    try {
      console.log("🔄 Validando token...");
      const token = authUtils.getToken();

      if (!token) {
        console.log("❌ Token não encontrado para validação");
        return { success: false, error: "Token não encontrado" };
      }

      const response = await api.get("/auth/validate");

      if (response.data.success) {
        console.log("✅ Token válido");

        // Atualizar dados do usuário se retornados
        if (response.data.user) {
          authUtils.setUser(response.data.user);
        }

        return {
          success: true,
          data: response.data,
        };
      } else {
        console.log("❌ Token inválido:", response.data.message);
        authUtils.logout();
        return {
          success: false,
          error: response.data.message || "Token inválido",
        };
      }
    } catch (error) {
      console.error("❌ Erro ao validar token:", error);

      // Se token inválido/expirado, limpar localstorage
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.log("🧹 Token expirado, limpando dados...");
        authUtils.logout();
      }

      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.error ||
            error.response?.data?.message ||
            "Erro ao validar token"
          : "Erro ao validar token",
      };
    }
  },
};
