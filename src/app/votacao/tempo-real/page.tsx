"use client";

import { useState, useEffect } from "react";
import { RootLayout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRouter, useSearchParams } from "next/navigation";
import { PainelVotacao } from "@/components/ui/PainelVotacao";
import { useResultadoVotacao, useRegistrarVoto } from "@/hooks/useVotacao";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { VotacaoCard } from "@/components/ui/Card/VotacaoCard";
import { useAutoFinalizarVotacao } from "@/hooks/useAutoFinalizarVotacao";
import { useFinalizarVotacao } from "@/hooks/useFinalizarVotacao";
import type { VotacaoInterface } from "@/interfaces/VotacaoInterface";
import { votacaoService } from "@/services/votacaoService";

function VotacaoRealTimeContent() {
  const searchParams = useSearchParams();
  const votacaoIdParam = searchParams.get("id");
  const router = useRouter();

  const [votacaoAtiva, setVotacaoAtiva] = useState<number | null>(() => {
    const id = Number(votacaoIdParam);
    return isNaN(id) ? null : id;
  });

  const [votacoesDisponiveis, setVotacoesDisponiveis] = useState<
    VotacaoInterface[]
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

  // Hook para monitorar e finalizar automaticamente votações com 12 votos
  const { iniciarMonitoramento, pararMonitoramento, isMonitoring, lastResult } =
    useAutoFinalizarVotacao(votacaoAtiva || undefined);

  const {
    registrarVoto,
    loading: registrandoVoto,
    error: erroRegistro,
  } = useRegistrarVoto();

  // Hook para finalizar manualmente a votação
  const {
    finalizarVotacao,
    loading: finalizandoVotacao,
    error: erroFinalizacao,
    success: sucessoFinalizacao,
  } = useFinalizarVotacao();

  // Carregar lista de votações disponíveis
  useEffect(() => {
    const carregarVotacoes = async () => {
      try {
        setCarregandoLista(true);
        console.log("📋 Carregando votações ativas...");
        const data = await votacaoService.getVotacoesAtivas();
        console.log("✅ Votações carregadas:", data);
        setVotacoesDisponiveis(data || []);
      } catch (error) {
        console.error("❌ Erro ao carregar votações:", error);
        addNotification("Erro ao carregar lista de votações", "error");
        setVotacoesDisponiveis([]);
      } finally {
        setCarregandoLista(false);
      }
    };

    carregarVotacoes();
  }, [addNotification]);

  // Efeito para iniciar o monitoramento automático quando uma votação estiver ativa
  useEffect(() => {
    if (votacaoAtiva) {
      console.log(
        `🔍 Iniciando monitoramento automático da votação ${votacaoAtiva}`
      );
      iniciarMonitoramento();
    } else {
      pararMonitoramento();
    }

    return () => {
      pararMonitoramento();
    };
  }, [votacaoAtiva, iniciarMonitoramento, pararMonitoramento]);

  // Efeito para notificar quando uma votação for finalizada automaticamente
  useEffect(() => {
    if (lastResult && lastResult.votacoes_finalizadas > 0) {
      addNotification(
        `Votação finalizada automaticamente com ${
          lastResult.detalhes[0]?.contagem?.favor || 0
        } votos a favor e ${
          lastResult.detalhes[0]?.contagem?.contra || 0
        } votos contra.`,
        "success"
      );
    }
  }, [lastResult, addNotification]);

  // Efeito para exibir notificações de erros
  useEffect(() => {
    if (erroVotacao && votacaoAtiva) {
      console.log(`❌ Erro na votação ${votacaoAtiva}:`, erroVotacao.message);
      addNotification(
        `Erro ao carregar dados: ${erroVotacao.message}`,
        "error"
      );
    }

    if (erroRegistro) {
      console.log(`❌ Erro no registro:`, erroRegistro.message);
      addNotification(
        `Erro ao registrar voto: ${erroRegistro.message}`,
        "error"
      );
    }

    if (erroFinalizacao) {
      console.log(`❌ Erro na finalização:`, erroFinalizacao);
      addNotification(`Erro ao finalizar votação: ${erroFinalizacao}`, "error");
    }
  }, [
    erroVotacao,
    erroRegistro,
    erroFinalizacao,
    addNotification,
    votacaoAtiva,
  ]);

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

  // Função para finalizar manualmente a votação
  const handleFinalizarVotacao = async (): Promise<void> => {
    if (!votacaoAtiva) {
      console.error("❌ Nenhuma votação ativa selecionada");
      addNotification("Erro: Nenhuma votação selecionada", "error");
      return;
    }

    try {
      console.log(`🏁 Finalizando manualmente a votação ${votacaoAtiva}`);

      const resultado = await finalizarVotacao(votacaoAtiva);

      if (resultado && resultado.success) {
        console.log("✅ Votação finalizada com sucesso:", resultado);
        const resultadoMsg =
          "resultado" in resultado ? resultado.resultado : "finalizada";
        addNotification(
          `Votação finalizada com sucesso! Resultado: ${resultadoMsg}`,
          "success"
        );
      } else {
        console.error("❌ Falha ao finalizar votação");
        const errorMsg =
          resultado && "error" in resultado
            ? resultado.error
            : "Erro desconhecido";
        addNotification(`Falha ao finalizar votação: ${errorMsg}`, "error");
      }
    } catch (error) {
      console.error("❌ Erro ao finalizar votação:", error);
      addNotification(
        `Erro ao finalizar votação: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`,
        "error"
      );
    }
  };

  // Selecionar uma votação para visualizar
  const selecionarVotacao = (id: number) => {
    console.log(`📌 Selecionando votação: ${id}`);
    setVotacaoAtiva(id);
    router.push(`?id=${id}`, { scroll: false });
  };

  // Voltar para a lista de votações
  const voltarParaLista = () => {
    console.log(`🔙 Voltando para lista`);
    setVotacaoAtiva(null);
    router.push("/votacao/tempo-real", { scroll: false });
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
                  isAdmin={user?.cargo === "admin"}
                  onFinalizar={handleFinalizarVotacao}
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
            <VotacaoCard
              key={votacao.id}
              votacao={votacao}
              onSelect={selecionarVotacao}
              isClickable={true}
            />
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
    <RootLayout>
      <div className="container mx-auto py-8 px-4">
        <VotacaoRealTimeContent />
      </div>
    </RootLayout>
  );
}
