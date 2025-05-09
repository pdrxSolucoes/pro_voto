// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { generateAuthToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: "Formato de requisição inválido" },
        { status: 400 }
      );
    }

    const { email, senha } = body;

    // Validate input
    if (!email || !senha) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Generate auth token
    const result = await generateAuthToken(email, senha);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 401 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in login:", error);
    return NextResponse.json(
      { error: "Erro ao processar login" },
      { status: 500 }
    );
  }
}
