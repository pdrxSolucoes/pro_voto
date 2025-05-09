// src/app/layout.tsx
import { AuthProvider } from "@/contexts/AuthContext";
import { DevAuthHelper } from "@/components/DevAuthHelper";
import "@/styles/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          {process.env.NODE_ENV === "development" && <DevAuthHelper />}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
