// src/services/usuarioService.ts
import api from "./api";

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  cargo: "admin" | "vereador";
  ativo?: boolean;
  data_criacao: Date;
}

export const usuarioService = {
  async getUsuarios(): Promise<Usuario[]> {
    const { data } = await api.get("/usuarios");
    return data.usuarios;
  },

  async getUsuariosAtivos(): Promise<Usuario[]> {
    const { data } = await api.get("/usuarios?ativo=true");
    const usuarioAtivos = data.usuarios.filter(
      (usuario: Usuario) => usuario.ativo === true
    );
    return usuarioAtivos;
  },

  async getUsuarioById(id: number): Promise<Usuario> {
    const { data } = await api.get(`/usuarios/${id}`);
    return data.data;
  },

  async createUsuario(
    usuario: Omit<Usuario, "id"> & { senha: string }
  ): Promise<Usuario> {
    const { data } = await api.post("/usuarios", usuario);
    return data.usuarios;
  },

  async updateUsuario(
    id: number,
    usuario: Partial<Usuario> & { senha?: string }
  ): Promise<Usuario> {
    const { data } = await api.put(`/usuarios/${id}`, usuario);
    return data.usuarios;
  },

  async deleteUsuario(id: number): Promise<void> {
    await api.delete(`/usuarios/${id}`);
  },

  async contarUsuariosAtivos(): Promise<number> {
    const usuarios = await this.getUsuariosAtivos();
    return usuarios.length;
  },
};
