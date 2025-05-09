import { NextResponse } from "next/server";
import { AppDataSource } from "../../../lib/db/datasource";

/**
 * GET handler for testing database connection
 * Endpoint: /api/test
 * @returns JSON response indicating connection status
 */
export async function GET() {
  try {
    // Check if data source is initialized
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Data Source has been initialized!");
    }

    // Test the connection
    const testQuery = await AppDataSource.query("SELECT NOW() as time");

    return NextResponse.json(
      {
        success: true,
        message: "Database connection successful",
        serverTime: testQuery[0].time,
        dbStatus: "connected",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database connection error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
        dbStatus: "disconnected",
      },
      { status: 500 }
    );
  }
}
