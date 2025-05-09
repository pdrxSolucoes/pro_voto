// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";

export async function POST(request: Request) {
  console.log("entrou", request);

  try {
    // Parse request body with error handling
    let body;
    console.log("entrou dados", body);
    try {
      body = await request.json();
      console.log("entrou dados", body);
      console.log("entrou dados", request);
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

    // Authenticate user
    const result = await authenticateUser(email, senha);

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
