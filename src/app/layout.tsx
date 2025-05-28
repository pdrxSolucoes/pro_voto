import "@/styles/globals.css";

import { Inter } from "next/font/google";
import { NotificationsProvider } from "@/contexts/NotificationContext";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <NotificationsProvider>{children}</NotificationsProvider>
      </body>
    </html>
  );
}
