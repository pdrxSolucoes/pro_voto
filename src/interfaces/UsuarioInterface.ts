export interface UsuarioInterface {
  id?: number;
  nome: string;
  email: string;
  cargo: "admin" | "vereador";
  senha?: string;
  ativo?: boolean;
}
