"use client";

import { useState, useEffect } from "react";
import { RootLayout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

interface VotacaoAtiva {
  id: number;
  emendaTitulo: string;
  dataInicio: string;
  votosRegistrados: number;
  totalVereadores: number;
}

interface HomeContent {
  emendasPendentes: number;
  emendasAprovadas: number;
  emendasReprovadas: number;
  votacoesAtivas: VotacaoAtiva[];
}

function HomePageContent() {
  const [data, setData] = useState<HomeContent | null>(null);
  const [loading, setLoading] = useState(true);

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
        setLoading(true);

        // Em um ambiente real, esta seria uma chamada de API
        // const response = await fetch('/api/dashboard');
        // const data = await response.json();

        // Dados simulados para demonstração
        const dadosDemo: HomeContent = {
          emendasPendentes: 8,
          emendasAprovadas: 16,
          emendasReprovadas: 5,
          votacoesAtivas: [
            {
              id: 1,
              emendaTitulo: "Programa de Coleta Seletiva",
              dataInicio: "2025-04-25T14:30:00",
              votosRegistrados: 9,
              totalVereadores: 10,
            },
            {
              id: 2,
              emendaTitulo: "Expansão da Rede Municipal de Saúde",
              dataInicio: "2025-04-25T15:45:00",
              votosRegistrados: 6,
              totalVereadores: 10,
            },
          ],
        };

        // Simular delay de API
        setTimeout(() => {
          setData(dadosDemo);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setLoading(false);
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
          <Link href="/emendas">
            <Button variant="primary">Ver Emendas</Button>
          </Link>
          <Link href="/votacao/tempo-real">
            <Button variant="secondary">Votações Ativas</Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Emendas Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary">
                  {data.emendasPendentes}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emendas Aprovadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-600">
                  {data.emendasAprovadas}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emendas Reprovadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-red-600">
                  {data.emendasReprovadas}
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
                        {votacao.emendaTitulo}
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
