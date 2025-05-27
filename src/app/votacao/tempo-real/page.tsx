"use client";

import { useState, useEffect } from "react";
import { RootLayout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useSearchParams } from "next/navigation";
import { PainelVotacao } from "@/components/ui/PainelVotacao";
import { useResultadoVotacao, useRegistrarVoto } from "@/hooks/useVotacao";
import {
  NotificationsProvider,
  useNotifications,
} from "@/components/ui/Notification";
import { VotacaoAtiva } from "@/types/models";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

function VotacaoRealTimeContent() {
  const searchParams = useSearchParams();
  const votacaoIdParam = searchParams.get("id");

  const [votacaoAtiva, setVotacaoAtiva] = useState<number | null>(
    votacaoIdParam ? parseInt(votacaoIdParam) : null
  );
  const [votacoesDisponiveis, setVotacoesDisponiveis] = useState<
    VotacaoAtiva[]
  >([]);
  const [carregandoLista, setCarregandoLista] = useState(true);

  // Obter o usuário autenticado do contexto de autenticação
  const { user } = useAuth();

  const { addNotification } = useNotifications();

  // Hooks para gerenciar a votação em tempo real
  const {
    resultado,
    loading: carregandoVotacao,
    error: erroVotacao,
    ultimoVoto,
  } = useResultadoVotacao(votacaoAtiva || 0);

  const {
    registrarVoto,
    loading: registrandoVoto,
    error: erroRegistro,
  } = useRegistrarVoto();

  // Carregar lista de votações disponíveis
  useEffect(() => {
    const carregarVotacoes = async () => {
      try {
        setCarregandoLista(true);
        console.log("Carregando votações ativas...");
        const response = await api.get("/votacoes/ativas");
        const data = response.data;
        if (!response) {
          throw new Error(`Erro na requisição: ${response}`);
        }

        console.log("Votações carregadas:", data.votacoes);
        setVotacoesDisponiveis(data.votacoes || []);
      } catch (error) {
        console.error("Erro ao carregar votações:", error);
        addNotification("Erro ao carregar lista de votações", "error");
      } finally {
        setCarregandoLista(false);
      }
    };

    carregarVotacoes();
  }, [addNotification]);

  // Efeito para exibir notificações de novos votos
  useEffect(() => {
    if (ultimoVoto) {
      addNotification(
        `${ultimoVoto.vereador} ${ultimoVoto.voto} o projeto.`,
        "info"
      );
    }
  }, [ultimoVoto, addNotification]);

  // Efeito para exibir notificações de erros
  useEffect(() => {
    if (erroVotacao) {
      addNotification(
        `Erro ao carregar dados: ${erroVotacao.message}`,
        "error"
      );
    }

    if (erroRegistro) {
      addNotification(
        `Erro ao registrar voto: ${erroRegistro.message}`,
        "error"
      );
    }
  }, [erroVotacao, erroRegistro, addNotification]);

  // Função para registrar o voto
  const handleVotar = async (
    voto: "aprovar" | "desaprovar" | "abster"
  ): Promise<boolean> => {
    if (!votacaoAtiva) {
      console.error("❌ Nenhuma votação ativa selecionada");
      addNotification("Erro: Nenhuma votação selecionada", "error");
      return false;
    }

    try {
      console.log(
        `🗳️ Iniciando processo de voto: ${voto} para votação ${votacaoAtiva}`
      );

      const sucesso = await registrarVoto(votacaoAtiva, user?.id, voto);

      if (sucesso) {
        console.log("✅ Voto registrado com sucesso!");
        addNotification(
          `Seu voto "${voto}" foi registrado com sucesso!`,
          "success"
        );
        return true;
      } else {
        console.error("❌ Falha ao registrar voto");
        addNotification("Falha ao registrar o voto", "error");
        return false;
      }
    } catch (error) {
      console.error("❌ Erro no processo de votação:", error);
      addNotification(
        `Erro ao registrar voto: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`,
        "error"
      );
      return false;
    }
  };

  // Selecionar uma votação para visualizar
  const selecionarVotacao = (id: number) => {
    console.log(`Selecionando votação ${id}`);
    setVotacaoAtiva(id);

    // Atualizar a URL sem recarregar a página
    const url = new URL(window.location.href);
    url.searchParams.set("id", id.toString());
    window.history.pushState({}, "", url);
  };

  // Voltar para a lista de votações
  const voltarParaLista = () => {
    setVotacaoAtiva(null);

    // Remover o parâmetro da URL
    const url = new URL(window.location.href);
    url.searchParams.delete("id");
    window.history.pushState({}, "", url);
  };

  return (
    <div>
      {/* Cabeçalho da página */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            {votacaoAtiva ? "Votação em Tempo Real" : "Votações Ativas"}
          </h1>
          <p className="text-gray-600 mt-1">
            {votacaoAtiva
              ? "Acompanhe e participe da votação em andamento"
              : "Selecione uma votação para participar ou acompanhar"}
          </p>
        </div>

        {votacaoAtiva && (
          <Button
            variant="outline"
            onClick={voltarParaLista}
            className="flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Voltar para lista
          </Button>
        )}
      </div>

      {/* Conteúdo principal */}
      {votacaoAtiva ? (
        // Exibir painel de votação quando uma votação estiver selecionada
        carregandoVotacao ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Carregando dados da votação...</p>
          </div>
        ) : resultado ? (
          <Card className="shadow-lg border-none overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b">
                <PainelVotacao
                  votacao={resultado}
                  vereadorId={user?.id}
                  onVotar={handleVotar}
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="bg-yellow-50 border border-yellow-100 text-yellow-800 rounded-md p-6 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-3 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p className="font-medium">Erro ao carregar dados da votação.</p>
              <p className="text-sm mt-1">
                Tente novamente mais tarde ou selecione outra votação.
              </p>
            </div>
          </div>
        )
      ) : // Exibir lista de votações disponíveis
      carregandoLista ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">
            Carregando votações disponíveis...
          </p>
        </div>
      ) : votacoesDisponiveis.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {votacoesDisponiveis.map((votacao) => (
            <Card
              key={votacao.id}
              className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => selecionarVotacao(votacao.id)}
            >
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4 border-b">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-gray-800">
                    {votacao.projetoTitulo}
                  </h3>
                  <Badge
                    variant="default"
                    className="bg-green-500 hover:bg-green-600"
                  >
                    Em Votação
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Iniciada em {votacao.dataInicio}
                </div>
              </div>

              <CardContent className="p-6">
                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Progresso da Votação</span>
                    <span className="text-sm font-medium text-primary">
                      {votacao.votosRegistrados}/{votacao.totalVereadores} votos
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div
                      className="bg-primary h-3 rounded-full transition-all duration-500 ease-in-out"
                      style={{
                        width: `${
                          (votacao.votosRegistrados / votacao.totalVereadores) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center">
                    <div className="flex -space-x-2">
                      {/* Avatares simulados de vereadores */}
                      {[...Array(Math.min(3, votacao.votosRegistrados))].map(
                        (_, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium"
                          >
                            V{i + 1}
                          </div>
                        )
                      )}
                      {votacao.votosRegistrados > 3 && (
                        <div className="w-8 h-8 rounded-full bg-primary text-white border-2 border-white flex items-center justify-center text-xs font-medium">
                          +{votacao.votosRegistrados - 3}
                        </div>
                      )}
                    </div>
                    <span className="ml-3 text-sm text-gray-600">
                      já votaram
                    </span>
                  </div>
                  <Button variant="primary" className="px-4 py-2">
                    Participar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-gray-50 border-dashed">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-gray-600 text-lg">
              Não há votações em andamento no momento.
            </p>
            <p className="text-gray-500 mt-2">
              As votações ativas aparecerão aqui quando iniciadas.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Seção informativa */}
      {!votacaoAtiva && (
        <div className="mt-12 bg-gray-50 rounded-xl p-8 border border-gray-100">
          <h3 className="text-xl font-bold mb-4 text-primary">
            Como funciona a votação
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-primary font-bold text-xl">1</span>
              </div>
              <h4 className="font-medium mb-2">Selecione uma votação</h4>
              <p className="text-gray-600 text-sm">
                Escolha entre as votações ativas disponíveis para participar ou
                acompanhar.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-primary font-bold text-xl">2</span>
              </div>
              <h4 className="font-medium mb-2">Registre seu voto</h4>
              <p className="text-gray-600 text-sm">
                Como vereador, você pode aprovar, reprovar ou abster-se na
                votação do projeto.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-primary font-bold text-xl">3</span>
              </div>
              <h4 className="font-medium mb-2">Acompanhe em tempo real</h4>
              <p className="text-gray-600 text-sm">
                Visualize os resultados e votos dos demais vereadores em tempo
                real.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VotacaoTempoRealPage() {
  return (
    <NotificationsProvider>
      <RootLayout>
        <div className="container mx-auto py-8 px-4">
          <VotacaoRealTimeContent />
        </div>
      </RootLayout>
    </NotificationsProvider>
  );
}
