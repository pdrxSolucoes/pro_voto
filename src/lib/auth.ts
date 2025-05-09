// src/lib/auth.ts
import { getRepository } from "./db";
import { Usuario } from "@/server/entities/Usuario";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "seu-segredo-padrao";

export const verifyAuthToken = async (token?: string) => {
  if (!token) {
    return { success: false, message: "Token não fornecido" };
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);

    // Get user from database to ensure it exists and is active
    const userRepository = await getRepository(Usuario);
    const user = await userRepository.findOne({
      where: { id: decoded.id },
    });

    if (!user) {
      return { success: false, message: "Usuário não encontrado" };
    }

    if (!user.ativo) {
      return { success: false, message: "Usuário inativo" };
    }

    return { success: true, user };
  } catch (error) {
    console.error("Error verifying token:", error);
    return { success: false, message: "Token inválido ou expirado" };
  }
};

export const authenticateUser = async (email: string, senha: string) => {
  try {
    // Get user repository
    const userRepository = await getRepository(Usuario);

    // Find user by email
    const user = await userRepository.findOne({
      where: { email },
    });

    // Check if user exists
    if (!user) {
      return { success: false, message: "Usuário não encontrado" };
    }

    // Check if user is active
    if (!user.ativo) {
      return { success: false, message: "Usuário inativo" };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(senha, user.senha);
    if (!isPasswordValid) {
      return { success: false, message: "Senha incorreta" };
    }

    // Generate token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        cargo: user.cargo,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Return success with token and user info
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
    console.error("Error authenticating user:", error);
    return { success: false, message: "Erro ao autenticar usuário" };
  }
};

// For backward compatibility, keep this function but make it use authenticateUser internally
export const generateAuthToken = (user: Usuario) => {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      cargo: user.cargo,
    },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  return token;
};
