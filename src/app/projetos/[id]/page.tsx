"use client";

import { useState, useEffect } from "react";
import { RootLayout } from "@/components/Layout";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { useNotifications } from "@/contexts/NotificationContext";
import type { ProjetoInterface } from "@/interfaces/ProjetoInterface";
import { projetoService } from "@/services/projetoService";
import type { VotoInterface } from "@/interfaces/VotoInterface";

function ProjetoDetalhesContent({ id }: { id: string }) {
  const [projeto, setProjeto] = useState<ProjetoInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { isAdmin, user, loading: authLoading } = useAuth();
  const { addNotification } = useNotifications();
  const router = useRouter();

  useEffect(() => {
    console.log("🔍 Auth Debug:", { authLoading, user: user?.nome || null });

    if (!authLoading) {
      if (!user) {
        console.log("❌ Usuário não autenticado, redirecionando...");
        router.push("/login");
      } else {
        console.log("✅ Usuário autenticado, carregando projeto...");
        carregarProjeto();
      }
    } else {
      console.log("⏳ Aguardando autenticação...");
    }
  }, [user, authLoading, router]);

  async function carregarProjeto() {
    if (!user) {
      console.log("⚠️ Tentativa de carregar projeto sem usuário autenticado");
      return;
    }

    try {
      setLoading(true);
      console.log("📄 Carregando projeto ID:", id);
      const projeto = await projetoService.getProjetoById(parseInt(id));
      setProjeto(projeto);
      setError(null);
      console.log("✅ Projeto carregado com sucesso:", projeto.titulo);
    } catch (err) {
      console.error("❌ Erro ao carregar projeto:", err);
      const msg =
        err instanceof Error ? err.message : "Erro ao carregar projeto";
      setError(new Error(msg));
      addNotification(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  const handleIniciarVotacao = async () => {
    try {
      await projetoService.iniciarVotacao(parseInt(id));
      await carregarProjeto();
      addNotification(`Votação iniciada para o projeto #${id}`, "success");
    } catch (err) {
      console.error("Erro ao iniciar votação:", err);
      const msg =
        err instanceof Error ? err.message : "Erro ao iniciar votação";
      addNotification(msg, "error");
    }
  };

  const handleVoltar = () => {
    router.push("/projetos");
  };

  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      pendente: "Pendente",
      em_votacao: "Em Votação",
      aprovada: "Aprovada",
      reprovada: "Reprovada",
    };
    return statusLabels[status] || status;
  };

  const getStatusClass = (status: string) => {
    const statusClasses: Record<string, string> = {
      pendente: "bg-yellow-100 text-yellow-800",
      em_votacao: "bg-blue-100 text-blue-800",
      aprovada: "bg-green-100 text-green-800",
      reprovada: "bg-red-100 text-red-800",
    };
    return statusClasses[status] || "bg-gray-100 text-gray-800";
  };

  // Função para obter o nome do vereador pelo ID
  const [vereadores, setVereadores] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const carregarVereadores = async () => {
      try {
        const usuarios = await projetoService.getUsuarios();
        const vereadoresMap: { [key: number]: string } = {};
        usuarios.forEach((usuario) => {
          vereadoresMap[usuario.id] = usuario.nome;
        });
        setVereadores(vereadoresMap);
      } catch (error) {
        console.error("Erro ao carregar vereadores:", error);
      }
    };

    carregarVereadores();
  }, []);

  const obterNomeVereador = (id: number): string => {
    return vereadores[id] || `Vereador ${id}`;
  };

  const contarVotos = (votos: VotoInterface[]) => {
    const contagem = {
      aprovar: 0,
      desaprovar: 0,
      abster: 0,
    };

    votos.forEach((voto) => {
      contagem[voto.voto]++;
    });

    return contagem;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Detalhes do Projeto</h1>
        <Button variant="outline" onClick={handleVoltar}>
          Voltar para Projetos
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
          <h3 className="font-semibold mb-2">Erro ao carregar projeto</h3>
          <p>{error.message}</p>
          <div className="mt-4">
            <Button variant="secondary" size="sm" onClick={carregarProjeto}>
              Tentar novamente
            </Button>
          </div>
        </div>
      ) : projeto ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-confresa-azul">
                {projeto.titulo}
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-sm ${getStatusClass(
                  projeto.status
                )}`}
              >
                {getStatusLabel(projeto.status)}
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Descrição</h3>
              <p className="text-gray-700 whitespace-pre-line">
                {projeto.descricao}
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Informações</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">ID do Projeto</p>
                    <p className="font-medium">{projeto.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      Data de Apresentação
                    </p>
                    <p className="font-medium">
                      {formatarData(projeto.data_apresentacao)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {projeto.votacoes && projeto.votacoes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">
                  Histórico de Votações
                </h3>
                <div className="space-y-4">
                  {projeto.votacoes.map((votacao) => (
                    <div
                      key={votacao.id}
                      className="border border-gray-200 rounded-md p-4"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium">Votação #{votacao.id}</h4>
                        <Badge
                          variant={!votacao.data_fim ? "default" : "outline"}
                        >
                          {!votacao.data_fim ? "Em andamento" : "Finalizada"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3 text-sm">
                        <div>
                          <span className="text-gray-500">Início:</span>{" "}
                          {formatarData(votacao.data_inicio)}
                        </div>
                        {votacao.data_fim && (
                          <div>
                            <span className="text-gray-500">Término:</span>{" "}
                            {formatarData(votacao.data_fim)}
                          </div>
                        )}
                      </div>

                      {votacao.votos && votacao.votos.length > 0 && (
                        <div>
                          <h5 className="font-medium mb-2">Resultado</h5>
                          {(() => {
                            const contagem = contarVotos(votacao.votos);
                            return (
                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="bg-green-50 p-2 rounded">
                                  <div className="text-xl font-bold text-green-700">
                                    {votacao.votos_favor || contagem.aprovar}
                                  </div>
                                  <div className="text-xs text-green-600">
                                    Aprovações
                                  </div>
                                </div>
                                <div className="bg-red-50 p-2 rounded">
                                  <div className="text-xl font-bold text-red-700">
                                    {votacao.votos_contra ||
                                      contagem.desaprovar}
                                  </div>
                                  <div className="text-xs text-red-600">
                                    Reprovações
                                  </div>
                                </div>
                                <div className="bg-yellow-50 p-2 rounded">
                                  <div className="text-xl font-bold text-yellow-700">
                                    {votacao.abstencoes || contagem.abster}
                                  </div>
                                  <div className="text-xs text-yellow-600">
                                    Abstenções
                                  </div>
                                </div>
                              </div>
                            );
                          })()}

                          <div className="mt-4">
                            <h5 className="font-medium mb-2">Votos</h5>
                            <div className="max-h-60 overflow-y-auto">
                              <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="py-2 px-3 text-left">
                                      Vereador
                                    </th>
                                    <th className="py-2 px-3 text-left">
                                      Voto
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {votacao.votos.map((voto) => {
                                    // Buscar o nome do vereador pelo ID
                                    const vereadorNome = obterNomeVereador(
                                      voto.vereador_id
                                    );
                                    return (
                                      <tr key={voto.id}>
                                        <td className="py-2 px-3">
                                          {vereadorNome ||
                                            `Vereador ID: ${voto.vereador_id}`}
                                        </td>
                                        <td className="py-2 px-3">
                                          <span
                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                              voto.voto === "aprovar"
                                                ? "bg-green-100 text-green-800"
                                                : voto.voto === "desaprovar"
                                                ? "bg-red-100 text-red-800"
                                                : "bg-yellow-100 text-yellow-800"
                                            }`}
                                          >
                                            <span
                                              className={`w-2 h-2 rounded-full mr-1 ${
                                                voto.voto === "aprovar"
                                                  ? "bg-green-500"
                                                  : voto.voto === "desaprovar"
                                                  ? "bg-red-500"
                                                  : "bg-yellow-500"
                                              }`}
                                            ></span>
                                            {voto.voto === "aprovar"
                                              ? "Aprovado"
                                              : voto.voto === "desaprovar"
                                              ? "Reprovado"
                                              : "Abstenção"}
                                          </span>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mt-6">
              <Button variant="outline" onClick={handleVoltar}>
                Voltar
              </Button>
              {isAdmin && projeto.status === "pendente" && (
                <Button variant="primary" onClick={handleIniciarVotacao}>
                  Iniciar Votação
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-100 text-yellow-800 rounded-md p-4">
          <p>Projeto não encontrado.</p>
        </div>
      )}
    </div>
  );
}

export default function ProjetoDetalhesPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <RootLayout>
      <div className="container mx-auto py-8 px-4">
        <ProjetoDetalhesContent id={params.id} />
      </div>
    </RootLayout>
  );
}
