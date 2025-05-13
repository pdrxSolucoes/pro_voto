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

// API de emendas
export const emendasApi = {
  getAll: async () => {
    try {
      const response = await api.get("/emendas");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Erro ao buscar emendas:", error);
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.error || "Erro ao buscar emendas"
          : "Erro ao buscar emendas",
      };
    }
  },

  getById: async (id: number) => {
    try {
      const response = await api.get(`/emendas/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(`Erro ao buscar emenda ${id}:`, error);
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.error || `Erro ao buscar emenda ${id}`
          : `Erro ao buscar emenda ${id}`,
      };
    }
  },

  create: async (data: { titulo: string; descricao: string }) => {
    try {
      const response = await api.post("/emendas", data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Erro ao criar emenda:", error);
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.error || "Erro ao criar emenda"
          : "Erro ao criar emenda",
      };
    }
  },

  update: async (
    id: number,
    data: { titulo?: string; descricao?: string; status?: string }
  ) => {
    try {
      const response = await api.put(`/emendas/${id}`, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(`Erro ao atualizar emenda ${id}:`, error);
      return {
        success: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.error || `Erro ao atualizar emenda ${id}`
          : `Erro ao atualizar emenda ${id}`,
      };
    }
  },

  iniciarVotacao: async (id: number) => {
    try {
      const response = await api.post(`/emendas/${id}/iniciar-votacao`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(`Erro ao iniciar votação para emenda ${id}:`, error);
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
