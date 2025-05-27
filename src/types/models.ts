/**
 * Interface para Vereador
 */
export type Vereador = {
  id: number;
  nome: string;
};

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha?: string; // Opcional para não expor em respostas
  cargo: "admin" | "vereador" | "secretario";
  ativo: boolean;
  data_criacao: Date;
  ultimo_acesso?: Date;
}

/**
 * Interface para o modelo de Projeto
 */
export interface Projeto {
  id: number;
  titulo: string;
  descricao: string;
  numero_protocolo?: string;
  autor_id: number;
  autor?: Usuario;
  data_apresentacao: Date;
  status: "pendente" | "em_votacao" | "aprovada" | "reprovada";
  data_criacao: Date;
  data_atualizacao: Date;
  arquivos?: string[]; // Caminhos para arquivos anexados
  tags?: string[];
}

/**
 * Interface para o modelo de Votação
 */
export interface Votacao {
  id: number;
  projeto_id: number;
  projeto?: Projeto;
  data_inicio: Date;
  data_fim?: Date;
  resultado: "em_andamento" | "aprovada" | "reprovada" | null;
  votos?: Voto[];
  total_votos?: number;
  votosFavor?: number;
  votosContra?: number;
  abstencoes?: number;
}

/**
 * Interface para o modelo de Voto
 */
export interface Voto {
  id: number;
  votacao_id: number;
  vereador_id: number;
  vereador?: Usuario;
  voto: "aprovar" | "desaprovar" | "abster";
  data_registro: Date;
  observacao?: string;
}

/**
 * Interface para o resultado de uma votação
 */
export interface ResultadoVotacao {
  id: number;
  projeto: {
    id: number;
    titulo: string;
    descricao: string;
    status: string;
  };
  data_inicio: string;
  data_fim: string | null;
  resultado: "aprovada" | "reprovada" | "em_andamento" | null;
  votosFavor: number;
  votosContra: number;
  abstencoes: number;
  vereadores: {
    id: number;
    nome: string;
    voto: "aprovar" | "desaprovar" | "abster" | null;
  }[];
  total_vereadores: number;
  total_votos: number;
}

/**
 * Interface para o item de votação ativa na lista
 */
export interface VotacaoAtiva {
  id: number;
  projetoTitulo: string;
  dataInicio: string;
  votosRegistrados: number;
  totalVereadores: number;
}

/**
 * Interface para o conteúdo da página inicial
 */
export interface HomeContent {
  projetosPendentes: number;
  projetosAprovadas: number;
  projetosReprovadas: number;
  votacoesAtivas: VotacaoAtiva[];
}

/**
 * Interface para respostas de API
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
