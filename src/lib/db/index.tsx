import { AppDataSource } from "./datasource";

// Initialize database singleton
let initialized = false;

// Function to initialize database connection
export const initializeDatabase = async () => {
  if (!initialized) {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
        console.log("Database connection has been established successfully.");
        initialized = true;
      }
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      // Don't terminate the app to allow Next.js to continue running
      // Just log the error and allow failed DB operations to be handled gracefully
    }
  }
  return AppDataSource;
};

// Get database connection (initializes if necessary)
export const getConnection = async () => {
  if (!initialized) {
    await initializeDatabase();
  }
  return AppDataSource;
};

// Get repository for a specified entity
export const getRepository = async (entity: any) => {
  const dataSource = await getConnection();
  return dataSource.getRepository(entity);
};
