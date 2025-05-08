import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";

export type CargoUsuario = "vereador" | "admin";

@Entity("usuarios")
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column({ unique: true })
  email: string;

  @Column()
  senha: string;

  @Column({
    type: "enum",
    enum: ["vereador", "admin"],
    default: "vereador",
  })
  cargo: CargoUsuario;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn({ name: "data_criacao" })
  dataCriacao: Date;

  @UpdateDateColumn({ name: "data_atualizacao" })
  dataAtualizacao: Date;

  // We'll define the relations without importing the entities directly
  @OneToMany("Voto", "vereador")
  votos: any[];
}
