import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1721422000000 implements MigrationInterface {
  name = "CreateTables1721422000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(
      `CREATE TYPE "public"."usuario_cargo_enum" AS ENUM('vereador', 'admin')`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."projeto_status_enum" AS ENUM('pendente', 'em_votacao', 'aprovada', 'reprovada')`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."votacao_resultado_enum" AS ENUM('aprovada', 'reprovada', 'em_andamento')`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."voto_voto_enum" AS ENUM('aprovar', 'desaprovar', 'abster')`
    );

    // Create usuarios table
    await queryRunner.query(`
            CREATE TABLE "usuarios" (
                "id" SERIAL NOT NULL,
                "nome" character varying NOT NULL,
                "email" character varying NOT NULL,
                "senha" character varying NOT NULL,
                "cargo" "public"."usuario_cargo_enum" NOT NULL DEFAULT 'vereador',
                "ativo" boolean NOT NULL DEFAULT true,
                "data_criacao" TIMESTAMP NOT NULL DEFAULT now(),
                "data_atualizacao" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_446adfc18b35418aac32ae0b7b5" UNIQUE ("email"),
                CONSTRAINT "PK_d7281c63c176e152e4c531594a8" PRIMARY KEY ("id")
            )
        `);

    // Create projetos table
    await queryRunner.query(`
            CREATE TABLE "projetos" (
                "id" SERIAL NOT NULL,
                "titulo" character varying NOT NULL,
                "descricao" character varying NOT NULL,
                "data_apresentacao" TIMESTAMP NOT NULL,
                "status" "public"."projeto_status_enum" NOT NULL DEFAULT 'pendente',
                "data_criacao" TIMESTAMP NOT NULL DEFAULT now(),
                "data_atualizacao" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_968b3adb2a95770c7d3e3cd9f26" PRIMARY KEY ("id")
            )
        `);

    // Create votacoes table
    await queryRunner.query(`
            CREATE TABLE "votacoes" (
                "id" SERIAL NOT NULL,
                "projeto_id" integer NOT NULL,
                "data_inicio" TIMESTAMP NOT NULL,
                "data_fim" TIMESTAMP,
                "resultado" "public"."votacao_resultado_enum" NOT NULL DEFAULT 'em_andamento',
                "votos_favor" integer NOT NULL DEFAULT '0',
                "votos_contra" integer NOT NULL DEFAULT '0',
                "abstencoes" integer NOT NULL DEFAULT '0',
                "data_criacao" TIMESTAMP NOT NULL DEFAULT now(),
                "data_atualizacao" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_9c8f0d8a3d7d3e33a76f3a01383" PRIMARY KEY ("id")
            )
        `);

    // Create votos table
    await queryRunner.query(`
            CREATE TABLE "votos" (
                "id" SERIAL NOT NULL,
                "votacao_id" integer NOT NULL,
                "vereador_id" integer NOT NULL,
                "voto" "public"."voto_voto_enum" NOT NULL,
                "data_voto" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_5f16f67e0d6da39364aabab1fa1" PRIMARY KEY ("id")
            )
        `);

    // Add foreign key constraints
    await queryRunner.query(`
            ALTER TABLE "votacoes" 
            ADD CONSTRAINT "FK_votacoes_projeto_id" 
            FOREIGN KEY ("projeto_id") 
            REFERENCES "projetos"("id") 
            ON DELETE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE "votos" 
            ADD CONSTRAINT "FK_votos_votacao_id" 
            FOREIGN KEY ("votacao_id") 
            REFERENCES "votacoes"("id") 
            ON DELETE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE "votos" 
            ADD CONSTRAINT "FK_votos_vereador_id" 
            FOREIGN KEY ("vereador_id") 
            REFERENCES "usuarios"("id") 
            ON DELETE CASCADE
        `);

    // Add unique constraint to prevent duplicate votes
    await queryRunner.query(`
            ALTER TABLE "votos" 
            ADD CONSTRAINT "UQ_votacao_vereador" 
            UNIQUE ("votacao_id", "vereador_id")
        `);

    // Create admin user
    await queryRunner.query(`
            INSERT INTO "usuarios" ("nome", "email", "senha", "cargo")
            VALUES ('Administrador', 'admin@camara.confresa.mt.gov.br', '$2a$10$hvOa9FAinlLYAjgnyRyVXuG2zfvoRYxmxLpCK9o5vEMYQlTvnHbGW', 'admin')
        `); // Senha: admin123
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    await queryRunner.query(
      `ALTER TABLE "votos" DROP CONSTRAINT "FK_votos_vereador_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "votos" DROP CONSTRAINT "FK_votos_votacao_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "votacoes" DROP CONSTRAINT "FK_votacoes_projeto_id"`
    );

    // Drop unique constraint
    await queryRunner.query(
      `ALTER TABLE "votos" DROP CONSTRAINT "UQ_votacao_vereador"`
    );

    // Drop tables
    await queryRunner.query(`DROP TABLE "votos"`);
    await queryRunner.query(`DROP TABLE "votacoes"`);
    await queryRunner.query(`DROP TABLE "projetos"`);
    await queryRunner.query(`DROP TABLE "usuarios"`);

    // Drop enum types
    await queryRunner.query(`DROP TYPE "public"."voto_voto_enum"`);
    await queryRunner.query(`DROP TYPE "public"."votacao_resultado_enum"`);
    await queryRunner.query(`DROP TYPE "public"."projeto_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."usuario_cargo_enum"`);
  }
}
