import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import type { VotacaoInterface } from "@/interfaces/VotacaoInterface";

interface VotacaoCardProps {
  votacao: VotacaoInterface;
  onSelect?: (id: number) => void;
  isClickable?: boolean;
}

export function VotacaoCard({
  votacao,
  onSelect,
  isClickable = false,
}: VotacaoCardProps) {
  const handleClick = () => {
    if (isClickable && onSelect) {
      onSelect(votacao.id);
    }
  };

  console.log("teste", votacao);
  // Calcula os totais baseado nos votos reais
  const totalVotos = votacao.votos?.length || 0;
  const totalPossivel = 12; // Total de vereadores
  const percentualConcluido = (totalVotos / totalPossivel) * 100;

  // Verifica se a votação atingiu 12 votos
  const atingiuTotalVotos = totalVotos >= totalPossivel;

  // Verifica se a votação foi finalizada
  const votacaoFinalizada = !!votacao.data_fim;

  // Determina o status da votação
  const getStatusVotacao = () => {
    if (votacaoFinalizada) {
      return {
        text: "Finalizada",
        variant: "default",
        className: "bg-gray-500 hover:bg-gray-600",
      };
    }
    if (atingiuTotalVotos) {
      return {
        text: "Aguardando Finalização",
        variant: "default",
        className: "bg-orange-500 hover:bg-orange-600",
      };
    }
    return {
      text: "Em Votação",
      variant: "default",
      className: "bg-green-500 hover:bg-green-600",
    };
  };

  const status = getStatusVotacao();

  return (
    <Card
      className={`overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow ${
        isClickable ? "cursor-pointer" : ""
      }`}
      onClick={handleClick}
    >
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4 border-b">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-gray-800">
            {`Projeto #${votacao.projeto_id}`}
          </h3>
          <Badge variant={status.variant as any} className={status.className}>
            {status.text}
          </Badge>
        </div>
        <div className="text-sm text-gray-600 mt-1">
          Iniciada em{" "}
          {new Date(votacao.data_inicio).toLocaleDateString("pt-BR")}
          {votacaoFinalizada && (
            <span className="ml-2">
              • Finalizada em{" "}
              {new Date(votacao.data_fim!).toLocaleDateString("pt-BR")}
            </span>
          )}
        </div>
      </div>

      <CardContent className="p-6">
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Progresso da Votação</span>
            <span className="text-sm font-medium text-primary">
              {totalVotos}/{totalPossivel} votos
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-primary h-3 rounded-full transition-all duration-500 ease-in-out"
              style={{
                width: `${percentualConcluido}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Exibir contadores de votos se houver votos */}
        {totalVotos > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-4 text-center">
            <div className="bg-green-50 p-2 rounded">
              <div className="text-green-600 font-bold text-lg">
                {votacao.votos_favor}
              </div>
              <div className="text-green-600 text-xs">Favoráveis</div>
            </div>
            <div className="bg-red-50 p-2 rounded">
              <div className="text-red-600 font-bold text-lg">
                {votacao.votos_contra}
              </div>
              <div className="text-red-600 text-xs">Contrários</div>
            </div>
            <div className="bg-yellow-50 p-2 rounded">
              <div className="text-yellow-600 font-bold text-lg">
                {votacao.abstencoes}
              </div>
              <div className="text-yellow-600 text-xs">Abstenções</div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {/* Avatares dos vereadores que já votaram */}
              {votacao.votos?.slice(0, 3).map((voto, i) => (
                <div
                  key={voto.id || i}
                  className="w-8 h-8 rounded-full bg-primary text-white border-2 border-white flex items-center justify-center text-xs font-medium"
                  title={`Vereador ${voto.vereador_id}`}
                >
                  V{voto.vereador_id}
                </div>
              ))}
              {totalVotos > 3 && (
                <div className="w-8 h-8 rounded-full bg-primary text-white border-2 border-white flex items-center justify-center text-xs font-medium">
                  +{totalVotos - 3}
                </div>
              )}
            </div>

            <span className="ml-3 text-sm text-gray-600">
              {totalVotos > 0 ? "já votaram" : "nenhum voto ainda"}
            </span>
          </div>

          {isClickable ? (
            <Button
              variant="primary"
              className="px-4 py-2"
              disabled={votacaoFinalizada}
            >
              {votacaoFinalizada ? "Finalizada" : "Participar"}
            </Button>
          ) : (
            <Link href={`/votacao/tempo-real?id=${votacao.id}`}>
              <Button
                variant={
                  votacaoFinalizada || atingiuTotalVotos
                    ? "secondary"
                    : "primary"
                }
                className={`px-4 py-2 ${
                  votacaoFinalizada
                    ? "bg-gray-500 hover:bg-gray-600 text-white"
                    : atingiuTotalVotos
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : ""
                }`}
              >
                {votacaoFinalizada
                  ? "Ver Resultado"
                  : atingiuTotalVotos
                  ? "Ver Resultado"
                  : "Participar"}
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
