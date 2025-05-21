// src/app/api/projetos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getRepository } from "@/lib/db";
import { Projeto } from "@/server/entities/Projeto";
import { verifyAuthToken } from "@/lib/auth";

// GET all projetos
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const authResult = await verifyAuthToken(token);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.message }, { status: 401 });
    }

    const projetoRepository = await getRepository(Projeto);

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    const queryBuilder = projetoRepository
      .createQueryBuilder("projeto")
      .orderBy("projeto.data_criacao", "DESC")
      .take(limit)
      .skip(skip);

    if (status) {
      queryBuilder.andWhere("projeto.status = :status", { status });
    }

    const [projetos, total] = await queryBuilder.getManyAndCount();

    return NextResponse.json({
      data: projetos,
      meta: {
        total,
        page,
        limit,
        pageCount: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar projetos:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

// GET um projeto específico por ID
export async function HEAD(request: NextRequest) {
  return handleGetById(request, true);
}

// POST criar novo projeto
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const authResult = await verifyAuthToken(token);

    if (!authResult.success) {
      return NextResponse.json({ error: authResult.message }, { status: 401 });
    }

    if (authResult.user?.cargo !== "admin") {
      return NextResponse.json(
        { error: "Apenas administradores podem criar projetos" },
        { status: 403 }
      );
    }

    const data = await request.json();

    if (!data.titulo || !data.descricao) {
      return NextResponse.json(
        { error: "Título e descrição são obrigatórios" },
        { status: 400 }
      );
    }

    const projetoRepository = await getRepository(Projeto);
    const novoProjeto = projetoRepository.create({
      titulo: data.titulo,
      descricao: data.descricao,
      data_apresentacao: data.data_apresentacao || new Date(),
      status: "pendente",
      data_criacao: new Date(),
      data_atualizacao: new Date(),
    });

    const projetoSalvo = await projetoRepository.save(novoProjeto);

    return NextResponse.json(projetoSalvo, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar projeto:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

// Função auxiliar para obter um projeto por ID
async function handleGetById(request: NextRequest, headOnly = false) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const authResult = await verifyAuthToken(token);

    if (!authResult.success) {
      return NextResponse.json({ error: authResult.message }, { status: 401 });
    }

    const id = request.nextUrl.pathname.split("/").pop();
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const projetoRepository = await getRepository(Projeto);
    const projeto = await projetoRepository.findOne({
      where: { id: parseInt(id) },
    });

    if (!projeto) {
      return NextResponse.json(
        { error: "Projeto não encontrado" },
        { status: 404 }
      );
    }

    if (headOnly) {
      return new NextResponse(null, {
        status: 200,
        headers: {
          "X-Resource-Found": "true",
          "Last-Modified": projeto.data_atualizacao.toISOString(),
        },
      });
    }

    return NextResponse.json(projeto);
  } catch (error) {
    console.error(`Erro ao buscar projeto por ID:`, error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
