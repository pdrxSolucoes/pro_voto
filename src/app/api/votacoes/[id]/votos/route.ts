import { NextResponse } from "next/server";
import { getRepository } from "@/lib/db";
import { Votacao } from "@/server/entities/Votacao";
import { Voto } from "@/server/entities/Voto";
import { verifyAuthToken, isVereador } from "@/lib/auth";

interface Params {
  params: {
    id: string;
  };
}

// GET votes for a specific votacao
export async function GET(request: Request, { params }: Params) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];

    // Verify auth token
    const authResult = await verifyAuthToken(token);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.message }, { status: 401 });
    }

    const votacaoId = parseInt(params.id);

    // Validate id
    if (isNaN(votacaoId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Get voto repository
    const votoRepository = await getRepository(Voto);

    // Get all votos for this votacao
    const votos = await votoRepository.find({
      where: { votacaoId },
      relations: ["vereador"],
      order: { dataVoto: "DESC" },
    });

    return NextResponse.json(votos);
  } catch (error) {
    console.error("Error fetching votos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar votos" },
      { status: 500 }
    );
  }
}

// POST new voto (register a vote)
export async function POST(request: Request, { params }: Params) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];

    // Verify auth token
    const authResult = await verifyAuthToken(token);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.message }, { status: 401 });
    }

    // Check vereador permission
    if (!isVereador(authResult.user)) {
      return NextResponse.json(
        { error: "Permissão negada. Apenas vereadores podem votar." },
        { status: 403 }
      );
    }

    const votacaoId = parseInt(params.id);

    // Validate id
    if (isNaN(votacaoId)) {
      return NextResponse.json(
        { error: "ID da votação inválido" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { voto } = body;

    // Validate input
    if (!voto || !["aprovar", "desaprovar", "abster"].includes(voto)) {
      return NextResponse.json(
        {
          error: 'Voto inválido. Deve ser "aprovar", "desaprovar" ou "abster"',
        },
        { status: 400 }
      );
    }

    // Get votacao repository
    const votacaoRepository = await getRepository(Votacao);

    // Check if votacao exists and is in progress
    const votacao = await votacaoRepository.findOne({
      where: { id: votacaoId },
    });

    if (!votacao) {
      return NextResponse.json(
        { error: "Votação não encontrada" },
        { status: 404 }
      );
    }

    if (votacao.resultado !== "em_andamento") {
      return NextResponse.json(
        { error: "Esta votação já foi encerrada" },
        { status: 400 }
      );
    }

    // Get voto repository
    const votoRepository = await getRepository(Voto);

    // Check if vereador already voted
    const existingVoto = await votoRepository.findOne({
      where: {
        votacaoId,
        vereadorId: authResult.user!.id,
      },
    });

    if (existingVoto) {
      return NextResponse.json(
        { error: "Você já votou nesta votação" },
        { status: 400 }
      );
    }

    // Create new voto
    const novoVoto = votoRepository.create({
      votacaoId,
      vereadorId: authResult.user!.id,
      voto: voto as any,
      dataVoto: new Date(),
    });

    // Save voto
    await votoRepository.save(novoVoto);

    // Update votacao counters
    if (voto === "aprovar") {
      votacao.votosFavor += 1;
    } else if (voto === "desaprovar") {
      votacao.votosContra += 1;
    } else {
      votacao.abstencoes += 1;
    }

    await votacaoRepository.save(votacao);

    return NextResponse.json(novoVoto, { status: 201 });
  } catch (error) {
    console.error("Error creating voto:", error);
    return NextResponse.json(
      { error: "Erro ao registrar voto" },
      { status: 500 }
    );
  }
}
