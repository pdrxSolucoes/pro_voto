import { NextRequest, NextResponse } from "next/server";
import { getRepository } from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";
import { formatarData } from "@/lib/utils";
import { Votacao } from "@/server/entities/Votacao";
import { Voto } from "@/server/entities/Voto";
import { Usuario } from "@/server/entities/Usuario";
import { Projeto } from "@/server/entities/Projeto";

interface Params {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: Params) {
  console.log("entrou");
  try {
    // Verificação de autenticação (opcional, remova se não for necessária)
    const token = request.headers.get("Authorization")?.split(" ")[1];
    if (token) {
      const authResult = await verifyAuthToken(token);
      if (!authResult.success) {
        return NextResponse.json(
          { error: authResult.message },
          { status: 401 }
        );
      }
    }

    const votacaoId = parseInt(params.id);
    if (isNaN(votacaoId)) {
      return NextResponse.json(
        { error: "ID de votação inválido" },
        { status: 400 }
      );
    }

    console.log(`🔍 Buscando votação com ID: ${votacaoId}`);

    // Buscar votação com relacionamentos - CORREÇÃO: await no getRepository
    const votacaoRepository = await getRepository(Votacao);
    const votacao = await votacaoRepository.findOne({
      where: { id: votacaoId },
      relations: ["projeto", "votos", "votos.vereador"],
    });

    if (!votacao) {
      console.log(`❌ Votação ${votacaoId} não encontrada`);
      return NextResponse.json(
        { error: "Votação não encontrada" },
        { status: 404 }
      );
    }

    console.log(`📊 Votação encontrada:`, {
      id: votacao.id,
      projeto_id: votacao.projeto?.id,
      total_votos: votacao.votos?.length || 0,
      data_inicio: votacao.dataInicio,
    });

    // Buscar todos os vereadores ativos - CORREÇÃO: await no getRepository
    const usuarioRepository = await getRepository(Usuario);
    const vereadores = await usuarioRepository.find({
      where: {
        cargo: "vereador",
        ativo: true,
      },
      order: { nome: "ASC" },
    });

    console.log(`👥 Total de vereadores ativos: ${vereadores.length}`);

    // Contar votos por categoria usando os dados já carregados
    const votos = votacao.votos || [];
    const contagemVotos = {
      votos_favor: votos.filter((v: any) => v.voto === "aprovar").length,
      votos_contra: votos.filter((v: any) => v.voto === "desaprovar").length,
      abstencoes: votos.filter((v: any) => v.voto === "abster").length,
      total_votos: votos.length,
    };

    console.log(`🗳️ Contagem de votos:`, contagemVotos);

    // Verificar se os contadores na entidade estão atualizados
    const contagemAtualizada = {
      votosFavor: Math.max(votacao.votosFavor || 0, contagemVotos.votos_favor),
      votosContra: Math.max(
        votacao.votosContra || 0,
        contagemVotos.votos_contra
      ),
      abstencoes: Math.max(votacao.abstencoes || 0, contagemVotos.abstencoes),
    };

    // Mapear vereadores com seus votos
    const vereadoresComVotos = vereadores.map((vereador) => {
      const votoVereador = votos.find((v: any) => v.vereadorId === vereador.id);
      return {
        id: vereador.id,
        nome: vereador.nome,
        voto: votoVereador?.voto || null,
        data_voto: votoVereador?.dataVoto
          ? formatarData(votoVereador.dataVoto)
          : null,
      };
    });

    // Buscar último voto para notificações
    const ultimoVoto =
      votos.length > 0
        ? votos.reduce((ultimo: any, atual: any) => {
            const dataAtual = new Date(atual.dataVoto);
            const dataUltimo = new Date(ultimo.dataVoto);
            return dataAtual > dataUltimo ? atual : ultimo;
          })
        : null;

    const ultimoVotoInfo = ultimoVoto
      ? {
          vereador: ultimoVoto.vereador?.nome || "Vereador não identificado",
          voto: ultimoVoto.voto,
          data: formatarData(ultimoVoto.dataVoto),
        }
      : null;

    console.log(`🕐 Último voto:`, ultimoVotoInfo);

    // Montar resultado final
    const resultado = {
      id: votacao.id,
      projeto: {
        id: votacao.projeto?.id || null,
        titulo: votacao.projeto?.titulo || "Título não disponível",
        descricao: votacao.projeto?.descricao || "Descrição não disponível",
        status: votacao.projeto?.status || "pendente",
      },
      data_inicio: votacao.dataInicio ? formatarData(votacao.dataInicio) : null,
      data_fim: votacao.dataFim ? formatarData(votacao.dataFim) : null,
      resultado: votacao.resultado || "em_andamento",
      votosFavor: contagemAtualizada.votosFavor,
      votosContra: contagemAtualizada.votosContra,
      abstencoes: contagemAtualizada.abstencoes,
      vereadores: vereadoresComVotos,
      total_vereadores: vereadores.length,
      total_votos: contagemVotos.total_votos,
      // Dados adicionais para debug (remova em produção se não precisar)
      _debug: {
        votos_db: {
          favor: votacao.votosFavor,
          contra: votacao.votosContra,
          abstencoes: votacao.abstencoes,
        },
        votos_calculados: contagemVotos,
      },
    };

    console.log(`✅ Resultado final:`, {
      votacao_id: resultado.id,
      projeto_titulo: resultado.projeto.titulo,
      total_vereadores: resultado.total_vereadores,
      total_votos: resultado.total_votos,
      contagem: {
        favor: resultado.votosFavor,
        contra: resultado.votosContra,
        abstencoes: resultado.abstencoes,
      },
    });

    return NextResponse.json({
      success: true,
      resultado,
      ultimo_voto: ultimoVotoInfo,
    });
  } catch (error) {
    console.error("❌ Erro ao buscar resultado da votação:", error);

    // Log mais detalhado do erro para debug
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    // Verificar se é erro de conexão com o banco
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

    // Verificar se é erro de TypeORM
    if (error instanceof Error && error.name.includes("QueryFailedError")) {
      return NextResponse.json(
        {
          success: false,
          error: "Erro na consulta ao banco de dados",
          details:
            process.env.NODE_ENV === "development"
              ? error.message
              : "Erro na consulta",
        },
        { status: 500 }
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
            : "Erro interno do servidor",
      },
      { status: 500 }
    );
  }
}
