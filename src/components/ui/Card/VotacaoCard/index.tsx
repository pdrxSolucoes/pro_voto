import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { type VotacaoAtiva } from "@/services/votacaoService";

interface VotacaoCardProps {
  votacao: VotacaoAtiva;
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
  // Verifica se a votação atingiu 12 votos para mostrar um indicador visual
  const atingiuTotalVotos = false;

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
            {votacao.projetos?.titulo || `Projeto #${votacao.projeto_id}`}
          </h3>
          {atingiuTotalVotos ? (
            <Badge
              variant="default"
              className="bg-orange-500 hover:bg-orange-600"
            >
              Aguardando Finalização
            </Badge>
          ) : (
            <Badge
              variant="default"
              className="bg-green-500 hover:bg-green-600"
            >
              Em Votação
            </Badge>
          )}
        </div>
        <div className="text-sm text-gray-600 mt-1">
          Iniciada em {new Date(votacao.data_inicio).toLocaleDateString('pt-BR')}
        </div>
      </div>

      <CardContent className="p-6">
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Progresso da Votação</span>
            <span className="text-sm font-medium text-primary">
              {0}/12 votos
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-primary h-3 rounded-full transition-all duration-500 ease-in-out"
              style={{
                width: `0%`,
              }}
            ></div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {/* Avatares simulados de vereadores */}
              {[...Array(Math.min(3, 0))].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium"
                >
                  V{i + 1}
                </div>
              ))}
              {0 > 3 && (
                <div className="w-8 h-8 rounded-full bg-primary text-white border-2 border-white flex items-center justify-center text-xs font-medium">
                  +{0 - 3}
                </div>
              )}
            </div>
            <span className="ml-3 text-sm text-gray-600">já votaram</span>
          </div>
          {isClickable ? (
            <Button variant="primary" className="px-4 py-2">
              Participar
            </Button>
          ) : (
            <Link href={`/votacao/tempo-real?id=${votacao.id}`}>
              <Button
                variant={atingiuTotalVotos ? "secondary" : "primary"}
                className={`px-4 py-2 ${
                  atingiuTotalVotos
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : ""
                }`}
              >
                {atingiuTotalVotos ? "Ver Resultado" : "Participar"}
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
