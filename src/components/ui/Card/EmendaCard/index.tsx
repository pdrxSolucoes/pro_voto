import { Button } from "@/components/ui/Button";

// src/components/EmendaCard.tsx (atualização)
interface EmendaCardProps {
  id: number;
  titulo: string;
  descricao: string;
  dataApresentacao: string;
  status: "pendente" | "em_votacao" | "aprovada" | "reprovada";
  onIniciarVotacao: (id: number) => void;
  onVerDetalhes: (id: number) => void;
  onEditar: (id: number) => void; // Nova prop para edição
  isAdmin: boolean;
}

export function EmendaCard({
  id,
  titulo,
  descricao,
  dataApresentacao,
  status,
  onIniciarVotacao,
  onVerDetalhes,
  onEditar, // Nova prop
  isAdmin,
}: EmendaCardProps) {
  const statusLabels = {
    pendente: "Pendente",
    em_votacao: "Em Votação",
    aprovada: "Aprovada",
    reprovada: "Reprovada",
  };

  const statusColors = {
    pendente: "bg-yellow-100 text-yellow-800",
    em_votacao: "bg-blue-100 text-blue-800",
    aprovada: "bg-green-100 text-green-800",
    reprovada: "bg-red-100 text-red-800",
  };

  const dataFormatada = new Date(dataApresentacao).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-confresa-azul line-clamp-1">
            {titulo}
          </h3>
          <span
            className={`text-xs px-2 py-1 rounded-full ${statusColors[status]}`}
          >
            {statusLabels[status]}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">{descricao}</p>
        <div className="text-xs text-gray-500 mb-4">
          Apresentada em: {dataFormatada}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => onVerDetalhes(id)}>
            Ver Detalhes
          </Button>

          {isAdmin && status === "pendente" && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onEditar(id)} // Novo botão de edição
              >
                Editar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onIniciarVotacao(id)}
              >
                Iniciar Votação
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
