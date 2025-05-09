// src/server/cli/runMigrations.ts
import "reflect-metadata";
import { AppDataSource } from "../../lib/db/datasource";

AppDataSource.initialize()
  .then(async () => {
    console.log("Running migrations...");
    return AppDataSource.runMigrations();
  })
  .then((migrations) => {
    console.log(`Successfully ran ${migrations.length} migrations`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error during migration:", error);
    process.exit(1);
  });
