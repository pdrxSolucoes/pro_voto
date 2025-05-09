import { NextResponse } from "next/server";
import { getRepository } from "@/lib/db";
import { Votacao } from "@/server/entities/Votacao";
import { Emenda } from "@/server/entities/Emenda";
import { verifyAuthToken, isAdmin } from "@/lib/auth";

// GET all votacoes
export async function GET(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];

    // Verify auth token
    const authResult = await verifyAuthToken(token);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.message }, { status: 401 });
    }

    // Get votacoes repository
    const votacaoRepository = await getRepository(Votacao);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const resultado = searchParams.get("resultado");

    // Build query
    const queryOptions: any = {
      order: { dataInicio: "DESC" },
      relations: ["emenda", "votos", "votos.vereador"],
    };

    if (resultado) {
      queryOptions.where = { resultado };
    }

    // Get all votacoes
    const votacoes = await votacaoRepository.find(queryOptions);

    return NextResponse.json(votacoes);
  } catch (error) {
    console.error("Error fetching votacoes:", error);
    return NextResponse.json(
      { error: "Erro ao buscar votações" },
      { status: 500 }
    );
  }
}

// POST new votacao (start a new voting session)
export async function POST(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];

    // Verify auth token
    const authResult = await verifyAuthToken(token);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.message }, { status: 401 });
    }

    // Check admin permission
    if (!isAdmin(authResult.user)) {
      return NextResponse.json(
        {
          error:
            "Permissão negada. Apenas administradores podem iniciar votações.",
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { emendaId } = body;

    // Validate input
    if (!emendaId) {
      return NextResponse.json(
        { error: "ID da emenda é obrigatório" },
        { status: 400 }
      );
    }

    // Check if emenda exists
    const emendaRepository = await getRepository(Emenda);
    const emenda = await emendaRepository.findOne({ where: { id: emendaId } });

    if (!emenda) {
      return NextResponse.json(
        { error: "Emenda não encontrada" },
        { status: 404 }
      );
    }

    // Check if emenda is already in voting
    if (emenda.status === "em_votacao") {
      return NextResponse.json(
        { error: "Esta emenda já está em votação" },
        { status: 400 }
      );
    }

    // Check if emenda is already approved or rejected
    if (emenda.status === "aprovada" || emenda.status === "reprovada") {
      return NextResponse.json(
        { error: "Esta emenda já foi votada" },
        { status: 400 }
      );
    }

    // Create new votacao
    const votacaoRepository = await getRepository(Votacao);
    const votacao = votacaoRepository.create({
      emendaId: emenda.id,
      dataInicio: new Date(),
      resultado: "em_andamento",
      votosFavor: 0,
      votosContra: 0,
      abstencoes: 0,
    });

    // Save to database
    await votacaoRepository.save(votacao);

    // Update emenda status
    emenda.status = "em_votacao";
    await emendaRepository.save(emenda);

    return NextResponse.json(votacao, { status: 201 });
  } catch (error) {
    console.error("Error creating votacao:", error);
    return NextResponse.json(
      { error: "Erro ao iniciar votação" },
      { status: 500 }
    );
  }
}
