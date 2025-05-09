// src/lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const emendasApi = {
  getAll: async (status?: string) => {
    const params = status ? { status } : {};
    const response = await api.get("/emendas", { params });
    return response.data;
  },

  create: async (emenda: { titulo: string; descricao: string }) => {
    const response = await api.post("/emendas", emenda);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/emendas/${id}`);
    return response.data;
  },

  updateStatus: async (id: number, status: string) => {
    const response = await api.patch(`/emendas/${id}/status`, { status });
    return response.data;
  },
};

export const votacoesApi = {
  iniciar: async (emendaId: number) => {
    const response = await api.post("/votacoes", { emendaId });
    return response.data;
  },

  encerrar: async (id: number) => {
    const response = await api.patch(`/votacoes/${id}/encerrar`);
    return response.data;
  },

  getResultado: async (id: number) => {
    const response = await api.get(`/votacoes/${id}/resultado`);
    return response.data;
  },

  votar: async (
    votacaoId: number,
    voto: "aprovar" | "desaprovar" | "abster"
  ) => {
    const response = await api.post("/votos", { votacaoId, voto });
    return response.data;
  },
};

export const authApi = {
  login: async (email: string, senha: string) => {
    const response = await api.post("/auth/login", { email, senha });
    if (response.data.token) {
      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },
};

export default api;
