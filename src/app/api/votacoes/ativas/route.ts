import { NextResponse } from "next/server";
import { db } from "@/lib/db/database";
import { formatarData } from "@/lib/utils";

export async function GET() {
  try {
    // Buscar votações ativas no banco de dados
    const votacoes = await db.query(`
  SELECT DISTINCT ON (v.projeto_id)
    v.id,
    p.titulo as "projetoTitulo",
    v.data_inicio as "dataInicio",
    (SELECT COUNT(*) FROM votos WHERE votacao_id = v.id) as "votosRegistrados",
    (SELECT COUNT(*) FROM usuarios WHERE cargo = 'vereador') as "totalVereadores"
  FROM 
    votacoes v
  JOIN 
    projetos p ON v.projeto_id = p.id
  WHERE 
    v.resultado = 'em_andamento'
  ORDER BY 
    v.projeto_id, v.data_inicio DESC
`);

    // Formatar as datas para exibição
    const votacoesFormatadas = votacoes.map((votacao: any) => ({
      ...votacao,
      dataInicio: formatarData(votacao.dataInicio),
    }));
    return NextResponse.json({ votacoes: votacoesFormatadas });
  } catch (error) {
    console.error("Erro ao buscar votações ativas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar votações ativas", votacoes: [] },
      { status: 500 }
    );
  }
}
