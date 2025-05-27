import { NextRequest, NextResponse } from "next/server";
import { getRepository } from "typeorm";
import { Votacao } from "@/server/entities/Votacao";
import { Voto } from "@/server/entities/Voto";
import { Usuario } from "@/server/entities/Usuario";
import { Projeto } from "@/server/entities/Projeto";

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

    // Verificar se a votação existe e está em andamento
    const votacaoRepository = getRepository(Votacao);
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
    const { vereador_id, voto } = body;

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
    const usuarioRepository = getRepository(Usuario);
    const vereador = await usuarioRepository.findOne({
      where: { id: vereador_id, cargo: "vereador", ativo: true },
    });

    if (!vereador) {
      console.log(`❌ Vereador ${vereador_id} não encontrado ou inativo`);
      return NextResponse.json(
        { error: "Vereador não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o vereador já votou nesta votação
    const votoRepository = getRepository(Voto);
    const votoExistente = await votoRepository.findOne({
      where: {
        votacaoId: votacaoId,
        vereadorId: vereador_id,
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

    // Registrar o voto
    const novoVoto = votoRepository.create({
      votacaoId: votacaoId,
      vereadorId: vereador_id,
      voto: voto,
    });

    await votoRepository.save(novoVoto);
    console.log(`✅ Voto registrado com sucesso:`, { id: novoVoto.id, voto });

    // Buscar contagem atualizada de votos
    const totalVotos = await votoRepository.count({
      where: { votacaoId: votacaoId },
    });

    // Buscar total de vereadores ativos
    const totalVereadores = await usuarioRepository.count({
      where: { cargo: "vereador", ativo: true },
    });

    console.log(
      `📊 Progresso da votação: ${totalVotos}/${totalVereadores} votos`
    );

    // Se todos votaram, finalizar automaticamente a votação
    if (totalVotos >= totalVereadores) {
      console.log(`🏁 Finalizando votação automaticamente - todos votaram`);

      // Buscar todos os votos para contagem
      const todosVotos = await votoRepository.find({
        where: { votacaoId: votacaoId },
      });

      // Contar votos por categoria
      const votosFavor = todosVotos.filter((v) => v.voto === "aprovar").length;
      const votosContra = todosVotos.filter(
        (v) => v.voto === "desaprovar"
      ).length;
      const abstencoes = todosVotos.filter((v) => v.voto === "abster").length;

      // Determinar resultado
      const resultado = votosFavor > votosContra ? "aprovada" : "reprovada";

      console.log(`📈 Resultado da votação:`, {
        favor: votosFavor,
        contra: votosContra,
        abstencoes: abstencoes,
        resultado: resultado,
      });

      // Atualizar votação
      await votacaoRepository.update(votacaoId, {
        resultado: resultado,
        dataFim: new Date(),
        votosFavor: votosFavor,
        votosContra: votosContra,
        abstencoes: abstencoes,
      });

      // Atualizar status do projeto se existir
      if (votacao.projeto) {
        const projetoRepository = getRepository(Projeto);
        await projetoRepository.update(votacao.projeto.id, {
          status: resultado,
        });
        console.log(`📋 Status do projeto atualizado para: ${resultado}`);
      }

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
      const votosParciais = await votoRepository.find({
        where: { votacaoId: votacaoId },
      });

      const votosFavorParcial = votosParciais.filter(
        (v) => v.voto === "aprovar"
      ).length;
      const votosContraParcial = votosParciais.filter(
        (v) => v.voto === "desaprovar"
      ).length;
      const abstencoesParcial = votosParciais.filter(
        (v) => v.voto === "abster"
      ).length;

      await votacaoRepository.update(votacaoId, {
        votosFavor: votosFavorParcial,
        votosContra: votosContraParcial,
        abstencoes: abstencoesParcial,
      });

      console.log(`📊 Contadores atualizados:`, {
        favor: votosFavorParcial,
        contra: votosContraParcial,
        abstencoes: abstencoesParcial,
      });
    }

    return NextResponse.json({
      success: true,
      votacao_finalizada: false,
      progresso: {
        votos_registrados: totalVotos,
        total_vereadores: totalVereadores,
        restam: totalVereadores - totalVotos,
      },
    });
  } catch (error) {
    console.error("❌ Erro ao registrar voto:", error);

    // Log detalhado do erro
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    // Verificar se é erro de constraint única (vereador já votou)
    if (error instanceof Error && error.message.includes("unique constraint")) {
      return NextResponse.json(
        { error: "Vereador já votou nesta votação" },
        { status: 409 }
      );
    }

    // Verificar se é erro de conexão
    if (error instanceof Error && error.message.includes("connection")) {
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
