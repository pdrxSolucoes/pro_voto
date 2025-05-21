// src/app/api/auth/validate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    console.log("🔄 Iniciando validação de token...");

    // Obter o token do header Authorization
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ Header de autorização inválido ou ausente");
      return NextResponse.json(
        {
          success: false,
          message: "Token de autorização não fornecido",
        },
        { status: 401 }
      );
    }

    // Extrair o token (remover "Bearer " do início)
    const token = authHeader.substring(7);
    console.log("🔑 Token extraído do header");

    // Verificar o token usando a função existente
    const validationResult = await verifyAuthToken(token);

    if (validationResult.success) {
      console.log("✅ Token válido para usuário:", validationResult.user?.nome);

      return NextResponse.json({
        success: true,
        message: "Token válido",
        user: validationResult.user,
      });
    } else {
      console.log("❌ Token inválido:", validationResult.message);

      return NextResponse.json(
        {
          success: false,
          message: validationResult.message,
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("❌ Erro crítico na validação de token:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erro interno do servidor",
      },
      { status: 500 }
    );
  }
}

// Também permitir POST para compatibilidade
export async function POST(request: NextRequest) {
  return GET(request);
}
