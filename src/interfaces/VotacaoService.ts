export interface VotacaoInterface {
  id: number;
  projeto_id: number;
  data_inicio: string;
  data_fim: string | null;
  status: "ativa" | "finalizada";
}
