import { NextRequest, NextResponse } from "next/server";
import { Votacao } from "@/server/entities/Votacao";
import { Voto } from "@/server/entities/Voto";
import { Usuario } from "@/server/entities/Usuario";
import { Projeto } from "@/server/entities/Projeto";
import { AppDataSource } from "@/lib/db/datasource";

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

    console.log(`🗳️ Tentando registrar voto na votação ID: ${votacaoId}`);

    // Garantir que a conexão com o banco está ativa
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Usar os repositórios da nova API do TypeORM
    const votacaoRepository = AppDataSource.getRepository(Votacao);
    const votoRepository = AppDataSource.getRepository(Voto);
    const usuarioRepository = AppDataSource.getRepository(Usuario);
    const projetoRepository = AppDataSource.getRepository(Projeto);

    // Verificar se a votação existe e está em andamento
    const votacao = await votacaoRepository.findOne({
      where: { id: votacaoId, resultado: "em_andamento" },
      relations: ["projeto"],
    });

    if (!votacao) {
      console.log(`❌ Votação ${votacaoId} não encontrada ou já finalizada`);
      return NextResponse.json(
        { error: "Votação não encontrada ou já finalizada" },
        { status: 404 }
      );
    }

    // Obter dados do corpo da requisição
    const body = await request.json();

    // Extrair dados, suportando tanto vereador_id quanto vereadorId
    const vereador_id = body.vereador_id || body.vereadorId;
    const voto = body.voto;

    console.log(`📝 Dados recebidos:`, {
      vereador_id,
      voto,
      votacao_id: votacaoId,
    });

    // Validar dados
    if (!vereador_id || !voto) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // Verificar se o voto é válido
    if (!["aprovar", "desaprovar", "abster"].includes(voto)) {
      return NextResponse.json({ error: "Voto inválido" }, { status: 400 });
    }

    // Verificar se o vereador existe
    const usuario = await usuarioRepository.findOne({
      where: [
        { id: vereador_id, cargo: "vereador", ativo: true },
        { id: vereador_id, cargo: "admin", ativo: true },
      ],
    });
    console.log("úsuario", usuario);
    if (!usuario) {
      console.log(`❌ Vereador ${vereador_id} não encontrado ou inativo`);
      return NextResponse.json(
        { error: "Vereador não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o vereador já votou nesta votação
    const votoExistente = await votoRepository.findOne({
      where: {
        votacao: { id: votacaoId }, // Usando relacionamento
        vereador: { id: vereador_id }, // Usando relacionamento
      },
    });

    if (votoExistente) {
      console.log(
        `⚠️ Vereador ${vereador_id} já votou na votação ${votacaoId}`
      );
      return NextResponse.json(
        { error: "Vereador já votou nesta votação" },
        { status: 409 }
      );
    }

    // Usar QueryRunner para transação
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Registrar o voto
      const novoVoto = queryRunner.manager.create(Voto, {
        votacao: votacao,
        vereador: usuario,
        voto: voto,
        dataVoto: new Date(),
      });

      await queryRunner.manager.save(novoVoto);
      console.log(`✅ Voto registrado com sucesso:`, { id: novoVoto.id, voto });

      // Buscar contagem atualizada de votos
      const totalVotos = await queryRunner.manager.count(Voto, {
        where: { votacao: { id: votacaoId } },
      });

      // Buscar total de vereadores ativos
      const totalVereadores = await queryRunner.manager.count(Usuario, {
        where: { cargo: "vereador", ativo: true },
      });

      console.log(
        `📊 Progresso da votação: ${totalVotos}/${totalVereadores} votos`
      );

      // Se todos votaram, finalizar automaticamente a votação
      if (totalVotos >= totalVereadores) {
        console.log(`🏁 Finalizando votação automaticamente - todos votaram`);

        // Buscar todos os votos para contagem
        const todosVotos = await queryRunner.manager.find(Voto, {
          where: { votacao: { id: votacaoId } },
        });

        // Contar votos por categoria
        const votosFavor = todosVotos.filter(
          (v: any) => v.voto === "aprovar"
        ).length;
        const votosContra = todosVotos.filter(
          (v: any) => v.voto === "desaprovar"
        ).length;
        const abstencoes = todosVotos.filter(
          (v: any) => v.voto === "abster"
        ).length;

        // Determinar resultado
        const resultado = votosFavor > votosContra ? "aprovada" : "reprovada";

        console.log(`📈 Resultado da votação:`, {
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
            status: resultado,
          });
          console.log(`📋 Status do projeto atualizado para: ${resultado}`);
        }

        await queryRunner.commitTransaction();

        return NextResponse.json({
          success: true,
          votacao_finalizada: true,
          resultado: resultado,
          contagem: {
            favor: votosFavor,
            contra: votosContra,
            abstencoes: abstencoes,
            total: totalVotos,
          },
        });
      } else {
        // Atualizar contadores parciais na votação
        const votosParciais = await queryRunner.manager.find(Voto, {
          where: { votacao: { id: votacaoId } },
        });

        const votosFavorParcial = votosParciais.filter(
          (v: any) => v.voto === "aprovar"
        ).length;
        const votosContraParcial = votosParciais.filter(
          (v: any) => v.voto === "desaprovar"
        ).length;
        const abstencoesParcial = votosParciais.filter(
          (v: any) => v.voto === "abster"
        ).length;

        await queryRunner.manager.update(Votacao, votacaoId, {
          votosFavor: votosFavorParcial,
          votosContra: votosContraParcial,
          abstencoes: abstencoesParcial,
        });

        console.log(`📊 Contadores atualizados:`, {
          favor: votosFavorParcial,
          contra: votosContraParcial,
          abstencoes: abstencoesParcial,
        });

        await queryRunner.commitTransaction();

        return NextResponse.json({
          success: true,
          votacao_finalizada: false,
          progresso: {
            votos_registrados: totalVotos,
            total_vereadores: totalVereadores,
            restam: totalVereadores - totalVotos,
          },
        });
      }
    } catch (transactionError) {
      await queryRunner.rollbackTransaction();
      throw transactionError;
    } finally {
      await queryRunner.release();
    }
  } catch (error) {
    console.error("❌ Erro ao registrar voto:", error);

    // Log detalhado do erro
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    // Verificar se é erro de constraint única (vereador já votou)
    if (
      error instanceof Error &&
      (error.message.includes("unique constraint") ||
        error.message.includes("duplicate key") ||
        error.message.includes("UNIQUE constraint failed"))
    ) {
      return NextResponse.json(
        { error: "Vereador já votou nesta votação" },
        { status: 409 }
      );
    }

    // Verificar se é erro de conexão
    if (
      error instanceof Error &&
      (error.message.includes("connection") ||
        error.message.includes("ECONNREFUSED") ||
        error.message.includes("database"))
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Erro de conexão com o banco de dados",
          details:
            process.env.NODE_ENV === "development"
              ? error.message
              : "Erro de conexão",
        },
        { status: 503 }
      );
    }

    // Verificar se é erro de inicialização do TypeORM
    if (error instanceof Error && error.message.includes("DataSource")) {
      return NextResponse.json(
        {
          success: false,
          error: "Erro de inicialização do banco de dados",
          details:
            process.env.NODE_ENV === "development"
              ? error.message
              : "Erro de configuração",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : "Erro desconhecido"
            : "Erro ao registrar voto",
      },
      { status: 500 }
    );
  }
}
