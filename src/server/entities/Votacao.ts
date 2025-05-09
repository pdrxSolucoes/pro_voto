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
import type { Voto } from "./Voto"; // Import as type only
import { Emenda } from "./Emenda";

@Entity("votacoes")
export class Votacao {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "emenda_id" })
  emendaId: number;

  @Column({ type: "timestamp" })
  dataInicio: Date;

  @Column({ type: "timestamp", nullable: true })
  dataFim: Date;

  @Column({
    type: "enum",
    enum: ["aprovada", "reprovada", "em_andamento"],
    default: "em_andamento",
  })
  resultado: string;

  @Column({ default: 0 })
  votosFavor: number;

  @Column({ default: 0 })
  votosContra: number;

  @Column({ default: 0 })
  abstencoes: number;

  @CreateDateColumn({ name: "data_criacao" })
  dataCriacao: Date;

  @UpdateDateColumn({ name: "data_atualizacao" })
  dataAtualizacao: Date;

  @ManyToOne(() => Emenda, (emenda) => emenda.votacoes)
  @JoinColumn({ name: "emenda_id" })
  emenda: Emenda;

  @OneToMany("Voto", "votacao") // Use string references instead of imported classes
  votos: Voto[];
}
