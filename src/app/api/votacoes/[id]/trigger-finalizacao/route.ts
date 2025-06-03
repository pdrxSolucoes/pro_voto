import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/lib/db/datasource";
import { Votacao } from "@/server/entities/Votacao";
import { Voto } from "@/server/entities/Voto";
import { Projeto } from "@/server/entities/Projeto";

/**
 * Endpoint para finalizar uma votação específica se ela tiver 12 votos
 */
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

    // Garantir que a conexão com o banco está ativa
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const votacaoRepository = AppDataSource.getRepository(Votacao);
    const votoRepository = AppDataSource.getRepository(Voto);
    const projetoRepository = AppDataSource.getRepository(Projeto);

    // Verificar se a votação existe e está em andamento
    const votacao = await votacaoRepository.findOne({
      where: { id: votacaoId, resultado: "em_andamento" },
      relations: ["projeto"],
    });

    if (!votacao) {
      return NextResponse.json(
        { error: "Votação não encontrada ou já finalizada" },
        { status: 404 }
      );
    }

    // Contar votos para esta votação
    const totalVotos = await votoRepository.count({
      where: { votacao: { id: votacaoId } },
    });

    // Se não tiver exatamente 12 votos, retornar erro
    if (totalVotos !== 12) {
      return NextResponse.json(
        { 
          error: "A votação não tem 12 votos para ser finalizada", 
          votos_atuais: totalVotos 
        },
        { status: 400 }
      );
    }

    // Usar QueryRunner para transação
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Buscar todos os votos para contagem
      const todosVotos = await queryRunner.manager.find(Voto, {
        where: { votacao: { id: votacaoId } },
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

      console.log(`📈 Resultado da votação ${votacaoId}:`, {
        favor: votosFavor,
        contra: votosContra,
        abstencoes: abstencoes,
        resultado: resultado,
      });

      // Atualizar votação
      await queryRunner.manager.update(Votacao, votacaoId, {
        resultado: resultado,
        dataFim: new Date(),
        votosFavor: votosFavor,
        votosContra: votosContra,
        abstencoes: abstencoes,
      });

      // Atualizar status do projeto se existir
      if (votacao.projeto) {
        await queryRunner.manager.update(Projeto, votacao.projeto.id, {
          status: resultado as any,
        });
        console.log(`📋 Status do projeto ${votacao.projeto.id} atualizado para: ${resultado}`);
      }

      await queryRunner.commitTransaction();

      return NextResponse.json({
        success: true,
        votacao_id: votacaoId,
        resultado: resultado,
        contagem: {
          favor: votosFavor,
          contra: votosContra,
          abstencoes: abstencoes,
          total: totalVotos,
        },
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  } catch (error) {
    console.error("❌ Erro ao finalizar votação:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao finalizar votação",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}