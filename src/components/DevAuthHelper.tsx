// src/components/DevAuthHelper.tsx
"use client";

import { useEffect } from "react";

export function DevAuthHelper() {
  useEffect(() => {
    // Only in development mode
    if (process.env.NODE_ENV === "development") {
      // Check if there's already a token
      const hasToken = localStorage.getItem("authToken");

      if (!hasToken) {
        // Set a development token and user
        localStorage.setItem("authToken", "dev-token");
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: 1,
            nome: "Admin de Desenvolvimento",
            email: "admin@example.com",
            cargo: "admin",
          })
        );

        console.log("DEV AUTH: Development admin user has been set up");
      }
    }
  }, []);

  return null; // This component doesn't render anything
}
