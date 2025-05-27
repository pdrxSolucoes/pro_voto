import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/database";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projetoId = parseInt(params.id);

    if (isNaN(projetoId)) {
      return NextResponse.json(
        { error: "ID de projeto inválido" },
        { status: 400 }
      );
    }

    // Verificar se o projeto existe e está pendente
    const projetos = await db.query(
      `SELECT * FROM projetos WHERE id = $1`,
      [projetoId]
    );

    if (!projetos || projetos.length === 0) {
      return NextResponse.json(
        { error: "Projeto não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se já existe uma votação em andamento para este projeto
    const votacoesExistentes = await db.query(
      `SELECT * FROM votacoes WHERE projeto_id = $1 AND resultado = 'em_andamento'`,
      [projetoId]
    );

    if (votacoesExistentes && votacoesExistentes.length > 0) {
      return NextResponse.json(
        { error: "Já existe uma votação em andamento para este projeto" },
        { status: 409 }
      );
    }

    // Abordagem simplificada: duas consultas separadas
    
    // 1. Inserir a votação e retornar o ID
    const insertResult = await db.query(
      `INSERT INTO votacoes (projeto_id, data_inicio, resultado) 
       VALUES ($1, NOW(), 'em_andamento') 
       RETURNING id`,
      [projetoId]
    );
    
    // Obter o ID da votação recém-criada
    const votacaoId = insertResult[0]?.id;
    
    if (!votacaoId) {
      throw new Error("Falha ao obter ID da votação criada");
    }
    
    // 2. Atualizar status do projeto
    await db.query(
      `UPDATE projetos SET status = 'em_votacao' WHERE id = $1`,
      [projetoId]
    );

    return NextResponse.json({
      success: true,
      votacao: {
        id: votacaoId,
        projeto_id: projetoId,
        data_inicio: new Date(),
        resultado: "em_andamento",
      },
    });
  } catch (error) {
    console.error("Erro ao iniciar votação:", error);
    return NextResponse.json(
      { error: "Erro ao iniciar votação" },
      { status: 500 }
    );
  }
}