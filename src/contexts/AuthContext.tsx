"use client";

// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

interface User {
  id: number;
  nome: string;
  email: string;
  cargo: "admin" | "vereador";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
  isAdmin: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        try {
          // Set default auth header
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error("Error loading user from storage:", error);
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post("/api/auth/login", {
        email,
        senha: password, // Modificado aqui para usar 'senha' em vez de 'password'
      });
      const { token, user } = response.data;

      // Save to localStorage
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Set default auth header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser(user);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.cargo === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
