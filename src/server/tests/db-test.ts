// src/index.ts
import "reflect-metadata"; // Importante para TypeORM
import { AppDataSource } from "../../lib/db/datasource";

// Função para testar a conexão
async function testConnection() {
  try {
    await AppDataSource.initialize();
    console.log("✅ Conectado ao banco de dados PostgreSQL com sucesso!");

    // Teste simples
    const result = await AppDataSource.query("SELECT 1 as test");
    console.log("Resultado do teste:", result);

    // Fechar conexão
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao conectar ao banco de dados:", error);
    process.exit(1);
  }
}

// Executar o teste
testConnection();
