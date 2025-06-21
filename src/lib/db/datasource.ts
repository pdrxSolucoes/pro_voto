// src/lib/database.ts
import { Projeto } from "../../server/entities/Projeto";
import { Usuario } from "../../server/entities/Usuario";
import { Votacao } from "../../server/entities/Votacao";
import { Voto } from "../../server/entities/Voto";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "5432"),
  username: process.env.DATABASE_USER || "vere_voto",
  password: process.env.DATABASE_PASSWORD || "vere_voto234",
  database: process.env.DATABASE_NAME || "vere_voto_db",
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  synchronize: process.env.NODE_ENV !== "production",
  logging: process.env.NODE_ENV !== "production",
  entities: [Usuario, Projeto, Votacao, Voto],
  migrations: ["./migrations/*.ts"],
});

// Função para inicializar a conexão com tratamento de erro melhorado
export async function initializeDatabase() {
  try {
    if (!AppDataSource.isInitialized) {
      // Verificar se as variáveis de ambiente estão definidas
      if (!process.env.DATABASE_USER || !process.env.DATABASE_PASSWORD) {
        console.warn(
          "Aviso: Variáveis de ambiente para banco de dados não estão configuradas. Usando valores padrão."
        );
      }

      await AppDataSource.initialize();
      console.log("Conexão com o banco de dados inicializada com sucesso!");
    }
  } catch (error) {
    console.error("Erro ao inicializar a conexão com o banco de dados:", error);

    // Informações de diagnóstico adicionais
    console.error("Configuração atual:");
    console.error(`Host: ${process.env.DATABASE_HOST || "localhost"}`);
    console.error(`Port: ${process.env.DATABASE_PORT || "5432"}`);
    console.error(
      `Database: ${process.env.DATABASE_NAME || "sistema_votacao"}`
    );
    console.error(`Username: ${process.env.DATABASE_USER || "[não definido]"}`);

    throw error;
  }
}
