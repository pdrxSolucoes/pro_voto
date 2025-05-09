"use client";

import { useState, useEffect } from "react";
import { RootLayout } from "@/components/Layout";
import { PainelVotacao } from "@/components/ui/PainelVotacao";
import { useResultadoVotacao, useRegistrarVoto } from "@/hooks/useVotacao";
import {
  useNotifications,
  NotificationsProvider,
} from "@/components/ui/Notification";

function VotacaoRealTimeContent() {
  // ID da votação atual (em uma implementação real, viria de parâmetros da rota)
  const votacaoId = 1;

  // Usuário simulado (na implementação real, viria da autenticação)
  const usuario = {
    id: 10,
    nome: "Vereador Teste",
    cargo: "vereador",
  };

  // Hooks para gerenciar a votação em tempo real
  const { resultado, loading, error, ultimoVoto } =
    useResultadoVotacao(votacaoId);

  const {
    registrarVoto,
    loading: registrandoVoto,
    error: erroVoto,
  } = useRegistrarVoto();

  const { addNotification } = useNotifications();

  // Efeito para exibir notificações de novos votos
  useEffect(() => {
    if (ultimoVoto) {
      addNotification(
        `${ultimoVoto.vereador} ${ultimoVoto.voto} a emenda.`,
        "info"
      );
    }
  }, [ultimoVoto, addNotification]);

  // Efeito para exibir notificações de erros
  useEffect(() => {
    if (error) {
      addNotification(`Erro ao carregar dados: ${error.message}`, "error");
    }
  }, [error, addNotification]);

  // Efeito para exibir notificações de erros de votação
  useEffect(() => {
    if (erroVoto) {
      addNotification(`Erro ao registrar voto: ${erroVoto.message}`, "error");
    }
  }, [erroVoto, addNotification]);

  // Função para registrar o voto
  const handleVotar = async (voto: "aprovar" | "desaprovar" | "abster") => {
    const sucesso = await registrarVoto(votacaoId, usuario.id, voto);

    if (sucesso) {
      addNotification(`Seu voto foi registrado com sucesso!`, "success");
    }

    return sucesso;
  };

  // Mostrar mensagem de carregamento
  if (loading && !resultado) {
    return (
      <div className="flex flex-col items-center justify-center min-h-80">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Carregando dados da votação...</p>
      </div>
    );
  }

  // Simular dados para demonstração se não houver resultado
  const resultadoDemo = resultado || {
    id: 1,
    emenda: {
      id: 2,
      titulo: "Programa de Coleta Seletiva",
      descricao: "Programa de Coleta Seletiva das mulheres",
      status: "em_andamento",
    },
    votosFavor: 5,
    votosContra: 3,
    abstencoes: 1,
    resultado: "em_andamento" as const,
    data_inicio: "2025-04-25T14:30:00",
    data_fim: null, // Adicionando data_fim (pode ser null se não estiver disponível)
    total_vereadores: 10, // Total de vereadores
    total_votos: 9, // Total de votos (favor + contra + abstenção)
    vereadores: [
      { id: 1, nome: "João Silva", voto: "aprovar" as const },
      { id: 2, nome: "Maria Oliveira", voto: "aprovar" as const },
      { id: 3, nome: "Pedro Santos", voto: "aprovar" as const },
      { id: 4, nome: "Ana Costa", voto: "desaprovar" as const },
      { id: 5, nome: "Carlos Ferreira", voto: "aprovar" as const },
      { id: 6, nome: "Lúcia Almeida", voto: "desaprovar" as const },
      { id: 7, nome: "Marcos Pereira", voto: "aprovar" as const },
      { id: 8, nome: "Rita Gonçalves", voto: "desaprovar" as const },
      { id: 9, nome: "José Martins", voto: "abster" as const },
      { id: 10, nome: "Vereador Teste", voto: null },
    ],
  };

  return (
    <PainelVotacao
      votacao={resultadoDemo}
      vereadorId={usuario.id}
      onVotar={handleVotar}
    />
  );
}

export default function VotacaoTempoRealPage() {
  return (
    <NotificationsProvider>
      <RootLayout>
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-2xl font-bold mb-6">Votação em Tempo Real</h1>
          <VotacaoRealTimeContent />
        </div>
      </RootLayout>
    </NotificationsProvider>
  );
}
