import { NextResponse } from "next/server";
import { getRepository } from "@/lib/db";
import { Votacao } from "@/server/entities/Votacao";
import { Emenda } from "@/server/entities/Emenda";
import { verifyAuthToken, isAdmin } from "@/lib/auth";

interface Params {
  params: {
    id: string;
  };
}

// POST to finalize a voting session
export async function POST(request: Request, { params }: Params) {
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
            "Permissão negada. Apenas administradores podem encerrar votações.",
        },
        { status: 403 }
      );
    }

    const votacaoId = parseInt(params.id);

    // Validate id
    if (isNaN(votacaoId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Get votacao repository
    const votacaoRepository = await getRepository(Votacao);

    // Check if votacao exists and is in progress
    const votacao = await votacaoRepository.findOne({
      where: { id: votacaoId },
      relations: ["emenda"],
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

    // Determine result
    let resultado: "aprovada" | "reprovada";

    if (votacao.votosFavor > votacao.votosContra) {
      resultado = "aprovada";
    } else {
      resultado = "reprovada";
    }

    // Update votacao
    votacao.resultado = resultado;
    votacao.dataFim = new Date();

    await votacaoRepository.save(votacao);

    // Update emenda status
    const emendaRepository = await getRepository(Emenda);
    const emenda = await emendaRepository.findOne({
      where: { id: votacao.emendaId },
    });

    if (emenda) {
      emenda.status = resultado;
      await emendaRepository.save(emenda);
    }

    return NextResponse.json({
      message: "Votação finalizada com sucesso",
      resultado,
      votacao,
    });
  } catch (error) {
    console.error("Error finalizing votacao:", error);
    return NextResponse.json(
      { error: "Erro ao finalizar votação" },
      { status: 500 }
    );
  }
}
