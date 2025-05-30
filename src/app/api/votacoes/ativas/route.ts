import { NextResponse } from "next/server";
import { formatarData } from "@/lib/utils";
import { getRepository } from "@/lib/db/index";
import { Votacao } from "@/server/entities/Votacao";
import { Usuario } from "@/server/entities/Usuario";
import { In } from "typeorm";

export async function GET() {
  try {
    // Buscar votações ativas usando TypeORM
    const votacaoRepository = await getRepository(Votacao);
    const votacoesAtivas = await votacaoRepository.find({
      where: { resultado: "em_andamento" },
      relations: ["projeto", "votos"],
      order: { dataInicio: "DESC" },
    });

    // Buscar total de vereadores
    const usuarioRepository = await getRepository(Usuario);
    const totalVereadores = await usuarioRepository.count({
      where: {
        cargo: In(["vereador", "admin"]),

        ativo: true,
      },
    });

    // Filtrar para ter apenas uma votação por projeto (a mais recente)
    const projetosMap = new Map();
    votacoesAtivas.forEach((votacao) => {
      const projetoId = votacao.projeto?.id;
      if (
        !projetosMap.has(projetoId) ||
        new Date(votacao.dataInicio) >
          new Date(projetosMap.get(projetoId).dataInicio)
      ) {
        projetosMap.set(projetoId, votacao);
      }
    });

    // Formatar dados para resposta
    const votacoesFormatadas = Array.from(projetosMap.values()).map(
      (votacao) => ({
        id: votacao.id,
        projetoTitulo: votacao.projeto?.titulo || "Sem título",
        dataInicio: formatarData(votacao.dataInicio),
        votosRegistrados: votacao.votos?.length || 0,
        totalVereadores,
      })
    );

    return NextResponse.json({ votacoes: votacoesFormatadas });
  } catch (error) {
    console.error("Erro ao buscar votações ativas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar votações ativas", votacoes: [] },
      { status: 500 }
    );
  }
}
