import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/lib/db/datasource";
import { Usuario } from "@/server/entities/Usuario";
import { initializeDatabase } from "@/lib/db/datasource";
import bcrypt from "bcrypt";

// GET - Buscar usuário por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Garantir que o banco de dados está inicializado
    if (!AppDataSource.isInitialized) {
      await initializeDatabase();
    }

    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "ID inválido" },
        { status: 400 }
      );
    }

    const usuarioRepository = AppDataSource.getRepository(Usuario);
    const usuario = await usuarioRepository.findOne({
      where: { id },
      select: [
        "id",
        "nome",
        "email",
        "cargo",
        "ativo",
        "data_criacao",
        "data_atualizacao",
      ],
    });

    if (!usuario) {
      return NextResponse.json(
        { success: false, error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: usuario });
  } catch (error) {
    console.error(`Erro ao buscar usuário ID ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: "Erro ao buscar usuário" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar usuário por ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Garantir que o banco de dados está inicializado
    if (!AppDataSource.isInitialized) {
      await initializeDatabase();
    }

    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "ID inválido" },
        { status: 400 }
      );
    }

    const usuarioRepository = AppDataSource.getRepository(Usuario);
    const usuarioExistente = await usuarioRepository.findOne({
      where: { id },
    });

    if (!usuarioExistente) {
      return NextResponse.json(
        { success: false, error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { nome, email, senha, cargo, ativo } = body;

    // Verificar se o email já existe (se estiver sendo alterado)
    if (email && email !== usuarioExistente.email) {
      const emailExistente = await usuarioRepository.findOne({
        where: { email },
      });

      if (emailExistente) {
        return NextResponse.json(
          { success: false, error: "Email já está em uso" },
          { status: 400 }
        );
      }
    }

    // Atualizar os campos
    if (nome) usuarioExistente.nome = nome;
    if (email) usuarioExistente.email = email;
    if (cargo) {
      if (cargo !== "admin" && cargo !== "vereador") {
        return NextResponse.json(
          { success: false, error: "Cargo inválido" },
          { status: 400 }
        );
      }
      usuarioExistente.cargo = cargo;
    }
    if (ativo !== undefined) usuarioExistente.ativo = ativo;

    // Atualizar senha se fornecida
    if (senha) {
      usuarioExistente.senha = await bcrypt.hash(senha, 10);
    }

    // Salvar as alterações
    await usuarioRepository.save(usuarioExistente);

    // Retornar o usuário atualizado (sem a senha)
    const { senha: _, ...usuarioAtualizado } = usuarioExistente;

    return NextResponse.json({
      success: true,
      data: usuarioAtualizado,
    });
  } catch (error) {
    console.error(`Erro ao atualizar usuário ID ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: "Erro ao atualizar usuário" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir usuário por ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Garantir que o banco de dados está inicializado
    if (!AppDataSource.isInitialized) {
      await initializeDatabase();
    }

    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "ID inválido" },
        { status: 400 }
      );
    }

    const usuarioRepository = AppDataSource.getRepository(Usuario);
    const usuario = await usuarioRepository.findOne({
      where: { id },
    });

    if (!usuario) {
      return NextResponse.json(
        { success: false, error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Em vez de excluir, desativar o usuário
    usuario.ativo = false;
    await usuarioRepository.save(usuario);

    return NextResponse.json({
      success: true,
      message: "Usuário desativado com sucesso",
    });
  } catch (error) {
    console.error(`Erro ao desativar usuário ID ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: "Erro ao desativar usuário" },
      { status: 500 }
    );
  }
}
