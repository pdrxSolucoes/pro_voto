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
    }
  }
  return config;
});

// Interceptor para tratar respostas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Não redirecionamos automaticamente aqui para evitar ciclos
    return Promise.reject(error);
  }
);

// Funções auxiliares para tratamento de autenticação
export const authUtils = {
  getToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken");
    }
    return null;
  },

  setToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token);
    }
  },

  removeToken: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
    }
  },

  getUser: () => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  },

  setUser: (user: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user));
    }
  },

  removeUser: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
    }
  },

  logout: () => {
    authUtils.removeToken();
    authUtils.removeUser();
    // Observação: o redirecionamento deve ser feito pelo componente que chama este método
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
      const response = await api.post("/auth/login", { email, senha });

      if (response.data.token) {
        authUtils.setToken(response.data.token);
        authUtils.setUser(response.data.user);
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.error || "Erro ao fazer login"
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
    return !!authUtils.getToken();
  },

  validateToken: async () => {
    try {
      const token = authUtils.getToken();
      if (!token) {
        return { success: false, error: "Token não encontrado" };
      }

      const response = await api.get("/auth/validate");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Erro ao validar token:", error);

      // Se token inválido/expirado, limpar localstorage
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        authUtils.logout();
      }

      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.error || "Erro ao validar token"
          : "Erro ao validar token",
      };
    }
  },
};
