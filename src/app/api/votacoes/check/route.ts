import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/database";

export async function GET(request: NextRequest) {
  try {
    // Buscar todas as votações
    const votacoes = await db.query(
      `
      SELECT 
        v.id,
        v.projeto_id,
        v.data_inicio,
        v.data_fim,
        v.resultado,
        p.titulo,
        p.descricao,
        p.status
      FROM 
        votacoes v
      JOIN 
        projetos p ON v.projeto_id = p.id
    `
    );

    return NextResponse.json({
      success: true,
      votacoes
    });
  } catch (error) {
    console.error("Erro ao verificar votações:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao verificar votações",
      },
      { status: 500 }
    );
  }
}