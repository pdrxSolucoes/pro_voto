// src/app/setup/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function SetupPage() {
  const router = useRouter();
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Verificar se já existe um admin
  useEffect(() => {
    const checkSetup = async () => {
      try {
        const response = await axios.get("/api/auth/setup");
        setHasAdmin(response.data.hasAdmin);

        // Se já existir um admin, redirecione para a página de login após um breve delay
        if (response.data.hasAdmin) {
          setTimeout(() => {
            router.push("/login");
          }, 3000);
        }
      } catch (error) {
        setError("Erro ao verificar configuração do sistema");
      } finally {
        setLoading(false);
      }
    };

    checkSetup();
  }, [router]);

  // Função para criar o primeiro admin
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (senha !== confirmSenha) {
      setError("As senhas não coincidem");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const response = await axios.post("/api/auth/setup", {
        nome,
        email,
        senha,
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch (error: any) {
      setError(error.response?.data?.error || "Erro ao criar administrador");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Sistema de Votação</h1>
          <p>Verificando configuração do sistema...</p>
        </div>
      </div>
    );
  }

  if (hasAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4 text-center">
            Sistema já configurado
          </h1>
          <p className="mb-4 text-center">
            O sistema já possui um administrador configurado.
          </p>
          <p className="text-center">
            Redirecionando para a página de login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Configuração Inicial
        </h1>
        <p className="mb-6 text-center">
          Crie o primeiro usuário administrador para começar a usar o sistema.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-center">
            Administrador criado com sucesso! Redirecionando para o login...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="nome"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nome Completo
            </label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex.: João da Silva"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex.: admin@exemplo.com"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="senha"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Senha
            </label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Crie uma senha forte"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="confirmSenha"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirmar Senha
            </label>
            <input
              id="confirmSenha"
              type="password"
              value={confirmSenha}
              onChange={(e) => setConfirmSenha(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Repita a senha"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || success}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {submitting ? "Criando..." : "Criar Administrador"}
          </button>
        </form>
      </div>
    </div>
  );
}
