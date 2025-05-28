import "@/styles/globals.css";

import { Inter } from "next/font/google";
import { NotificationsProvider } from "@/contexts/NotificationContext";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          <NotificationsProvider>{children}</NotificationsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
