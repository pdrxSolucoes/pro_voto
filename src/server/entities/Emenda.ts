// src/server/entities/Emenda.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Votacao } from "./Votacao";

@Entity("emendas")
export class Emenda {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @Column({ type: "text" })
  descricao: string;

  @Column({ type: "timestamp" })
  dataApresentacao: Date;

  @Column({
    type: "enum",
    enum: ["pendente", "em_votacao", "aprovada", "reprovada"],
    default: "pendente",
  })
  status: string;

  @CreateDateColumn({ name: "data_criacao" })
  dataCriacao: Date;

  @UpdateDateColumn({ name: "data_atualizacao" })
  dataAtualizacao: Date;

  @OneToMany(() => Votacao, (votacao) => votacao.emenda)
  votacoes: Votacao[];
}
