import type { ProjetoInterface } from "./ProjetoInterface";
import type { VotoInterface } from "./VotoInterface";

export interface VotacaoInterface {
  id: number;
  dataInicio: string;
  dataFim?: string;
  data_criacao: string;
  data_atualizacao: string;
  resultado: string;
  votosFavor: number;
  votosContra: number;
  abstencoes: number;
  projeto_id?: string;
  votos: VotoInterface[];
}
