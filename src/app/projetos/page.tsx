"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { RootLayout } from "@/components/Layout";
import { Button } from "@/components/ui/Button";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { ProjetoCard } from "@/components/ui/Card/ProjetoCard";
import { ProjetoFormModal } from "@/components/ui/Modal/ModalProjeto";
import { useNotifications } from "@/contexts/NotificationContext";

interface Projeto {
  id: number;
  titulo: string;
  descricao: string;
  data_apresentacao: string;
  status: "pendente" | "em_votacao" | "aprovada" | "reprovada";
}

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

function ProjetosContent() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projetoEmEdicao, setProjetoEmEdicao] = useState<Projeto | undefined>(
    undefined
  );

  const { isAdmin, user, loading: authLoading } = useAuth();
  const { addNotification } = useNotifications();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else {
        carregarProjetos();
      }
    }
  }, [user, authLoading, router]);

  async function carregarProjetos() {
    try {
      setLoading(true);

      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Usuário não autenticado");

      const response = await api.get("/projetos");
      setProjetos(response.data.data);
      setError(null);
    } catch (err) {
      console.error("Erro ao carregar projetos:", err);

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          addNotification("Sessão expirada. Faça login novamente.", "error");
          setError(new Error("Sessão expirada. Faça login novamente."));
          localStorage.removeItem("authToken");
          router.push("/login");
          return;
        }

        if (err.code === "ECONNABORTED" || !err.response) {
          const msg =
            "Erro de conexão com o servidor. Verifique se o servidor da API está em execução.";
          setError(new Error(msg));
          addNotification(msg, "error");
        } else {
          const msg =
            err.response?.data?.error ||
            `Erro ao carregar projetos: ${err.message}`;
          setError(new Error(msg));
          addNotification(msg, "error");
        }
      } else {
        setError(
          err instanceof Error ? err : new Error("Erro ao carregar projetos")
        );
        addNotification("Erro ao carregar projetos", "error");
      }
    } finally {
      setLoading(false);
    }
  }

  const handleIniciarVotacao = async (id: number) => {
    try {
      await api.post(`/projetos/${id}/iniciar-votacao`);
      await carregarProjetos();
      addNotification(`Votação iniciada para o projeto #${id}`, "success");
    } catch (err) {
      console.error("Erro ao iniciar votação:", err);

      if (axios.isAxiosError(err)) {
        if (err.code === "ECONNABORTED" || !err.response) {
          addNotification(
            "Erro de conexão com o servidor. Verifique se o servidor da API está em execução.",
            "error"
          );
        } else {
          const msg =
            err.response?.data?.error ||
            `Erro ao iniciar votação: ${err.message}`;
          addNotification(msg, "error");
        }
      } else {
        addNotification("Erro ao iniciar votação", "error");
      }
    }
  };

  const handleVerDetalhes = (id: number) => {
    window.location.href = `/projetos/${id}`;
  };

  const handleEditar = (id: number) => {
    const projeto = projetos.find((p) => p.id === id);
    if (projeto) {
      setProjetoEmEdicao(projeto);
      setIsModalOpen(true);
    }
  };

  const handleNovoProjeto = () => {
    setProjetoEmEdicao(undefined);
    setIsModalOpen(true);
  };

  const handleSalvarProjeto = async (projetoData: any) => {
    const isEditMode = !!projetoEmEdicao;

    try {
      if (isEditMode) {
        await api.put(`/projetos/${projetoEmEdicao!.id}`, projetoData);
        addNotification("Projeto atualizado com sucesso!", "success");
      } else {
        await api.post("/projetos", {
          titulo: projetoData.titulo,
          descricao: projetoData.descricao,
        });
        addNotification("Projeto criado com sucesso!", "success");
      }

      setIsModalOpen(false);
      await carregarProjetos();
    } catch (err) {
      console.error(
        `Erro ao ${isEditMode ? "atualizar" : "criar"} projeto:`,
        err
      );

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          addNotification("Sessão expirada. Faça login novamente.", "error");
          localStorage.removeItem("authToken");
          router.push("/login");
          return;
        }

        if (err.code === "ECONNABORTED" || !err.response) {
          const msg =
            "Erro de conexão com o servidor. Verifique se o servidor da API está em execução.";
          addNotification(msg, "error");
          throw new Error(msg);
        } else {
          const msg =
            err.response?.data?.error ||
            `Erro ao ${isEditMode ? "atualizar" : "criar"} projeto: ${
              err.message
            }`;
          addNotification(msg, "error");
          throw new Error(msg);
        }
      } else {
        addNotification(
          `Erro ao ${isEditMode ? "atualizar" : "criar"} projeto`,
          "error"
        );
        throw err;
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projetos</h1>

        {isAdmin && (
          <Button variant="primary" onClick={handleNovoProjeto}>
            Novo Projeto
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
          <h3 className="font-semibold mb-2">Erro ao carregar projetos</h3>
          <p>{error.message}</p>
          <div className="mt-4">
            <Button variant="secondary" size="sm" onClick={carregarProjetos}>
              Tentar novamente
            </Button>
          </div>
        </div>
      ) : projetos.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-100 text-yellow-800 rounded-md p-4">
          <p>Nenhum projeto encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projetos.map((projeto) => (
            <ProjetoCard
              key={projeto.id}
              id={projeto.id}
              titulo={projeto.titulo}
              descricao={projeto.descricao}
              dataApresentacao={projeto.data_apresentacao}
              status={projeto.status}
              onIniciarVotacao={handleIniciarVotacao}
              onVerDetalhes={handleVerDetalhes}
              onEditar={handleEditar}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      <ProjetoFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projeto={projetoEmEdicao}
        onSave={handleSalvarProjeto}
      />
    </div>
  );
}

export default function ProjetosPage() {
  return (
    <RootLayout>
      <div className="container mx-auto py-8 px-4">
        <ProjetosContent />
      </div>
    </RootLayout>
  );
}
