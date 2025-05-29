// src/lib/auth.ts
import { compare, hash } from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource, initializeDatabase } from "./db/datasource";
import { Usuario } from "@/server/entities/Usuario";

export async function authenticateUser(email: string, senha: string) {
  try {
    // Inicializar a conexão com o banco
    await initializeDatabase();

    // Buscar usuário pelo email
    const usuarioRepository = AppDataSource.getRepository(Usuario);
    const usuario = await usuarioRepository.findOne({ where: { email } });

    if (!usuario) {
      return {
        success: false,
        message: "Credenciais inválidas",
      };
    }

    // Verificar se o usuário está ativo
    if (!usuario.ativo) {
      return {
        success: false,
        message: "Usuário desativado",
      };
    }

    // Verificar a senha
    const senhaCorreta = await compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return {
        success: false,
        message: "Credenciais inválidas",
      };
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo,
      },
      process.env.JWT_SECRET || "seu_jwt_secret_padrao",
      {
        expiresIn: "8h",
      }
    );

    return {
      success: true,
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo,
      },
      token,
    };
  } catch (error) {
    console.error("Erro ao autenticar usuário:", error);
    return {
      success: false,
      message: "Erro ao processar login",
    };
  }
}

// Função para verificar se existe algum usuário admin no sistema
export async function hasAdminUser() {
  try {
    await initializeDatabase();
    const usuarioRepository = AppDataSource.getRepository(Usuario);

    const adminCount = await usuarioRepository.count({
      where: { cargo: "admin" },
    });

    return adminCount > 0;
  } catch (error) {
    console.error("Erro ao verificar usuários admin:", error);
    return false;
  }
}
// Função para verificar se existe algum usuário admin no sistema
export async function isAdmin(user: any) {
  try {
    await initializeDatabase();
    const usuarioRepository = AppDataSource.getRepository(Usuario);

    const admin = await usuarioRepository.find({
      where: { cargo: "admin", email: user.email },
    });
    return admin;
  } catch (error) {
    console.error("Erro ao verificar usuários admin:", error);
    return false;
  }
}

// Função modificada em src/lib/auth.ts
export async function createFirstAdmin(
  nome: string,
  email: string,
  senha: string
) {
  try {
    console.log("Inicializando banco de dados para criar primeiro admin...");
    await initializeDatabase();
    console.log("Banco de dados inicializado com sucesso!");

    // Verifique se já existe algum admin
    console.log("Verificando se já existe algum admin...");
    const adminExists = await hasAdminUser();

    if (adminExists) {
      console.log("Já existe um administrador no sistema!");
      return {
        success: false,
        message: "Já existe um administrador no sistema",
      };
    }

    // Crie a senha hash
    console.log("Criando hash da senha...");
    const hashedPassword = await hash(senha, 10);

    // Crie o primeiro administrador
    console.log("Criando o primeiro administrador...");
    const usuarioRepository = AppDataSource.getRepository(Usuario);
    const newAdmin = usuarioRepository.create({
      nome,
      email,
      senha: hashedPassword,
      cargo: "admin",
      ativo: true,
    });

    console.log("Salvando o primeiro administrador...");
    const savedAdmin = await usuarioRepository.save(newAdmin);
    console.log("Administrador criado com sucesso! ID:", savedAdmin.id);

    return {
      success: true,
      message: "Administrador criado com sucesso",
    };
  } catch (error) {
    console.error("Erro ao criar primeiro admin:", error);

    // Informações adicionais para diagnóstico
    if (error instanceof Error) {
      console.error("Mensagem de erro:", error.message);
      console.error("Stack trace:", error.stack);
    }

    return {
      success: false,
      message: `Erro ao criar administrador: ${
        error instanceof Error ? error.message : "Erro desconhecido"
      }`,
    };
  }
}

// Função para verificar e decodificar token JWT
export async function verifyAuthToken(token?: string) {
  try {
    // Verificar se o token foi fornecido
    if (!token) {
      return {
        success: false,
        message: "Token de autenticação não fornecido",
      };
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "seu_jwt_secret_padrao"
    ) as {
      id: number;
      nome: string;
      email: string;
      cargo: "admin" | "vereador";
    };

    // Inicializar conexão com o banco de dados
    await initializeDatabase();

    // Buscar usuário no banco para garantir que ele ainda existe e está ativo
    const usuarioRepository = AppDataSource.getRepository(Usuario);
    const usuario = await usuarioRepository.findOne({
      where: { id: decoded.id },
    });

    // Verificar se o usuário existe e está ativo
    if (!usuario) {
      return {
        success: false,
        message: "Usuário não encontrado",
      };
    }

    if (!usuario.ativo) {
      return {
        success: false,
        message: "Usuário desativado",
      };
    }

    // Retornar sucesso e dados do usuário
    return {
      success: true,
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo,
      },
    };
  } catch (error) {
    // Verificar o tipo de erro
    if (error instanceof jwt.JsonWebTokenError) {
      return {
        success: false,
        message: "Token inválido",
      };
    }

    if (error instanceof jwt.TokenExpiredError) {
      return {
        success: false,
        message: "Token expirado",
      };
    }

    // Outros erros
    console.error("Erro ao verificar token:", error);
    return {
      success: false,
      message: "Erro ao verificar autenticação",
    };
  }
}
