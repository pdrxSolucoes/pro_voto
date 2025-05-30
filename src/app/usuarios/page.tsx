"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { usuarioService, Usuario } from "@/services/usuarioService";
import { RootLayout } from "@/components/Layout";
import { useNotifications } from "@/contexts/NotificationContext";
import { UsuarioFormModal } from "@/components/ui/Modal/ModalUsuario";

function UsuariosContent() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usuarioEmEdicao, setUsuarioEmEdicao] = useState<Usuario | undefined>(
    undefined
  );
  const [limiteUsuariosAtingido, setLimiteUsuariosAtingido] = useState(false);
  const { addNotification } = useNotifications();

  const fetchUsuarios = async () => {
    setIsLoading(true);
    try {
      const data = await usuarioService.getUsuarios();
      setUsuarios(data);

      // Verificar limite de usuários ativos
      const usuariosAtivos = data.filter((u) => u.ativo).length;
      setLimiteUsuariosAtingido(usuariosAtivos >= 12);

      setError(null);
    } catch (err) {
      setError("Erro ao carregar usuários");
      addNotification("Erro ao carregar usuários", "error");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleNovoUsuario = async () => {
    if (limiteUsuariosAtingido) {
      addNotification(
        "Limite de 12 usuários ativos atingido. Desative um usuário antes de criar outro.",
        "error"
      );
    }

    setUsuarioEmEdicao(undefined);
    setIsModalOpen(true);
  };

  const handleEditarUsuario = async (id: number) => {
    try {
      setIsLoading(true);
      const usuario = await usuarioService.getUsuarioById(id);
      setUsuarioEmEdicao(usuario);
      setIsModalOpen(true);
    } catch (err) {
      addNotification("Erro ao carregar dados do usuário", "error");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSalvarUsuario = async (data: any) => {
    try {
      if (data.id) {
        // Edição de usuário existente
        await usuarioService.updateUsuario(data.id, {
          nome: data.nome,
          email: data.email,
          cargo: data.cargo,
        });
        addNotification("Usuário atualizado com sucesso!", "success");
      } else {
        // Criação de novo usuário
        if (limiteUsuariosAtingido) {
          addNotification(
            "Limite de 12 usuários ativos atingido. Desative um usuário antes de criar outro.",
            "error"
          );
          throw new Error("Limite de usuários atingido");
        }

        await usuarioService.createUsuario({
          nome: data.nome,
          email: data.email,
          cargo: data.cargo,
          senha: data.senha,
          ativo: true,
          data_criacao: new Date(),
        });
        addNotification("Usuário criado com sucesso!", "success");
      }

      setIsModalOpen(false);
      fetchUsuarios(); // Atualiza a lista de usuários
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Erro ao salvar usuário";
      if (errorMsg !== "Limite de usuários atingido") {
        addNotification(errorMsg, "error");
      }
      throw err;
    }
  };

  const handleDesativarUsuario = async (id: number) => {
    try {
      await usuarioService.updateUsuario(id, { ativo: false });
      addNotification("Usuário desativado com sucesso!", "success");
      fetchUsuarios(); // Atualiza a lista de usuários
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Erro ao desativar usuário";
      addNotification(errorMsg, "error");
      throw err;
    }
  };

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Usuários</h1>
        <div className="flex space-x-2">
          <Link href="/">
            <Button variant="outline">Voltar ao Menu</Button>
          </Link>
          <Button variant="primary" onClick={handleNovoUsuario}>
            Novo Usuário
          </Button>
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
          <Button
            variant="link"
            className="text-confresa-azul hover:underline mt-2"
            onClick={handleNovoUsuario}
          >
            Clique aqui para criar o primeiro usuário
          </Button>
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
                    {usuario.data_criacao && formatDate(usuario.data_criacao)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="link"
                      className="text-confresa-azul hover:text-confresa-azul/80 mr-4"
                      onClick={() => handleEditarUsuario(usuario.id)}
                    >
                      Editar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de criação/edição de usuário */}
      <UsuarioFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        usuario={usuarioEmEdicao}
        onSave={handleSalvarUsuario}
        onDesativar={handleDesativarUsuario}
        limiteUsuariosAtingido={limiteUsuariosAtingido}
      />
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
