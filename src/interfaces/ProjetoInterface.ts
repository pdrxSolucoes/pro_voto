import type { VotacaoInterface } from "./VotacaoInterface";

export interface ProjetoInterface {
  id: number;
  titulo: string;
  descricao: string;
  data_apresentacao: string;
  status: "pendente" | "em_votacao" | "aprovada" | "reprovada";
  votacoes?: VotacaoInterface[];
}
