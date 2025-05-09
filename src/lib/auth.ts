// src/lib/auth.ts
import { getRepository } from "./db";
import { Usuario } from "@/server/entities/Usuario";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET =
  process.env.JWT_SECRET || "sua_chave_secreta_para_desenvolvimento";

// Verify authentication token
export async function verifyAuthToken(token?: string) {
  if (!token) {
    return { success: false, message: "Token não fornecido" };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const userRepository = await getRepository(Usuario);
    const user = await userRepository.findOneBy({ id: decoded.userId });

    if (!user) {
      return { success: false, message: "Usuário não encontrado" };
    }

    if (!user.ativo) {
      return { success: false, message: "Usuário inativo" };
    }

    return { success: true, user };
  } catch (error) {
    return { success: false, message: "Token inválido ou expirado" };
  }
}

// Generate authentication token
export async function generateAuthToken(email: string, password: string) {
  try {
    const userRepository = await getRepository(Usuario);
    const user = await userRepository.findOneBy({ email });

    if (!user) {
      return { success: false, message: "Usuário não encontrado" };
    }

    if (!user.ativo) {
      return { success: false, message: "Usuário inativo" };
    }

    const passwordMatch = await bcrypt.compare(password, user.senha);
    if (!passwordMatch) {
      return { success: false, message: "Senha incorreta" };
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "8h",
    });

    return {
      success: true,
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        cargo: user.cargo,
      },
    };
  } catch (error) {
    console.error("Erro ao gerar token:", error);
    return { success: false, message: "Erro ao gerar token de autenticação" };
  }
}
