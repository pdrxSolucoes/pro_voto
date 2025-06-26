"use client";

import { useState, useEffect } from "react";
import { RootLayout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { dashboardService } from "@/services/dashboardService";
import { votacaoService } from "@/services/votacaoService";
import { setupService } from "@/services/setupService";
import Image from "next/image";
import { VotacaoCard } from "@/components/ui/Card/VotacaoCard";
import type { VotacaoInterface } from "@/interfaces/VotacaoInterface";

interface HomeContent {
  projetosPendentes: number;
  projetosAprovadas: number;
  projetosReprovadas: number;
}

function HomePageContent() {
  const [data, setData] = useState<HomeContent | null>(null);
  const [votacoesAtivas, setVotacoesAtivas] = useState<VotacaoInterface[]>([]);
  const [loadingHome, setLoadingHome] = useState(true);
  const [loadingVotacoes, setLoadingVotacoes] = useState(true);

  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const { hasAdmin } = await setupService.checkSetup();

        if (!hasAdmin) {
          router.push("/setup");
          return;
        }

        if (isAuthenticated) {
          router.push("/");
          return;
        }

        router.push("/login");
      } catch (error) {
        console.error("Erro ao verificar configuração:", error);
        router.push("/login");
      } finally {
        setLoadingHome(false);
      }
    };

    if (!authLoading) {
      checkSetup();
    }
  }, [isAuthenticated, authLoading, router]);

  // Carregar dados iniciais
  useEffect(() => {
    carregarDados();
    carregarVotacoes();
  }, []);

  async function carregarDados() {
    try {
      setLoadingHome(true);
      const homeData = await dashboardService.getDashboardData();
      setData(homeData);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoadingHome(false);
    }
  }

  async function carregarVotacoes() {
    try {
      setLoadingVotacoes(true);
      const votacoes = await votacaoService.getVotacoesAtivas();
      setVotacoesAtivas(votacoes);
    } catch (err) {
      console.error("Erro ao carregar votações:", err);
      setVotacoesAtivas([]);
    } finally {
      setLoadingVotacoes(false);
    }
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-8 mb-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0">
            <h1 className="text-4xl font-bold mb-3">Sistema de Votação</h1>
            <p className="text-xl opacity-90 mb-6">
              Câmara Municipal de Vereadores de Confresa
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/projetos">
                <Button
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30 font-medium px-6 py-3 text-base"
                >
                  Ver Projetos
                </Button>
              </Link>
              <Link href="/votacao/tempo-real">
                <Button
                  variant="secondary"
                  className="font-medium px-6 py-3 text-base"
                >
                  Votações Ativas
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative h-48 w-48">
            <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <Image
                src="/brasao-confresa.svg"
                alt="Brasão de Confresa"
                width={160}
                height={160}
                className="p-2"
                onError={(e) => {
                  // Fallback caso a imagem não exista
                  e.currentTarget.src = "/vercel.svg";
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {loadingHome ? (
        <div className="flex flex-col items-center justify-center p-12">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Carregando informações...</p>
        </div>
      ) : data ? (
        <>
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="border-t-4 border-t-primary shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Projetos Pendentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-primary">
                  {data.projetosPendentes}
                </div>
                <p className="text-sm text-gray-500 mt-2">Aguardando votação</p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-green-500 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Projetos Aprovados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-green-600">
                  {data.projetosAprovadas}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Aprovados pela câmara
                </p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-red-500 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Projetos Reprovados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-red-600">
                  {data.projetosReprovadas}
                </div>
                <p className="text-sm text-gray-500 mt-2">Não aprovados</p>
              </CardContent>
            </Card>
          </div>

          {/* Votações em Andamento */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <h2 className="text-2xl font-bold">Votações em Andamento</h2>
              <div className="ml-3 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>

            {loadingVotacoes ? (
              <div className="flex flex-col items-center justify-center p-12">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Carregando votações...</p>
              </div>
            ) : votacoesAtivas.length === 0 ? (
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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {votacoesAtivas.map((votacao) => (
                  <VotacaoCard
                    key={votacao.id}
                    votacao={votacao}
                    isClickable={false}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Seção Informativa */}
          <div className="bg-gray-50 rounded-xl p-8 border border-gray-100">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-4 text-primary">
                  Sobre o Sistema
                </h3>
                <p className="text-gray-700 mb-4">
                  O Sistema de Votação da Câmara Municipal de Confresa foi
                  desenvolvido para trazer mais transparência e agilidade ao
                  processo legislativo municipal.
                </p>
                <p className="text-gray-700">
                  Acompanhe em tempo real as votações, consulte projetos e fique
                  por dentro das decisões que impactam o município.
                </p>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-4 text-primary">
                  Acesso Rápido
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/projetos"
                      className="flex items-center text-gray-700 hover:text-primary transition-colors"
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Lista de Projetos
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/votacao/tempo-real"
                      className="flex items-center text-gray-700 hover:text-primary transition-colors"
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
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      Votações em Tempo Real
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/login"
                      className="flex items-center text-gray-700 hover:text-primary transition-colors"
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
                          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                        />
                      </svg>
                      Área do Vereador
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
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
            <p className="font-medium">Erro ao carregar dados do sistema.</p>
            <p className="text-sm mt-1">
              Tente novamente mais tarde ou contate o suporte.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <RootLayout>
      <div className="container mx-auto py-8 px-4">
        <HomePageContent />
      </div>
    </RootLayout>
  );
}
