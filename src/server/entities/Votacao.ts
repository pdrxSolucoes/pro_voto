// src/server/entities/Votacao.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Projeto } from "./Projeto"; // Isso está criando a referência circular
import { Voto } from "./Voto";

export type VotacaoResultado = "aprovada" | "reprovada" | "em_andamento";

@Entity("votacoes")
export class Votacao {
  @PrimaryGeneratedColumn()
  id: number;

  // Use uma função de tipo para evitar importar diretamente a classe Projeto
  @ManyToOne("projetos", "votacoes")
  @JoinColumn({ name: "projeto_id" })
  projeto: Projeto;

  @Column({ name: "data_inicio", type: "timestamp" })
  dataInicio: Date;

  @Column({ name: "data_fim", type: "timestamp", nullable: true })
  dataFim: Date | null;

  @Column({
    type: "enum",
    enum: ["aprovada", "reprovada", "em_andamento"],
    default: "em_andamento",
  })
  resultado: VotacaoResultado;

  @Column({ name: "votos_favor", default: 0 })
  votosFavor: number;

  @Column({ name: "votos_contra", default: 0 })
  votosContra: number;

  @Column({ default: 0 })
  abstencoes: number;

  @CreateDateColumn({ name: "data_criacao" })
  data_criacao: Date;

  @UpdateDateColumn({ name: "data_atualizacao" })
  data_atualizacao: Date;

  @OneToMany(() => Voto, (voto) => voto.votacao)
  votos: Voto[];
}
