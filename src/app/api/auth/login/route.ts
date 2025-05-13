// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    console.log(request);
    const body = await request.json();
    const { email, senha } = body;

    console.log("Dados JSON processados:", { email });

    // Validar campos obrigatórios
    if (!email || !senha) {
      console.warn("Campos obrigatórios ausentes", {
        emailFornecido: !!email,
        senhaFornecida: !!senha,
      });

      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Autenticar usuário
    console.log("Autenticando usuário:", email);
    const result = await authenticateUser(email, senha);

    if (!result.success) {
      console.log("Falha na autenticação:", result.message);
      return NextResponse.json({ error: result.message }, { status: 401 });
    }

    console.log("Autenticação bem-sucedida para:", email);
    return NextResponse.json(result);
  } catch (error) {
    // Tratamento detalhado de erros
    console.error("Erro no processamento de login:", error);

    // Verificar se é um erro conhecido e fornecer mensagem específica
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Erro ao processar login",
          details: error.message,
        },
        { status: 500 }
      );
    }

    // Erro genérico
    return NextResponse.json(
      { error: "Ocorreu um erro inesperado durante o login" },
      { status: 500 }
    );
  }
}

// Opcional: adicionar endpoint OPTIONS para lidar com CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
