// src/app/api/emendas/route.ts
import { NextResponse } from "next/server";
import { getRepository } from "@/lib/db";
import { Emenda } from "@/server/entities/Emenda";
import { verifyAuthToken } from "@/lib/auth";

// GET all emendas
export async function GET(request: Request) {
  try {
    // Obter token do cabeçalho de autorização
    const token = request.headers.get("Authorization")?.split(" ")[1];
    console.log("token", token);

    // Verificar token d,e autenticação
    const authResult = await verifyAuthToken(token);

    if (!authResult.success) {
      return NextResponse.json({ error: authResult.message }, { status: 401 });
    }

    // Obter repositório de emendas
    const emendaRepository = await getRepository(Emenda);

    // Obter parâmetros de consulta
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Construir opções de consulta
    let queryOptions: any = {
      order: { data_criacao: "DESC" }, // Verifique se este é o nome correto da coluna no PostgreSQL
    };

    // Adicionar filtro de status, se fornecido
    if (status) {
      queryOptions.where = { status };
    }

    // Buscar emendas com tratamento de erro detalhado
    console.log("Buscando emendas com opções:", JSON.stringify(queryOptions));

    try {
      // Primeiro tente sem relações para ver se o problema está aí
      const emendas = await emendaRepository.find(queryOptions);
      console.log(`Encontradas ${emendas.length} emendas`);

      return NextResponse.json(emendas);
    } catch (innerError: any) {
      console.error("Erro na consulta find():", innerError);

      // Tente uma consulta mais simples para diagnóstico
      const simplesEmendas = await emendaRepository
        .createQueryBuilder("emenda")
        .getMany();
      console.log(`Consulta simples retornou ${simplesEmendas.length} emendas`);

      return NextResponse.json(
        {
          error: "Erro na consulta de emendas",
          details: innerError.message,
          fallback: simplesEmendas,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Erro geral ao buscar emendas:", error);

    // Enviar erro detalhado para depuração
    return NextResponse.json(
      {
        error: "Erro ao buscar emendas",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
