// src/components/DevAuthHelper.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";

export function DevAuthHelper() {
  const { user, login, logout, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [testUser, setTestUser] = useState<{
    email: string;
    senha: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSetup = async () => {
      try {
        // Verificar se existe um usuário de teste
        const response = await axios.get("/api/auth/setup");

        if (response.data.testUserAvailable) {
          setTestUser({
            email: response.data.testCredentials.email,
            senha: response.data.testCredentials.senha,
          });
        }
      } catch (err) {
        setError("Erro ao verificar usuário de teste");
        console.error("Erro ao verificar usuário de teste:", err);
      } finally {
        setLoading(false);
      }
    };

    checkSetup();
  }, []);

  const handleTestLogin = async () => {
    if (!testUser) return;

    try {
      setLoading(true);
      await login(testUser.email, testUser.senha);
    } catch (err) {
      setError("Erro ao fazer login com usuário de teste");
      console.error("Erro ao fazer login com usuário de teste:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed top-0 right-0 m-4 p-4 bg-gray-100 border rounded shadow-md max-w-sm z-50">
        <p>Carregando helper de desenvolvimento...</p>
      </div>
    );
  }

  return (
    <div className="fixed top-0 right-0 m-4 p-4 bg-gray-100 border rounded shadow-md max-w-sm z-50 invisible">
      <h3 className="text-lg font-bold mb-2">Helper de Desenvolvimento</h3>

      {error && (
        <div className="mb-2 p-2 bg-red-100 text-red-800 rounded text-sm">
          {error}
        </div>
      )}

      <div className="mb-3">
        <p className="font-medium">
          Status: {isAuthenticated ? "Autenticado" : "Não autenticado"}
        </p>
        {isAuthenticated && user && (
          <div className="mt-1 text-sm">
            <p>Nome: {user.nome}</p>
            <p>Email: {user.email}</p>
            <p>Cargo: {user.cargo}</p>
          </div>
        )}
      </div>

      {testUser && (
        <div className="mb-3 text-sm">
          <p className="font-medium">Usuário de Teste:</p>
          <p>Email: {testUser.email}</p>
          <p>Senha: {testUser.senha}</p>
        </div>
      )}

      <div className="flex gap-2">
        {testUser && !isAuthenticated && (
          <button
            onClick={handleTestLogin}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Login com Teste
          </button>
        )}

        {isAuthenticated && (
          <button
            onClick={logout}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
}
