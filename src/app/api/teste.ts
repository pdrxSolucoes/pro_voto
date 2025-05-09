import type { NextApiRequest, NextApiResponse } from "next";
import { AppDataSource } from "@/lib/db/datasource";

type ResponseData = {
  success: boolean;
  message: string;
  serverTime?: Date;
  dbStatus: string;
  error?: string;
};

/**
 * API handler for testing database connection
 * Endpoint: /api/test
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
      dbStatus: "unknown",
    });
  }

  try {
    // Check if data source is initialized
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Data Source has been initialized!");
    }

    // Test the connection
    const testQuery = await AppDataSource.query("SELECT NOW() as time");

    return res.status(200).json({
      success: true,
      message: "Database connection successful",
      serverTime: testQuery[0].time,
      dbStatus: "connected",
    });
  } catch (error) {
    console.error("Database connection error:", error);

    return res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error instanceof Error ? error.message : "Unknown error",
      dbStatus: "disconnected",
    });
  }
}
