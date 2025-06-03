import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/lib/db/datasource";
import { Votacao } from "@/server/entities/Votacao";
import { Voto } from "@/server/entities/Voto";
import { Projeto } from "@/server/entities/Projeto";

/**
 * Endpoint para verificar e atualizar o status de votações que atingiram 12 votos
 * Pode ser chamado por um cron job ou manualmente para garantir que votações sejam finalizadas
 */
export async function GET(request: NextRequest) {
  try {
    // Garantir que a conexão com o banco está ativa
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const votacaoRepository = AppDataSource.getRepository(Votacao);
    const votoRepository = AppDataSource.getRepository(Voto);
    const projetoRepository = AppDataSource.getRepository(Projeto);

    // Buscar todas as votações em andamento
    const votacoesEmAndamento = await votacaoRepository.find({
      where: { resultado: "em_andamento" },
      relations: ["projeto"],
    });

    console.log(`🔍 Verificando ${votacoesEmAndamento.length} votações em andamento`);

    const resultados = [];

    // Verificar cada votação
    for (const votacao of votacoesEmAndamento) {
      // Contar votos para esta votação
      const totalVotos = await votoRepository.count({
        where: { votacao: { id: votacao.id } },
      });

      // Se tiver exatamente 12 votos, finalizar a votação
      if (totalVotos === 12) {
        console.log(`🏁 Votação ID ${votacao.id} atingiu 12 votos - finalizando`);

        // Buscar todos os votos para contagem
        const todosVotos = await votoRepository.find({
          where: { votacao: { id: votacao.id } },
        });

        // Contar votos por categoria
        const votosFavor = todosVotos.filter((v) => v.voto === "aprovar").length;
        const votosContra = todosVotos.filter((v) => v.voto === "desaprovar").length;
        const abstencoes = todosVotos.filter((v) => v.voto === "abster").length;

        // Determinar resultado
        let resultado: "aprovada" | "reprovada" = "reprovada";
        if (votosFavor > votosContra) {
          resultado = "aprovada";
        }

        // Atualizar votação
        await votacaoRepository.update(votacao.id, {
          resultado: resultado,
          dataFim: new Date(),
          votosFavor: votosFavor,
          votosContra: votosContra,
          abstencoes: abstencoes,
        });

        // Atualizar status do projeto se existir
        if (votacao.projeto) {
          await projetoRepository.update(votacao.projeto.id, {
            status: resultado as any,
          });
          console.log(`📋 Status do projeto ${votacao.projeto.id} atualizado para: ${resultado}`);
        }

        resultados.push({
          votacao_id: votacao.id,
          projeto_id: votacao.projeto?.id,
          total_votos: totalVotos,
          resultado: resultado,
          contagem: {
            favor: votosFavor,
            contra: votosContra,
            abstencoes: abstencoes,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      votacoes_finalizadas: resultados.length,
      detalhes: resultados,
    });
  } catch (error) {
    console.error("❌ Erro ao verificar status das votações:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao verificar status das votações",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}