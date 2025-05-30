import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/lib/db/datasource";
import { Usuario } from "@/server/entities/Usuario";
import bcrypt from "bcrypt";
import { initializeDatabase } from "@/lib/db/datasource";

// GET - Listar todos os usuários
export async function GET(request: NextRequest) {
  try {
    // Garantir que o banco de dados está inicializado
    if (!AppDataSource.isInitialized) {
      await initializeDatabase();
    }

    const usuarioRepository = AppDataSource.getRepository(Usuario);
    const usuarios = await usuarioRepository.find({
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

    return NextResponse.json({ success: true, usuarios });
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao buscar usuários" },
      { status: 500 }
    );
  }
}

// POST - Criar um novo usuário
export async function POST(request: NextRequest) {
  try {
    // Garantir que o banco de dados está inicializado
    if (!AppDataSource.isInitialized) {
      await initializeDatabase();
    }

    const usuarioRepository = AppDataSource.getRepository(Usuario);
    const body = await request.json();
    const { nome, email, senha, cargo } = body;

    // Validação básica
    if (!nome || !email || !senha || !cargo) {
      return NextResponse.json(
        { success: false, error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o email já existe
    const usuarioExistente = await usuarioRepository.findOne({
      where: { email },
    });

    if (usuarioExistente) {
      return NextResponse.json(
        { success: false, error: "Email já cadastrado" },
        { status: 400 }
      );
    }

    // Validar o cargo
    if (cargo !== "vereador" && cargo !== "admin") {
      return NextResponse.json(
        { success: false, error: "Cargo inválido" },
        { status: 400 }
      );
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Criar o usuário
    const novoUsuario = usuarioRepository.create({
      nome,
      email,
      senha: senhaHash,
      cargo,
      ativo: true,
    });

    await usuarioRepository.save(novoUsuario);

    // Retornar o usuário criado (sem a senha)
    const { senha: _, ...usuarioSemSenha } = novoUsuario;

    return NextResponse.json(
      { success: true, usuario: usuarioSemSenha },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao criar usuário" },
      { status: 500 }
    );
  }
}
