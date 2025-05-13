// src/app/api/emendas/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getRepository } from "@/lib/db";
import { Emenda } from "@/server/entities/Emenda";
import { verifyAuthToken } from "@/lib/auth";

// GET all emendas
export async function GET(request: NextRequest) {
  try {
    // Obter token do cabeçalho de autorização
    const token = request.headers.get("Authorization")?.split(" ")[1];

    // Verificar token de autenticação
    const authResult = await verifyAuthToken(token);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.message }, { status: 401 });
    }

    // Obter repositório de emendas
    const emendaRepository = await getRepository(Emenda);

    // Obter parâmetros de consulta
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    // Construir query base
    const queryBuilder = emendaRepository
      .createQueryBuilder("emenda")
      .orderBy("emenda.data_criacao", "DESC")
      .take(limit)
      .skip(skip);

    // Adicionar filtro de status, se fornecido
    if (status) {
      queryBuilder.andWhere("emenda.status = :status", { status });
    }

    // Executar a consulta
    const [emendas, total] = await queryBuilder.getManyAndCount();

    // Retornar resultados paginados
    return NextResponse.json({
      data: emendas,
      meta: {
        total,
        page,
        limit,
        pageCount: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar emendas:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

// GET uma emenda específica por ID
export async function HEAD(request: NextRequest) {
  return handleGetById(request, true);
}

// POST criar nova emenda
export async function POST(request: NextRequest) {
  try {
    // Validar autenticação
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const authResult = await verifyAuthToken(token);

    if (!authResult.success) {
      return NextResponse.json({ error: authResult.message }, { status: 401 });
    }

    // Verificar se o usuário é admin
    if (authResult.user?.cargo !== "admin") {
      return NextResponse.json(
        { error: "Apenas administradores podem criar emendas" },
        { status: 403 }
      );
    }

    // Obter dados da requisição
    const data = await request.json();

    // Validar dados
    if (!data.titulo || !data.descricao) {
      return NextResponse.json(
        { error: "Título e descrição são obrigatórios" },
        { status: 400 }
      );
    }

    // Criar nova emenda
    const emendaRepository = await getRepository(Emenda);
    const novaEmenda = emendaRepository.create({
      titulo: data.titulo,
      descricao: data.descricao,
      data_apresentacao: data.data_apresentacao || new Date(),
      status: "pendente",
      data_criacao: new Date(),
      data_atualizacao: new Date(),
    });

    // Salvar emenda no banco
    const emendaSalva = await emendaRepository.save(novaEmenda);

    return NextResponse.json(emendaSalva, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar emenda:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

// Função auxiliar para obter uma emenda por ID
async function handleGetById(request: NextRequest, headOnly = false) {
  try {
    // Validar autenticação
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const authResult = await verifyAuthToken(token);

    if (!authResult.success) {
      return NextResponse.json({ error: authResult.message }, { status: 401 });
    }

    // Extrair ID da URL
    const id = request.nextUrl.pathname.split("/").pop();
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Buscar emenda
    const emendaRepository = await getRepository(Emenda);
    const emenda = await emendaRepository.findOne({
      where: { id: parseInt(id) },
    });

    if (!emenda) {
      return NextResponse.json(
        { error: "Emenda não encontrada" },
        { status: 404 }
      );
    }

    // Para HEAD requests, retornar apenas cabeçalhos
    if (headOnly) {
      return new NextResponse(null, {
        status: 200,
        headers: {
          "X-Resource-Found": "true",
          "Last-Modified": emenda.data_atualizacao.toISOString(),
        },
      });
    }

    return NextResponse.json(emenda);
  } catch (error) {
    console.error(`Erro ao buscar emenda por ID:`, error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
