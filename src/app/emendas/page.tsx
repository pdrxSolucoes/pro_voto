// src/app/emendas/page.tsx - versão atualizada
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { RootLayout } from "@/components/Layout";
import { EmendaCard } from "@/components/ui/Card/EmendaCard";
import { Button } from "@/components/ui/Button";
import {
  useNotifications,
  NotificationsProvider,
} from "@/components/ui/Notification";
import { EmendaFormModal } from "@/components/ui/Modal/ModalEmenda";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface Emenda {
  id: number;
  titulo: string;
  descricao: string;
  data_apresentacao: string;
  status: "pendente" | "em_votacao" | "aprovada" | "reprovada";
}

// Configuração do Axios com baseURL relativa
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Set up Axios interceptor to include auth token
api.interceptors.request.use((config) => {
  // Verifica se estamos no navegador antes de acessar localStorage
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Novo interceptor para tratar erros 401 sem causar redirecionamentos infinitos
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Não redirecionamos aqui para evitar loops
    // Apenas propagamos o erro para ser tratado no componente
    return Promise.reject(error);
  }
);

function EmendasContent() {
  const [emendas, setEmendas] = useState<Emenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emendaEmEdicao, setEmendaEmEdicao] = useState<Emenda | undefined>(
    undefined
  );

  // Use o contexto de autenticação e o router
  const { isAdmin, user, loading: authLoading } = useAuth();
  const { addNotification } = useNotifications();
  const router = useRouter();

  // Verificar autenticação antes de carregar dados
  useEffect(() => {
    // Aguardar a verificação de autenticação terminar
    if (!authLoading) {
      if (!user) {
        // Redirecionar para login se não estiver autenticado
        router.push("/login");
      } else {
        // Carregar emendas apenas se estiver autenticado
        carregarEmendas();
      }
    }
  }, [user, authLoading, router]);

  async function carregarEmendas() {
    try {
      setLoading(true);

      // Verificar token antes de fazer a requisição
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Usuário não autenticado");
      }

      // Usando Axios para buscar as emendas
      const response = await api.get("/emendas");
      console.log("res emendas", response.data);
      setEmendas(response.data.data);
      setError(null);
    } catch (err) {
      console.error("Erro ao carregar emendas:", err);

      // Tratamento de erro do Axios
      if (axios.isAxiosError(err)) {˝
        // Verificar se é um erro de autenticação
        if (err.response?.status === 401) {
          // Em vez de redirecionar aqui, apenas mostramos a mensagem
          addNotification("Sessão expirada. Faça login novamente.", "error");
          setError(new Error("Sessão expirada. Faça login novamente."));

          // Limpar token e redirecionar manualmente
          localStorage.removeItem("authToken");
          router.push("/login");
          return;
        }

        // Verificar se é um erro de rede
        if (err.code === "ECONNABORTED" || !err.response) {
          const errorMessage =
            "Erro de conexão com o servidor. Verifique se o servidor da API está em execução.";
          setError(new Error(errorMessage));
          addNotification(errorMessage, "error");
        } else {
          const errorMessage =
            err.response?.data?.error ||
            `Erro ao carregar emendas: ${err.message}`;
          setError(new Error(errorMessage));
          addNotification(errorMessage, "error");
        }
      } else {
        setError(
          err instanceof Error ? err : new Error("Erro ao carregar emendas")
        );
        addNotification("Erro ao carregar emendas", "error");
      }
    } finally {
      setLoading(false);
    }
  }

  const handleIniciarVotacao = async (id: number) => {
    try {
      // Usando Axios para iniciar a votação
      await api.post(`/emendas/${id}/iniciar-votacao`);

      // Recarregar emendas para atualizar a lista
      await carregarEmendas();

      addNotification(`Votação iniciada para a emenda #${id}`, "success");
    } catch (err) {
      console.error("Erro ao iniciar votação:", err);

      // Tratamento de erro do Axios
      if (axios.isAxiosError(err)) {
        // Verificar se é um erro de rede
        if (err.code === "ECONNABORTED" || !err.response) {
          addNotification(
            "Erro de conexão com o servidor. Verifique se o servidor da API está em execução.",
            "error"
          );
        } else {
          const errorMessage =
            err.response?.data?.error ||
            `Erro ao iniciar votação: ${err.message}`;
          addNotification(errorMessage, "error");
        }
      } else {
        addNotification("Erro ao iniciar votação", "error");
      }
    }
  };

  const handleVerDetalhes = (id: number) => {
    // Em uma implementação real, redirecionaria para a página de detalhes
    window.location.href = `/emendas/${id}`;
  };

  const handleEditar = (id: number) => {
    const emenda = emendas.find((e) => e.id === id);
    if (emenda) {
      setEmendaEmEdicao(emenda);
      setIsModalOpen(true);
    }
  };

  const handleNovaEmenda = () => {
    setEmendaEmEdicao(undefined);
    setIsModalOpen(true);
  };

  const handleSalvarEmenda = async (emendaData: any) => {
    const isEditMode = !!emendaEmEdicao;

    try {
      if (isEditMode) {
        // Atualizar emenda existente usando Axios
        await api.put(`/emendas/${emendaEmEdicao!.id}`, emendaData);
        addNotification("Emenda atualizada com sucesso!", "success");
      } else {
        // Criar nova emenda usando Axios
        console.log("Enviando dados para criar emenda:", emendaData);
        const response = await api.post("/emendas", {
          titulo: emendaData.titulo,
          descricao: emendaData.descricao,
        });
        console.log("Resposta da API:", response.data);
        addNotification("Emenda criada com sucesso!", "success");
      }

      // Fechar o modal depois de salvar
      setIsModalOpen(false);

      // Recarregar emendas para atualizar a lista
      await carregarEmendas();
    } catch (err) {
      console.error(
        `Erro ao ${isEditMode ? "atualizar" : "criar"} emenda:`,
        err
      );

      // Tratamento de erro do Axios
      if (axios.isAxiosError(err)) {
        // Verificar se é um erro de autenticação
        if (err.response?.status === 401) {
          addNotification("Sessão expirada. Faça login novamente.", "error");

          // Limpar token e redirecionar manualmente
          localStorage.removeItem("authToken");
          router.push("/login");
          return;
        }

        // Verificar se é um erro de rede
        if (err.code === "ECONNABORTED" || !err.response) {
          const errorMessage =
            "Erro de conexão com o servidor. Verifique se o servidor da API está em execução.";
          addNotification(errorMessage, "error");
          throw new Error(errorMessage);
        } else {
          const errorMessage =
            err.response?.data?.error ||
            `Erro ao ${isEditMode ? "atualizar" : "criar"} emenda: ${
              err.message
            }`;
          addNotification(errorMessage, "error");
          throw new Error(errorMessage);
        }
      } else {
        addNotification(
          `Erro ao ${isEditMode ? "atualizar" : "criar"} emenda`,
          "error"
        );
        throw err; // Propagar o erro para ser tratado no componente do modal
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Emendas</h1>

        {isAdmin && (
          <Button variant="primary" onClick={handleNovaEmenda}>
            Nova Emenda
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
          <h3 className="font-semibold mb-2">Erro ao carregar emendas</h3>
          <p>{error.message}</p>
          <div className="mt-4">
            <Button variant="secondary" size="sm" onClick={carregarEmendas}>
              Tentar novamente
            </Button>
          </div>
        </div>
      ) : emendas.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-100 text-yellow-800 rounded-md p-4">
          <p>Nenhuma emenda encontrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {emendas.length > 0 &&
            emendas.map((emenda) => (
              <EmendaCard
                key={emenda.id}
                id={emenda.id}
                titulo={emenda.titulo}
                descricao={emenda.descricao}
                dataApresentacao={emenda.data_apresentacao}
                status={emenda.status}
                onIniciarVotacao={handleIniciarVotacao}
                onVerDetalhes={handleVerDetalhes}
                onEditar={handleEditar}
                isAdmin={isAdmin}
              />
            ))}
        </div>
      )}

      {/* Modal para criar/editar emendas */}
      <EmendaFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        emenda={emendaEmEdicao}
        onSave={handleSalvarEmenda}
      />
    </div>
  );
}

export default function EmendasPage() {
  return (
    <NotificationsProvider>
      <RootLayout>
        <div className="container mx-auto py-8 px-4">
          <EmendasContent />
        </div>
      </RootLayout>
    </NotificationsProvider>
  );
}
