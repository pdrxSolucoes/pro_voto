import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import type { Voto } from "./Voto";

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

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  data_criacao: Date;

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  data_atualizacao: Date;

  // Use string literal for entity name
  @OneToMany("Voto", "vereador")
  votos: Voto[];
}
