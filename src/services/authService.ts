// src/services/authService.ts
import api from "./api";

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
    const { data } = await api.post("/auth/login", credentials);
    return data;
  },

  async validateToken(): Promise<ValidationResponse> {
    try {
      const { data } = await api.get("/auth/validate");
      return data;
    } catch (error) {
      return { valid: false };
    }
  },

  async setup(adminData: { nome: string; email: string; senha: string }): Promise<AuthResponse> {
    const { data } = await api.post("/auth/setup", adminData);
    return data;
  },

  logout(): void {
    localStorage.removeItem("authToken");
  }
};