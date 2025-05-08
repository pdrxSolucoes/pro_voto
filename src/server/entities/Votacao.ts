import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";

export type ResultadoVotacao = "aprovada" | "reprovada" | "em_andamento";

@Entity("votacoes")
export class Votacao {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "emenda_id" })
  emendaId: number;

  @Column({ name: "data_inicio" })
  dataInicio: Date;

  @Column({ name: "data_fim", nullable: true })
  dataFim: Date;

  @Column({
    type: "enum",
    enum: ["aprovada", "reprovada", "em_andamento"],
    default: "em_andamento",
  })
  resultado: ResultadoVotacao;

  @Column({ name: "votos_favor", default: 0 })
  votosFavor: number;

  @Column({ name: "votos_contra", default: 0 })
  votosContra: number;

  @Column({ default: 0 })
  abstencoes: number;

  @CreateDateColumn({ name: "data_criacao" })
  dataCriacao: Date;

  @UpdateDateColumn({ name: "data_atualizacao" })
  dataAtualizacao: Date;

  // We'll define the relations without importing the entities directly
  @ManyToOne("Emenda", "votacoes")
  @JoinColumn({ name: "emenda_id" })
  emenda: any;

  @OneToMany("Voto", "votacao")
  votos: any[];
}
