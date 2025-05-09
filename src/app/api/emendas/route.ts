// src/app/api/emendas/route.ts
import { NextResponse } from "next/server";
import { getRepository } from "@/lib/db";
import { Emenda } from "@/server/entities/Emenda";
import { verifyAuthToken } from "@/lib/auth";

// GET all emendas
export async function GET(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];

    // Verify auth token
    const authResult = await verifyAuthToken(token);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.message }, { status: 401 });
    }

    // Get emendas repository
    const emendaRepository = await getRepository(Emenda);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Build query options
    let queryOptions: any = {
      order: { dataCriacao: "DESC" },
      relations: ["votacoes"],
    };

    // Add status filter if provided
    if (status) {
      queryOptions.where = { status };
    }

    // Get all emendas
    const emendas = await emendaRepository.find(queryOptions);

    return NextResponse.json(emendas);
  } catch (error: any) {
    console.error("Error fetching emendas:", error);

    // Send more detailed error for debugging
    return NextResponse.json(
      {
        error: "Erro ao buscar emendas",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// POST new emenda
export async function POST(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];

    // Verify auth token
    const authResult = await verifyAuthToken(token);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.message }, { status: 401 });
    }

    // Check admin permission
    if (authResult.user?.cargo !== "admin") {
      return NextResponse.json(
        {
          error:
            "Permissão negada. Apenas administradores podem criar emendas.",
        },
        { status: 403 }
      );
    }

    // Parse request body with error handling
    let body;
    try {
      const rawText = await request.text();
      body = JSON.parse(rawText);
    } catch (error) {
      console.error("Error parsing request body:", error);
      return NextResponse.json(
        { error: "Formato de requisição inválido. Verifique o JSON enviado." },
        { status: 400 }
      );
    }

    const { titulo, descricao } = body;

    // Validate input
    if (!titulo || !descricao) {
      return NextResponse.json(
        { error: "Título e descrição são obrigatórios" },
        { status: 400 }
      );
    }

    // Create new emenda
    const emendaRepository = await getRepository(Emenda);
    const emenda = emendaRepository.create({
      titulo,
      descricao,
      dataApresentacao: new Date(),
      status: "pendente",
    });

    // Save to database
    const savedEmenda = await emendaRepository.save(emenda);
    return NextResponse.json(savedEmenda, { status: 201 });
  } catch (error: any) {
    console.error("Error creating emenda:", error);
    return NextResponse.json(
      {
        error: "Erro ao criar emenda",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
