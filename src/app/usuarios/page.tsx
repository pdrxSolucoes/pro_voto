"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { usuariosService } from "@/services/usuariosService";
import { RootLayout } from "@/components/Layout";
import { useNotifications } from "@/contexts/NotificationContext";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  cargo: string;
  ativo: boolean;
  data_criacao: string;
}

function UsuariosContent() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotifications();

  useEffect(() => {
    const fetchUsuarios = async () => {
      setIsLoading(true);
      try {
        const response = await usuariosService.getAll();
        if (response.success) {
          setUsuarios(response.data);
        } else {
          setError(response.error || "Erro ao carregar usuários");
          addNotification(response.error || "Erro ao carregar usuários", "error");
        }
      } catch (err) {
        setError("Erro ao carregar usuários");
        addNotification("Erro ao carregar usuários", "error");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsuarios();
  }, [addNotification]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Usuários</h1>
        <div className="flex space-x-2">
          <Link href="/">
            <Button variant="outline">Voltar ao Menu</Button>
          </Link>
          <Link href="/usuarios/criar">
            <Button variant="primary">Novo Usuário</Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-confresa-azul"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Erro! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      ) : usuarios.length === 0 ? (
        <div className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-8 rounded text-center">
          <p className="text-lg">Nenhum usuário cadastrado.</p>
          <Link href="/usuarios/criar" className="text-confresa-azul hover:underline mt-2 inline-block">
            Clique aqui para criar o primeiro usuário
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Nome
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Cargo
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Data de Criação
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usuarios.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {usuario.nome}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{usuario.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {usuario.cargo === "admin" ? "Administrador" : "Vereador"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        usuario.ativo
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {usuario.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(usuario.data_criacao)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/usuarios/${usuario.id}`}
                      className="text-confresa-azul hover:text-confresa-azul/80 mr-4"
                    >
                      Detalhes
                    </Link>
                    <Link
                      href={`/usuarios/${usuario.id}/editar`}
                      className="text-confresa-azul hover:text-confresa-azul/80"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function UsuariosPage() {
  return (
    <RootLayout>
      <div className="container mx-auto py-8 px-4">
        <UsuariosContent />
      </div>
    </RootLayout>
  );
}