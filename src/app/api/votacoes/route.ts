// src/app/api/votacoes/route.ts
import { NextResponse } from "next/server";
import { getRepository } from "@/lib/db";
import { Projeto } from "@/server/entities/Projeto";
import { Votacao } from "@/server/entities/Votacao";
import { verifyAuthToken } from "@/lib/auth";

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
        { error: "Apenas administradores podem iniciar votações" },
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

    const { projetoId } = body;

    // Validate input
    if (!projetoId) {
      return NextResponse.json(
        { error: "ID do projeto é obrigatório" },
        { status: 400 }
      );
    }

    // Check if projeto exists
    const projetoRepository = await getRepository(Projeto);
    const projeto = await projetoRepository.findOneBy({ id: projetoId });

    if (!projeto) {
      return NextResponse.json(
        { error: "Projeto não encontrado" },
        { status: 404 }
      );
    }

    // Check if projeto is available for voting
    if (projeto.status !== "pendente") {
      return NextResponse.json(
        { error: "Apenas projetos pendentes podem iniciar votação" },
        { status: 400 }
      );
    }

    // Create new votacao
    const votacaoRepository = await getRepository(Votacao);
    const votacao = votacaoRepository.create({
      projetoId: projeto.id,
      dataInicio: new Date(),
      resultado: "em_andamento",
      votosFavor: 0,
      votosContra: 0,
      abstencoes: 0,
    });

    // Update projeto status
    projeto.status = "em_votacao";
    await projetoRepository.save(projeto);

    // Save votacao
    await votacaoRepository.save(votacao);

    return NextResponse.json(votacao, { status: 201 });
  } catch (error) {
    console.error("Error starting voting:", error);
    return NextResponse.json(
      { error: "Erro ao iniciar votação" },
      { status: 500 }
    );
  }
}
