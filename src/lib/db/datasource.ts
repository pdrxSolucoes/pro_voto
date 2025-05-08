import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import path from "path";
import { Usuario } from "@server/entities/Usuario";
import { Emenda } from "@server/entities/Emenda";
import { Votacao } from "@server/entities/Votacao";
import { Voto } from "@server/entities/Voto";
import * as dotenv from "dotenv";

dotenv.config();

// Rest of your datasource configuration...

const dataSourceOptions: DataSourceOptions = {
  type: "postgres",
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "5432"),
  username: process.env.DATABASE_USER || "vere_voto",
  password: process.env.DATABASE_PASSWORD || "vere_voto234",
  database: process.env.DATABASE_NAME || "vere_voto_db",
  synchronize: process.env.NODE_ENV === "development", // Be careful with this in production
  logging: process.env.NODE_ENV === "development",
  // Use glob patterns to find entity files
  entities: [Usuario, Emenda, Votacao, Voto],
  migrations: [path.join(__dirname, "../../server/migrations/**/*.{ts,js}")],
  subscribers: [path.join(__dirname, "../../server/subscribers/**/*.{ts,js}")],
  cache: true,
};

// Create and export the data source
export const AppDataSource = new DataSource(dataSourceOptions);
