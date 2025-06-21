"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useNotifications } from "@/contexts/NotificationContext";
import { usuariosService } from "@/services/usuarioService";

export default function CriarUsuarioPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    cargo: "vereador" as "vereador" | "admin",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpar erro do campo quando o usuário digitar
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.senha) {
      newErrors.senha = "Senha é obrigatória";
    } else if (formData.senha.length < 6) {
      newErrors.senha = "A senha deve ter pelo menos 6 caracteres";
    }

    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = "As senhas não coincidem";
    }

    if (!formData.cargo) {
      newErrors.cargo = "Cargo é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { confirmarSenha, ...userData } = formData;
      const response = await usuariosService.create(userData);

      if (response.success) {
        addNotification("Usuário criado com sucesso!", "success");

        // Limpar formulário
        setFormData({
          nome: "",
          email: "",
          senha: "",
          confirmarSenha: "",
          cargo: "vereador",
        });

        // Redirecionar após 2 segundos
        setTimeout(() => {
          router.push("/usuarios");
        }, 2000);
      } else {
        addNotification(response.error || "Erro ao criar usuário", "error");
      }
    } catch (error) {
      addNotification("Erro ao processar a solicitação", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Criar Novo Usuário
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="nome"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nome
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.nome
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                } focus:outline-none focus:ring-2`}
                placeholder="Nome completo"
              />
              {errors.nome && (
                <p className="mt-1 text-sm text-red-600">{errors.nome}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                } focus:outline-none focus:ring-2`}
                placeholder="email@exemplo.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="senha"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Senha
              </label>
              <input
                type="password"
                id="senha"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.senha
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                } focus:outline-none focus:ring-2`}
                placeholder="******"
              />
              {errors.senha && (
                <p className="mt-1 text-sm text-red-600">{errors.senha}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmarSenha"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirmar Senha
              </label>
              <input
                type="password"
                id="confirmarSenha"
                name="confirmarSenha"
                value={formData.confirmarSenha}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.confirmarSenha
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                } focus:outline-none focus:ring-2`}
                placeholder="******"
              />
              {errors.confirmarSenha && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmarSenha}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="cargo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Cargo
              </label>
              <select
                id="cargo"
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.cargo
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                } focus:outline-none focus:ring-2`}
              >
                <option value="vereador">Vereador</option>
                <option value="admin">Administrador</option>
              </select>
              {errors.cargo && (
                <p className="mt-1 text-sm text-red-600">{errors.cargo}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="px-4 py-2"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="px-4 py-2"
            >
              {isSubmitting ? "Criando..." : "Criar Usuário"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
