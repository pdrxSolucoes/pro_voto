import React, { useState, useEffect } from "react";
import { Card } from "./Card";
import { Button } from "./Button";
import { cn } from "@/lib/utils";
import { Badge } from "./Badge";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import type { ResultadoVotacao } from "@/hooks/useVotacao";

interface PainelVotacaoProps {
  votacao: ResultadoVotacao;
  vereadorId?: number;
  onVotar?: (voto: "aprovar" | "desaprovar" | "abster") => Promise<boolean>;
}

export function PainelVotacao({
  votacao,
  vereadorId,
  onVotar,
}: PainelVotacaoProps) {
  const [votoSelecionado, setVotoSelecionado] = useState<
    "aprovar" | "desaprovar" | "abster" | null
  >(null);
  const [confirmando, setConfirmando] = useState(false);
  const [votando, setVotando] = useState(false);
  const [votoConfirmado, setVotoConfirmado] = useState(false);

  // Verifica se o vereador já votou
  const vereadorAtual = vereadorId
    ? votacao.vereadores.find((v: any) => v.id === vereadorId)
    : null;

  const jaVotou = vereadorAtual && vereadorAtual?.voto !== null;

  // Recalcula a porcentagem de votos
  const totalVotos =
    votacao.votosFavor + votacao.votosContra + votacao.abstencoes;
  const percentualFavor =
    totalVotos > 0 ? Math.round((votacao.votosFavor / totalVotos) * 100) : 0;
  const percentualContra =
    totalVotos > 0 ? Math.round((votacao.votosContra / totalVotos) * 100) : 0;
  const percentualAbstencao =
    totalVotos > 0 ? Math.round((votacao.abstencoes / totalVotos) * 100) : 0;

  // Reset o estado quando muda a votação
  useEffect(() => {
    setVotoSelecionado(null);
    setConfirmando(false);
    setVotando(false);
    setVotoConfirmado(false);
  }, [votacao.id]);

  // Função para confirmar voto
  const confirmarVoto = async () => {
    if (!votoSelecionado || !onVotar) return;

    setVotando(true);

    try {
      const resultado = await onVotar(votoSelecionado);
      if (resultado) {
        setVotoConfirmado(true);
      }
    } finally {
      setVotando(false);
      setConfirmando(false);
    }
  };

  return (
    <div className="painel-votacao">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">
          Votação: {votacao.projeto.titulo}
        </h2>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Iniciada em: {votacao.data_inicio}</span>
          {votacao.data_fim && <span>Encerrada em: {votacao.data_fim}</span>}
          <Badge
            variant={
              votacao.resultado === "aprovada"
                ? "success"
                : votacao.resultado === "reprovada"
                ? "danger"
                : "warning"
            }
          >
            {votacao.resultado === "aprovada"
              ? "Aprovada"
              : votacao.resultado === "reprovada"
              ? "Reprovada"
              : "Em Andamento"}
          </Badge>
        </div>
      </div>

      <div className="painel-resultados">
        <div
          className={cn("resultado-card resultado-favor", {
            "border-4":
              votacao.votosFavor > votacao.votosContra &&
              votacao.resultado === "aprovada",
          })}
        >
          <div className="resultado-numero text-green-600">
            {votacao.votosFavor}
          </div>
          <div className="resultado-texto">A favor ({percentualFavor}%)</div>
        </div>

        <div
          className={cn("resultado-card resultado-contra", {
            "border-4":
              votacao.votosContra > votacao.votosFavor &&
              votacao.resultado === "reprovada",
          })}
        >
          <div className="resultado-numero text-red-600">
            {votacao.votosContra}
          </div>
          <div className="resultado-texto">Contra ({percentualContra}%)</div>
        </div>

        <div className="resultado-card resultado-abstencao">
          <div className="resultado-numero text-yellow-600">
            {votacao.abstencoes}
          </div>
          <div className="resultado-texto">
            Abstenções ({percentualAbstencao}%)
          </div>
        </div>
      </div>

      {/* Seção de votação para vereadores */}
      {vereadorId && votacao.resultado === "em_andamento" && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Seu voto</h3>

          {jaVotou ? (
            <div className="bg-gray-50 rounded-md p-4 flex items-center">
              <div className="mr-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <p className="font-medium">Voto registrado</p>
                <p className="text-sm text-gray-600">
                  Você{" "}
                  {vereadorAtual?.voto
                    ? vereadorAtual.voto.toLowerCase()
                    : "não votou"}{" "}
                  este projeto.
                </p>
              </div>
            </div>
          ) : votoConfirmado ? (
            <div className="bg-green-50 rounded-md p-4 flex items-center">
              <div className="mr-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <p className="font-medium">Voto registrado com sucesso!</p>
                <p className="text-sm text-gray-600">
                  Obrigado por participar da votação.
                </p>
              </div>
            </div>
          ) : confirmando ? (
            <div className="bg-blue-50 rounded-md p-4 mb-4">
              <h4 className="font-medium mb-2">
                Confirmar voto:{" "}
                {votoSelecionado === "aprovar"
                  ? "APROVAR"
                  : votoSelecionado === "desaprovar"
                  ? "REPROVAR"
                  : "ABSTER-SE"}
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Confirme seu voto. Esta ação não poderá ser desfeita.
              </p>
              <div className="flex space-x-3">
                <Button
                  onClick={() => setConfirmando(false)}
                  variant="outline"
                  disabled={votando}
                >
                  Voltar
                </Button>
                <Button
                  onClick={confirmarVoto}
                  variant={
                    votoSelecionado === "aprovar"
                      ? "aprovar"
                      : votoSelecionado === "desaprovar"
                      ? "reprovar"
                      : "abster"
                  }
                  disabled={votando}
                >
                  {votando ? "Registrando..." : "Confirmar Voto"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
              <Button
                variant="aprovar"
                className="flex-1 h-16"
                onClick={() => {
                  setVotoSelecionado("aprovar");
                  setConfirmando(true);
                }}
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                Aprovar
              </Button>

              <Button
                variant="reprovar"
                className="flex-1 h-16"
                onClick={() => {
                  setVotoSelecionado("desaprovar");
                  setConfirmando(true);
                }}
              >
                <XCircle className="mr-2 h-5 w-5" />
                Reprovar
              </Button>

              <Button
                variant="abster"
                className="flex-1 h-16"
                onClick={() => {
                  setVotoSelecionado("abster");
                  setConfirmando(true);
                }}
              >
                <AlertCircle className="mr-2 h-5 w-5" />
                Abster-se
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Lista de vereadores e seus votos */}
      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Votos dos Vereadores</h3>

        <div className="lista-vereadores">
          {votacao.vereadores.map((vereador: any) => (
            <div key={vereador.id} className="vereador-item">
              <div>
                <span className="font-medium">{vereador.nome}</span>
              </div>
              <div>
                {vereador.voto === null ? (
                  <span className="text-gray-500 flex items-center">
                    <span className="voto-indicador voto-pendente"></span>
                    Pendente
                  </span>
                ) : vereador.voto === "aprovar" ? (
                  <span className="text-green-600 flex items-center">
                    <span className="voto-indicador voto-aprovado"></span>
                    Aprovou
                  </span>
                ) : vereador.voto === "desaprovar" ? (
                  <span className="text-red-600 flex items-center">
                    <span className="voto-indicador voto-reprovado"></span>
                    Reprovou
                  </span>
                ) : (
                  <span className="text-yellow-600 flex items-center">
                    <span className="voto-indicador voto-abstencao"></span>
                    Absteve-se
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
