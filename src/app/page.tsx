"use client";

import { useState, useEffect } from "react";
import { RootLayout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import axios from "axios";

interface VotacaoAtiva {
  id: number;
  projetoTitulo: string;
  dataInicio: string;
  votosRegistrados: number;
  totalVereadores: number;
}

interface HomeContent {
  projetosPendentes: number;
  projetosAprovadas: number;
  projetosReprovadas: number;
  votacoesAtivas: VotacaoAtiva[];
}

function HomePageContent() {
  const [data, setData] = useState<HomeContent | null>(null);
  const [loadingHome, setLoadingHome] = useState(true);

  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkSetup = async () => {
      try {
        // Verificar se existe algum administrador no sistema
        const response = await axios.get("/api/auth/setup");

        // Se não houver admin, redirecionar para página de setup
        if (!response.data.hasAdmin) {
          router.push("/setup");
          return;
        }

        // Se estiver autenticado, redirecionar para dashboard
        if (isAuthenticated) {
          router.push("/");
          return;
        }

        // Se não estiver autenticado e houver admin, redirecionar para login
        router.push("/login");
      } catch (error) {
        console.error("Erro ao verificar configuração:", error);
        // Em caso de erro, tentar ir para login de qualquer forma
        router.push("/login");
      } finally {
        setLoadingHome(false);
      }
    };

    // Só executa a verificação quando o estado de autenticação for conhecido
    if (!authLoading) {
      checkSetup();
    }
  }, [isAuthenticated, authLoading, router]);

  // Usuário simulado (na implementação real, viria da autenticação)
  const usuario = {
    id: 10,
    nome: "Vereador Teste",
    cargo: "vereador",
  };

  const isAdmin = usuario.cargo === "admin";

  // Carregar dados iniciais
  useEffect(() => {
    async function carregarDados() {
      try {
        setLoadingHome(true);

        // Em um ambiente real, esta seria uma chamada de API
        // const response = await fetch('/api/dashboard');
        // const data = await response.json();

        // Simular delay de API
        setTimeout(() => {
          setLoadingHome(false);
        }, 1000);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setLoadingHome(false);
      }
    }

    carregarDados();
  }, []);

  return (
    <div>
      <div className="bg-primary/10 rounded-lg p-8 mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">
          Sistema de Votação
        </h1>
        <p className="text-gray-700 mb-4">
          Câmara Municipal de Vereadores de Confresa
        </p>
        <div className="flex space-x-4">
          <Link href="/projetos">
            <Button variant="primary">Ver Projetos</Button>
          </Link>
          <Link href="/votacao/tempo-real">
            <Button variant="secondary">Votações Ativas</Button>
          </Link>
        </div>
      </div>

      {loadingHome ? (
        <div className="flex justify-center p-8">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Projetos Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary">
                  {data.projetosPendentes}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Projetos Aprovadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-600">
                  {data.projetosAprovadas}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Projetos Reprovadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-red-600">
                  {data.projetosReprovadas}
                </div>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-bold mb-4">Votações em Andamento</h2>

          {data.votacoesAtivas.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-600">
                  Não há votações em andamento no momento.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.votacoesAtivas.map((votacao) => (
                <Card key={votacao.id} variant="votacao">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold">
                        {votacao.projetoTitulo}
                      </h3>
                      <Badge variant="default">Em Votação</Badge>
                    </div>

                    <div className="text-sm text-gray-600 mb-4">
                      Iniciada em {votacao.dataInicio}
                    </div>

                    <div className="flex flex-col">
                      <div className="flex justify-between items-center mb-2">
                        <span>Progresso</span>
                        <span>
                          {votacao.votosRegistrados}/{votacao.totalVereadores}{" "}
                          votos
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-primary h-2.5 rounded-full"
                          style={{
                            width: `${
                              (votacao.votosRegistrados /
                                votacao.totalVereadores) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <Link href={`/votacao/tempo-real?id=${votacao.id}`}>
                        <Button variant="primary" className="w-full">
                          Participar da Votação
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="bg-yellow-50 border border-yellow-100 text-yellow-800 rounded-md p-4">
          <p>Erro ao carregar dados do sistema.</p>
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
