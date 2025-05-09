// src/server/entities/Voto.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from "typeorm";
import { Votacao } from "./Votacao";
import { Usuario } from "./Usuario";

@Entity("votos")
@Unique(["votacaoId", "vereadorId"])
export class Voto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "votacao_id" })
  votacaoId: number;

  @Column({ name: "vereador_id" })
  vereadorId: number;

  @Column({
    type: "enum",
    enum: ["aprovar", "desaprovar", "abster"],
  })
  voto: string;

  @CreateDateColumn({ name: "data_voto" })
  dataVoto: Date;

  @ManyToOne(() => Votacao, (votacao) => votacao.votos)
  @JoinColumn({ name: "votacao_id" })
  votacao: Votacao;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: "vereador_id" })
  vereador: Usuario;
}
