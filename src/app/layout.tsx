import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

// Configure a fonte com a estratégia correta
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sistema de Votação - Câmara de Vereadores de Confresa",
  description:
    "Sistema de votação para emendas da Câmara Municipal de Vereadores de Confresa",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
