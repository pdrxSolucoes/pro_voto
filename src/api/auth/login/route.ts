import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getRepository } from "@/lib/db";
import { Usuario } from "@/server/entities/Usuario";
import jwt, { SignOptions, Secret } from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    const { email, senha } = body;

    // Validate input
    if (!email || !senha) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Get user repository
    const usuarioRepository = await getRepository(Usuario);

    // Find user by email
    const usuario = await usuarioRepository.findOne({
      where: { email, ativo: true },
    });

    // Check if user exists
    if (!usuario) {
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(senha, usuario.senha);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const secret: Secret =
      process.env.JWT_SECRET ?? "sua_chave_secreta_para_jwt_token";
    const expiresIn = (process.env.JWT_EXPIRY ??
      "24h") as jwt.SignOptions["expiresIn"];

    const signOptions: SignOptions = { expiresIn };

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, cargo: usuario.cargo },
      secret,
      signOptions
    );

    // Return token and user info
    return NextResponse.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo,
      },
    });
  } catch (error) {
    console.error("Error in login:", error);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}
