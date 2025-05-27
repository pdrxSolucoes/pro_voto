import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/database";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const votacaoId = parseInt(params.id);

    if (isNaN(votacaoId)) {
      return NextResponse.json(
        { error: "ID de votação inválido" },
        { status: 400 }
      );
    }

    // Verificar se a votação existe e está em andamento
    const [votacao] = await db.query(
      `SELECT * FROM votacoes WHERE id = ? AND resultado = 'em_andamento'`,
      [votacaoId]
    );

    if (!votacao) {
      return NextResponse.json(
        { error: "Votação não encontrada ou já finalizada" },
        { status: 404 }
      );
    }

    // Contar votos
    const [contagem] = await db.query(
      `
      SELECT 
        SUM(CASE WHEN voto = 'aprovar' THEN 1 ELSE 0 END) as votosFavor,
        SUM(CASE WHEN voto = 'desaprovar' THEN 1 ELSE 0 END) as votosContra
      FROM 
        votos
      WHERE 
        votacao_id = ?
    `,
      [votacaoId]
    );

    // Determinar resultado
    const resultado =
      contagem.votosFavor > contagem.votosContra ? "aprovada" : "reprovada";

    // Atualizar votação
    await db.query(
      `
      UPDATE votacoes 
      SET resultado = ?, data_fim = NOW() 
      WHERE id = ?
    `,
      [resultado, votacaoId]
    );

    // Atualizar status do projeto
    await db.query(
      `
      UPDATE projetos 
      SET status = ? 
      WHERE id = (SELECT projeto_id FROM votacoes WHERE id = ?)
    `,
      [resultado, votacaoId]
    );

    return NextResponse.json({
      success: true,
      resultado,
      votosFavor: contagem.votosFavor || 0,
      votosContra: contagem.votosContra || 0,
    });
  } catch (error) {
    console.error("Erro ao finalizar votação:", error);
    return NextResponse.json(
      { error: "Erro ao finalizar votação" },
      { status: 500 }
    );
  }
}