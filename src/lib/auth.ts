import jwt from "jsonwebtoken";
import { getRepository } from "./db";
import { Usuario } from "@/server/entities/Usuario";

interface AuthResult {
  success: boolean;
  message?: string;
  user?: {
    id: number;
    email: string;
    cargo: string;
  };
}

// Verify JWT token and return user info
export async function verifyAuthToken(token?: string): Promise<AuthResult> {
  if (!token) {
    return {
      success: false,
      message: "Token de autenticação não fornecido",
    };
  }

  try {
    // Verify token
    const secret = process.env.JWT_SECRET || "sua_chave_secreta_para_jwt_token";
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;

    // Extract user id
    const userId = decoded.id;

    if (!userId) {
      return {
        success: false,
        message: "Token inválido",
      };
    }

    // Get user repository
    const usuarioRepository = await getRepository(Usuario);

    // Get user from database
    const usuario = await usuarioRepository.findOne({
      where: { id: userId, ativo: true },
    });

    if (!usuario) {
      return {
        success: false,
        message: "Usuário não encontrado ou inativo",
      };
    }

    // Return success with user info
    return {
      success: true,
      user: {
        id: usuario.id,
        email: usuario.email,
        cargo: usuario.cargo,
      },
    };
  } catch (error) {
    console.error("Error verifying token:", error);
    return {
      success: false,
      message: "Token inválido ou expirado",
    };
  }
}

// Middleware for API routes
export function withAuth(handler: Function) {
  return async (req: Request, context: any) => {
    const token = req.headers.get("Authorization")?.split(" ")[1];

    const authResult = await verifyAuthToken(token);

    if (!authResult.success) {
      return new Response(JSON.stringify({ error: authResult.message }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Add user to request for later use
    (req as any).user = authResult.user;

    return handler(req, context);
  };
}

// Check if user has admin role
export function isAdmin(user: any): boolean {
  return user?.cargo === "admin";
}

// Check if user is a vereador
export function isVereador(user: any): boolean {
  return user?.cargo === "vereador";
}
