import { NextResponse } from "next/server";
import { getRepository } from "@/lib/db";
import { Emenda } from "@/server/entities/Emenda";
import { verifyAuthToken } from "@/lib/auth";

interface Params {
  params: {
    id: string;
  };
}

// GET single emenda by id
export async function GET(request: Request, { params }: Params) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];

    // Verify auth token
    const authResult = await verifyAuthToken(token);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.message }, { status: 401 });
    }

    const id = parseInt(params.id);

    // Validate id
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Get emenda by id
    const emendaRepository = await getRepository(Emenda);

    const emenda = await emendaRepository.findOne({
      where: { id },
      relations: ["votacoes", "votacoes.votos"],
    });

    if (!emenda) {
      return NextResponse.json(
        { error: "Emenda não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(emenda);
  } catch (error) {
    console.error("Error fetching emenda:", error);
    return NextResponse.json(
      { error: "Erro ao buscar emenda" },
      { status: 500 }
    );
  }
}

// PUT update emenda by id
export async function PUT(request: Request, { params }: Params) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];

    // Verify auth token
    const authResult = await verifyAuthToken(token);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.message }, { status: 401 });
    }

    // Check admin permission
    if (authResult.user?.cargo !== "admin") {
      return NextResponse.json(
        {
          error:
            "Permissão negada. Apenas administradores podem atualizar emendas.",
        },
        { status: 403 }
      );
    }

    const id = parseInt(params.id);

    // Validate id
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    const { titulo, descricao, status } = body;

    // Validate input
    if (!titulo && !descricao && !status) {
      return NextResponse.json(
        { error: "Pelo menos um campo deve ser fornecido para atualização" },
        { status: 400 }
      );
    }

    // Get emenda repository
    const emendaRepository = await getRepository(Emenda);

    // Find emenda by id
    const emenda = await emendaRepository.findOne({ where: { id } });

    if (!emenda) {
      return NextResponse.json(
        { error: "Emenda não encontrada" },
        { status: 404 }
      );
    }

    // Update fields
    if (titulo) emenda.titulo = titulo;
    if (descricao) emenda.descricao = descricao;
    if (
      status &&
      ["pendente", "em_votacao", "aprovada", "reprovada"].includes(status)
    ) {
      emenda.status = status as any;
    }

    // Save updated emenda
    await emendaRepository.save(emenda);

    return NextResponse.json(emenda);
  } catch (error) {
    console.error("Error updating emenda:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar emenda" },
      { status: 500 }
    );
  }
}

// DELETE emenda by id
export async function DELETE(request: Request, { params }: Params) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];

    // Verify auth token
    const authResult = await verifyAuthToken(token);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.message }, { status: 401 });
    }

    // Check admin permission
    if (authResult.user?.cargo !== "admin") {
      return NextResponse.json(
        {
          error:
            "Permissão negada. Apenas administradores podem excluir emendas.",
        },
        { status: 403 }
      );
    }

    const id = parseInt(params.id);

    // Validate id
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Get emenda repository
    const emendaRepository = await getRepository(Emenda);

    // Find emenda by id
    const emenda = await emendaRepository.findOne({ where: { id } });

    if (!emenda) {
      return NextResponse.json(
        { error: "Emenda não encontrada" },
        { status: 404 }
      );
    }

    // Delete emenda
    await emendaRepository.remove(emenda);

    return NextResponse.json({ message: "Emenda excluída com sucesso" });
  } catch (error) {
    console.error("Error deleting emenda:", error);
    return NextResponse.json(
      { error: "Erro ao excluir emenda" },
      { status: 500 }
    );
  }
}
