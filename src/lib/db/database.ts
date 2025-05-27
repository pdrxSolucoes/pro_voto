import { getConnection } from "./index";

/**
 * Classe para operações de banco de dados
 */
class Database {
  /**
   * Executa uma consulta SQL
   * @param sql Consulta SQL
   * @param params Parâmetros da consulta (opcional)
   * @returns Resultado da consulta
   */
  async query(sql: string, params: any[] = []): Promise<any[]> {
    try {
      const connection = await getConnection();
      const result = await connection.query(sql, params);
      return result;
    } catch (error) {
      console.error("Erro ao executar consulta SQL:", error);
      throw error;
    }
  }

  /**
   * Executa uma transação SQL
   * @param callback Função de callback que recebe o QueryRunner
   * @returns Resultado da transação
   */
  async transaction<T>(callback: (queryRunner: any) => Promise<T>): Promise<T> {
    const connection = await getConnection();
    const queryRunner = connection.createQueryRunner();
    
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      const result = await callback(queryRunner);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

// Exporta uma instância única do banco de dados
export const db = new Database();