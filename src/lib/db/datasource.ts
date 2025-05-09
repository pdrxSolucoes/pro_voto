// src/lib/db/datasource.ts
import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import path from "path";
import { Usuario } from "../../server/entities/Usuario";
import { Emenda } from "../../server/entities/Emenda";
import { Votacao } from "../../server/entities/Votacao";
import { Voto } from "../../server/entities/Voto";
import { CreateTables1721422000000 } from "../../server/migrations/InitialSchema1721422000000";
import * as dotenv from "dotenv";

dotenv.config();

const dataSourceOptions: DataSourceOptions = {
  type: "postgres",
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "5432"),
  username: process.env.DATABASE_USER || "vere_voto",
  password: process.env.DATABASE_PASSWORD || "vere_voto234",
  database: process.env.DATABASE_NAME || "vere_voto_db",
  synchronize: false, // Important: Keep this false in production
  logging: process.env.NODE_ENV === "development",
  entities: [Usuario, Emenda, Votacao, Voto],
  migrations: [CreateTables1721422000000],
  migrationsTableName: "migrations",
};

// Create and export the data source
export const AppDataSource = new DataSource(dataSourceOptions);
