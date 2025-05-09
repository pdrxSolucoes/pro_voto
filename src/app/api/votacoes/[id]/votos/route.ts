// src/app/api/votos/route.ts
import { NextResponse } from "next/server";
import { getRepository } from "@/lib/db";
import { Votacao } from "@/server/entities/Votacao";
import { Voto } from "@/server/entities/Voto";
import { verifyAuthToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];

    // Verify auth token
    const authResult = await verifyAuthToken(token);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.message }, { status: 401 });
    }

    // Check vereador permission
    if (authResult.user?.cargo !== "vereador") {
      return NextResponse.json(
        { error: "Apenas vereadores podem votar" },
        { status: 403 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: "Formato de requisição inválido" },
        { status: 400 }
      );
    }

    const { votacaoId, voto } = body;

    // Validate input
    if (!votacaoId || !voto) {
      return NextResponse.json(
        { error: "ID da votação e voto são obrigatórios" },
        { status: 400 }
      );
    }

    // Validate vote value
    if (!["aprovar", "desaprovar", "abster"].includes(voto)) {
      return NextResponse.json(
        { error: "Voto deve ser 'aprovar', 'desaprovar' ou 'abster'" },
        { status: 400 }
      );
    }

    // Check if votacao exists and is open
    const votacaoRepository = await getRepository(Votacao);
    const votacao = await votacaoRepository.findOneBy({ id: votacaoId });

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

    // Check if vereador already voted
    const votoRepository = await getRepository(Voto);
    const existingVoto = await votoRepository.findOneBy({
      votacaoId,
      vereadorId: authResult.user.id,
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
      vereadorId: authResult.user.id,
      voto,
    });

    // Update votacao counters
    if (voto === "aprovar") {
      votacao.votosFavor += 1;
    } else if (voto === "desaprovar") {
      votacao.votosContra += 1;
    } else {
      votacao.abstencoes += 1;
    }

    // Save voto and update votacao
    await votoRepository.save(novoVoto);
    await votacaoRepository.save(votacao);

    return NextResponse.json(novoVoto, { status: 201 });
  } catch (error) {
    console.error("Error registering vote:", error);
    return NextResponse.json(
      { error: "Erro ao registrar voto" },
      { status: 500 }
    );
  }
}
