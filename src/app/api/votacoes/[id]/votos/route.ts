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
    const votacoes = await db.query(
      `SELECT * FROM votacoes WHERE id = $1 AND resultado = 'em_andamento'`,
      [votacaoId]
    );

    if (!votacoes || votacoes.length === 0) {
      return NextResponse.json(
        { error: "Votação não encontrada ou já finalizada" },
        { status: 404 }
      );
    }

    // Obter dados do corpo da requisição
    const body = await request.json();
    const { vereador_id, voto } = body;

    // Validar dados
    if (!vereador_id || !voto) {
      return NextResponse.json(
        { error: "Dados incompletos" },
        { status: 400 }
      );
    }

    // Verificar se o voto é válido
    if (!["aprovar", "desaprovar", "abster"].includes(voto)) {
      return NextResponse.json(
        { error: "Voto inválido" },
        { status: 400 }
      );
    }

    // Verificar se o vereador existe
    const vereadores = await db.query(
      `SELECT * FROM usuarios WHERE id = $1 AND cargo = 'vereador'`,
      [vereador_id]
    );

    if (!vereadores || vereadores.length === 0) {
      return NextResponse.json(
        { error: "Vereador não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o vereador já votou nesta votação
    const votosExistentes = await db.query(
      `SELECT * FROM votos WHERE votacao_id = $1 AND vereador_id = $2`,
      [votacaoId, vereador_id]
    );

    if (votosExistentes && votosExistentes.length > 0) {
      return NextResponse.json(
        { error: "Vereador já votou nesta votação" },
        { status: 409 }
      );
    }

    // Registrar o voto
    await db.query(
      `
      INSERT INTO votos (votacao_id, vereador_id, voto, data_registro)
      VALUES ($1, $2, $3, NOW())
    `,
      [votacaoId, vereador_id, voto]
    );

    // Verificar se todos os vereadores já votaram
    const totalVereadoresResult = await db.query(
      `SELECT COUNT(*) as total_vereadores FROM usuarios WHERE cargo = 'vereador'`
    );
    
    const totalVotosResult = await db.query(
      `SELECT COUNT(*) as total_votos FROM votos WHERE votacao_id = $1`,
      [votacaoId]
    );

    const total_vereadores = parseInt(totalVereadoresResult[0]?.total_vereadores) || 0;
    const total_votos = parseInt(totalVotosResult[0]?.total_votos) || 0;

    // Se todos votaram, finalizar automaticamente a votação
    if (total_votos >= total_vereadores) {
      // Contar votos
      const contagemResult = await db.query(
        `
        SELECT 
          COUNT(CASE WHEN voto = 'aprovar' THEN 1 END) as votos_favor,
          COUNT(CASE WHEN voto = 'desaprovar' THEN 1 END) as votos_contra
        FROM 
          votos
        WHERE 
          votacao_id = $1
      `,
        [votacaoId]
      );

      const contagem = contagemResult[0];

      // Determinar resultado
      const resultado =
        parseInt(contagem.votos_favor) > parseInt(contagem.votos_contra) ? "aprovada" : "reprovada";

      // Atualizar votação
      await db.query(
        `
        UPDATE votacoes 
        SET resultado = $1, data_fim = NOW() 
        WHERE id = $2
      `,
        [resultado, votacaoId]
      );

      // Atualizar status do projeto
      await db.query(
        `
        UPDATE projetos 
        SET status = $1 
        WHERE id = (SELECT projeto_id FROM votacoes WHERE id = $2)
      `,
        [resultado, votacaoId]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao registrar voto:", error);
    return NextResponse.json(
      { error: "Erro ao registrar voto" },
      { status: 500 }
    );
  }
}