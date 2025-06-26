export interface VotoInterface {
  id: number;
  votacao_id: number;
  vereador_id: number;
  voto: "aprovar" | "desaprovar" | "abster";
  data_voto: string;
  usuarios?: { nome: string };
}
