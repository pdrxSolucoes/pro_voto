export interface VotoInterface {
  id: number;
  votacao_id: number;
  usuario_id: number;
  voto: "sim" | "nao" | "abstencao";
  data_voto: string;
}
