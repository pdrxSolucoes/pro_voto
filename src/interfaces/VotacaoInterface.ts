import type { VotoInterface } from "./VotoInterface";

export interface VotacaoInterface {
  id: number;
  projeto_id: number;
  data_inicio: string;
  data_fim: string | null;
  resultado: "aprovada" | "reprovada" | "em_andamento";
  votos_favor: number;
  votos_contra: number;
  abstencoes: number;
  data_criacao: string;
  data_atualizacao: string;
  projeto?: any;
  votos?: VotoInterface[];
}

export interface ResultadoVotacaoInterface {
  total_votos: number;
  total_vereadores: number;
  votos_sim: number;
  votos_nao: number;
  abstencoes: number;
  aprovada: boolean;
}
