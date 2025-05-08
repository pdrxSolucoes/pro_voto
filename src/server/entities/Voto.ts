import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";

export type TipoVoto = "aprovar" | "desaprovar" | "abster";

@Entity("votos")
@Unique(["votacaoId", "vereadorId"]) // Ensure a vereador can only vote once in a voting session
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
  voto: TipoVoto;

  @CreateDateColumn({ name: "data_voto" })
  dataVoto: Date;

  // We'll define the relations without importing the entities directly
  @ManyToOne("Votacao", "votos")
  @JoinColumn({ name: "votacao_id" })
  votacao: any;

  @ManyToOne("Usuario", "votos")
  @JoinColumn({ name: "vereador_id" })
  vereador: any;
}
