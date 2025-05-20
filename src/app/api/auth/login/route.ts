// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    let email, senha;

    // Verificar o Content-Type
    const contentType = request.headers.get("Content-Type") || "";

    if (contentType.includes("application/json")) {
      // Processar como JSON
      const body = await request.json();
      email = body.email;
      senha = body.senha;
    } else if (
      contentType.includes("multipart/form-data") ||
      contentType.includes("application/x-www-form-urlencoded")
    ) {
      // Processar como Form Data
      const formData = await request.formData();
      email = formData.get("email") as string;
      senha = formData.get("senha") as string;
    } else {
      return NextResponse.json(
        { error: "Formato de dados não suportado" },
        { status: 415 }
      );
    }

    // Validar campos obrigatórios
    if (!email || !senha) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Autenticar usuário
    const result = await authenticateUser(email, senha);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 401 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro no processamento de login:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Erro ao processar login",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Ocorreu um erro inesperado durante o login" },
      { status: 500 }
    );
  }
}
