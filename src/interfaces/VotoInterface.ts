export interface VotoInterface {
  id: number;
  voto: "aprovar" | "reprovar" | "abster";
  vereadorId: number;
  votacaoId: number;
  dataVoto: string;
}
