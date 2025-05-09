// src/server/entities/Emenda.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import type { Votacao } from "./Votacao";

@Entity("emendas")
export class Emenda {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @Column()
  descricao: string;

  @Column()
  data_apresentacao: Date;

  @Column({
    type: "enum",
    enum: ["pendente", "em_votacao", "aprovada", "reprovada"],
    default: "pendente",
  })
  status: "pendente" | "em_votacao" | "aprovada" | "reprovada";

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  data_criacao: Date;

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  data_atualizacao: Date;

  // Use string literal for entity name instead of class reference
  @OneToMany("Votacao", "emenda")
  votacoes: Votacao[];
}
