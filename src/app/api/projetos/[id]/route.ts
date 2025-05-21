import { NextResponse } from "next/server";
import { getRepository } from "@/lib/db";
import { Projeto } from "@/server/entities/Projeto";
import { verifyAuthToken } from "@/lib/auth";

interface Params {
  params: {
    id: string;
  };
}

// GET projeto by id
export async function GET(request: Request, { params }: Params) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const authResult = await verifyAuthToken(token);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.message }, { status: 401 });
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const projetoRepository = await getRepository(Projeto);
    const projeto = await projetoRepository.findOne({
      where: { id },
      relations: ["votacoes", "votacoes.votos"],
    });

    if (!projeto) {
      return NextResponse.json(
        { error: "Projeto não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(projeto);
  } catch (error) {
    console.error("Error fetching projeto:", error);
    return NextResponse.json(
      { error: "Erro ao buscar projeto" },
      { status: 500 }
    );
  }
}

// PUT update projeto
export async function PUT(request: Request, { params }: Params) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const authResult = await verifyAuthToken(token);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.message }, { status: 401 });
    }

    if (authResult.user?.cargo !== "admin") {
      return NextResponse.json(
        {
          error:
            "Permissão negada. Apenas administradores podem atualizar projetos.",
        },
        { status: 403 }
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json();
    const { titulo, descricao, status } = body;

    if (!titulo && !descricao && !status) {
      return NextResponse.json(
        { error: "Pelo menos um campo deve ser fornecido para atualização" },
        { status: 400 }
      );
    }

    const projetoRepository = await getRepository(Projeto);
    const projeto = await projetoRepository.findOne({ where: { id } });

    if (!projeto) {
      return NextResponse.json(
        { error: "Projeto não encontrado" },
        { status: 404 }
      );
    }

    if (titulo) projeto.titulo = titulo;
    if (descricao) projeto.descricao = descricao;
    if (
      status &&
      ["pendente", "em_votacao", "aprovada", "reprovada"].includes(status)
    ) {
      projeto.status = status as any;
    }

    await projetoRepository.save(projeto);
    return NextResponse.json(projeto);
  } catch (error) {
    console.error("Error updating projeto:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar projeto" },
      { status: 500 }
    );
  }
}

// DELETE projeto
export async function DELETE(request: Request, { params }: Params) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const authResult = await verifyAuthToken(token);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.message }, { status: 401 });
    }

    if (authResult.user?.cargo !== "admin") {
      return NextResponse.json(
        {
          error:
            "Permissão negada. Apenas administradores podem excluir projetos.",
        },
        { status: 403 }
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const projetoRepository = await getRepository(Projeto);
    const projeto = await projetoRepository.findOne({ where: { id } });

    if (!projeto) {
      return NextResponse.json(
        { error: "Projeto não encontrado" },
        { status: 404 }
      );
    }

    await projetoRepository.remove(projeto);
    return NextResponse.json({ message: "Projeto excluído com sucesso" });
  } catch (error) {
    console.error("Error deleting projeto:", error);
    return NextResponse.json(
      { error: "Erro ao excluir projeto" },
      { status: 500 }
    );
  }
}
