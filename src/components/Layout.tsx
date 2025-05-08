import React, { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

interface HeaderProps extends HTMLAttributes<HTMLElement> {
  className?: string;
  children: ReactNode;
}

export function Header({ className, children, ...props }: HeaderProps) {
  return (
    <header
      className={cn(
        "bg-primary text-white py-4 px-6 flex justify-between items-center",
        className
      )}
      {...props}
    >
      {children}
    </header>
  );
}

interface FooterProps extends HTMLAttributes<HTMLElement> {
  className?: string;
  children: ReactNode;
}

export function Footer({ className, children, ...props }: FooterProps) {
  return (
    <footer
      className={cn("bg-primary text-white py-3 px-6 text-center", className)}
      {...props}
    >
      {children}
    </footer>
  );
}

interface MainProps extends HTMLAttributes<HTMLElement> {
  className?: string;
  children: ReactNode;
}

export function Main({ className, children, ...props }: MainProps) {
  return (
    <main
      className={cn("flex-grow container mx-auto py-8 px-4", className)}
      {...props}
    >
      {children}
    </main>
  );
}

interface LayoutProps {
  children: ReactNode;
}

export function RootLayout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header>
        <div className="flex items-center space-x-2">
          <Link href={"/"}>
            <Image
              src={require("@/assets/BrasaoConfresa.png")}
              alt="Câmara dos Vereadores de Confresa"
              className="h-12 w-auto bg-white rounded-full"
              width={50}
              height={50}
            />
          </Link>
          <h1 className="text-xl font-bold">Sistema de Votação</h1>
        </div>
        <nav className="hidden md:flex space-x-4">
          <Link href="/" className="text-white hover:text-gray-200">
            Início
          </Link>
          <a href="/emendas" className="text-white hover:text-gray-200">
            Emendas
          </a>
          <a href="/votacao" className="text-white hover:text-gray-200">
            Votação
          </a>
          <a href="/resultados" className="text-white hover:text-gray-200">
            Resultados
          </a>
        </nav>
      </Header>

      <Main>{children}</Main>

      <Footer>
        <p>
          © {new Date().getFullYear()} - Sistema de Votação da Câmara dos
          Vereadores de Confresa
        </p>
      </Footer>
    </div>
  );
}
