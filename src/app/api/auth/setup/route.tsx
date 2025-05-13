// src/app/api/auth/setup/route.ts
import { NextResponse } from "next/server";
import { hasAdminUser, setupTestUser, createFirstAdmin } from "@/lib/auth";

export async function GET() {
  try {
    // Verifique se estamos em ambiente de desenvolvimento
    if (process.env.NODE_ENV !== "production") {
      // Configure o usuário de teste
      await setupTestUser();

      // Verifique se existe algum admin
      const adminExists = await hasAdminUser();

      return NextResponse.json({
        hasAdmin: adminExists,
        testUserAvailable: true,
        testCredentials: {
          email: "admin@teste.com",
          senha: "senha123",
        },
      });
    }

    // Em produção, apenas verificamos se existe um admin
    const adminExists = await hasAdminUser();

    return NextResponse.json({
      hasAdmin: adminExists,
    });
  } catch (error) {
    console.error("Erro ao verificar configuração:", error);
    return NextResponse.json(
      { error: "Erro ao verificar configuração do sistema" },
      { status: 500 }
    );
  }
}

// Endpoint para criar o primeiro administrador
export async function POST(request: Request) {
  try {
    // Verificar se já existe um admin
    const adminExists = await hasAdminUser();

    if (adminExists) {
      return NextResponse.json(
        { error: "Já existe um administrador configurado no sistema" },
        { status: 400 }
      );
    }

    // Processar o corpo da requisição
    const contentType = request.headers.get("content-type") || "";
    let nome: string;
    let email: string;
    let senha: string;

    if (contentType.includes("application/json")) {
      const body = await request.json();
      nome = body.nome;
      email = body.email;
      senha = body.senha;
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      nome = formData.get("nome") as string;
      email = formData.get("email") as string;
      senha = formData.get("senha") as string;
    } else {
      return NextResponse.json(
        { error: "Formato de requisição inválido" },
        { status: 400 }
      );
    }

    // Validar os dados
    if (!nome || !email || !senha) {
      return NextResponse.json(
        { error: "Nome, email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Crie o primeiro admin
    const result = await createFirstAdmin(nome, email, senha);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Administrador inicial criado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao configurar primeiro admin:", error);
    return NextResponse.json(
      { error: "Erro ao configurar administrador inicial" },
      { status: 500 }
    );
  }
}
