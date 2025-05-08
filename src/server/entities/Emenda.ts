import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";

export type StatusEmenda = "pendente" | "em_votacao" | "aprovada" | "reprovada";

@Entity("emendas")
export class Emenda {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @Column()
  descricao: string;

  @Column({ name: "data_apresentacao" })
  dataApresentacao: Date;

  @Column({
    type: "enum",
    enum: ["pendente", "em_votacao", "aprovada", "reprovada"],
    default: "pendente",
  })
  status: StatusEmenda;

  @CreateDateColumn({ name: "data_criacao" })
  dataCriacao: Date;

  @UpdateDateColumn({ name: "data_atualizacao" })
  dataAtualizacao: Date;

  // We'll define the relations without importing the entities directly
  @OneToMany("Votacao", "emenda")
  votacoes: any[];
}
