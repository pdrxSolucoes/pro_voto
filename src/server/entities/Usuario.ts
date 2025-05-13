// src/entities/Usuario.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

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
  })
  cargo: "vereador" | "admin";

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn({ name: "data_criacao" })
  data_criacao: Date;

  @UpdateDateColumn({ name: "data_atualizacao" })
  data_atualizacao: Date;
}
