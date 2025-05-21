// src/server/entities/Projeto.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Votacao } from "./Votacao"; // Isso está criando a referência circular

export type ProjetoStatus =
  | "pendente"
  | "em_votacao"
  | "aprovada"
  | "reprovada";

@Entity("projetos")
export class Projeto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @Column({ type: "text" })
  descricao: string;

  @Column({ name: "data_apresentacao", type: "timestamp" })
  data_apresentacao: Date;

  @Column({
    type: "enum",
    enum: ["pendente", "em_votacao", "aprovada", "reprovada"],
    default: "pendente",
  })
  status: ProjetoStatus;

  @CreateDateColumn({ name: "data_criacao" })
  data_criacao: Date;

  @UpdateDateColumn({ name: "data_atualizacao" })
  data_atualizacao: Date;

  // Use uma função de tipo para evitar importar diretamente a classe Votacao
  @OneToMany("Votacao", "projeto")
  votacoes: Votacao[];
}
