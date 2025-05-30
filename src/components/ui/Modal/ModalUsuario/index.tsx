// src/components/ui/Modal/ModalUsuario/index.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import type { UsuarioInterface } from "@/interfaces/UsuarioInterface";

interface UsuarioFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuario?: UsuarioInterface;
  onSave: (data: UsuarioInterface) => Promise<void>;
  onDesativar?: (id: number) => Promise<void>;
  limiteUsuariosAtingido?: boolean;
}

export function UsuarioFormModal({
  isOpen,
  onClose,
  usuario,
  onSave,
  onDesativar,
  limiteUsuariosAtingido = false,
}: UsuarioFormModalProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cargo, setCargo] = useState<"admin" | "vereador">("vereador");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDesativando, setIsDesativando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!usuario?.id;

  useEffect(() => {
    if (usuario) {
      setNome(usuario.nome || "");
      setEmail(usuario.email || "");
      setCargo(usuario.cargo || "vereador");
      setSenha("");
      setConfirmarSenha("");
    } else {
      setNome("");
      setEmail("");
      setCargo("vereador");
      setSenha("");
      setConfirmarSenha("");
    }

    // Mostrar erro se o limite de usuários for atingido
    if (!isEditMode && limiteUsuariosAtingido) {
      setError(
        "Limite de 12 usuários ativos atingido. Desative um usuário antes de criar outro."
      );
    } else {
      setError(null);
    }
  }, [usuario, isOpen, isEditMode, limiteUsuariosAtingido]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verificar novamente o limite de usuários
    if (!isEditMode && limiteUsuariosAtingido) {
      setError(
        "Limite de 12 usuários ativos atingido. Desative um usuário antes de criar outro."
      );
      return;
    }

    setError(null);

    // Validação de senha apenas para novos usuários
    if (!isEditMode) {
      if (senha !== confirmarSenha) {
        setError("As senhas não coincidem");
        return;
      }

      if (senha.length < 6) {
        setError("A senha deve ter pelo menos 6 caracteres");
        return;
      }
    }

    setIsSaving(true);

    try {
      const data: UsuarioInterface = {
        ...(usuario?.id ? { id: usuario.id } : {}),
        nome,
        email,
        cargo,
        // Incluir senha apenas para novos usuários
        ...(isEditMode ? {} : { senha }),
      };

      await onSave(data);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocorreu um erro ao salvar o usuário"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDesativar = async () => {
    if (!usuario?.id || !onDesativar) return;

    if (!confirm("Tem certeza que deseja desativar este usuário?")) {
      return;
    }

    setIsDesativando(true);

    try {
      await onDesativar(usuario.id);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocorreu um erro ao desativar o usuário"
      );
    } finally {
      setIsDesativando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {isEditMode ? "Editar Usuário" : "Novo Usuário"}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="nome"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nome
              </label>
              <input
                type="text"
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
                disabled={!isEditMode && limiteUsuariosAtingido}
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
                disabled={!isEditMode && limiteUsuariosAtingido}
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="cargo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Cargo
              </label>
              <select
                id="cargo"
                value={cargo}
                onChange={(e) =>
                  setCargo(e.target.value as "admin" | "vereador")
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
                disabled={!isEditMode && limiteUsuariosAtingido}
              >
                <option value="vereador">Vereador</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            {/* Mostrar campos de senha apenas para novos usuários */}
            {!isEditMode && (
              <>
                <div className="mb-4">
                  <label
                    htmlFor="senha"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Senha
                  </label>
                  <input
                    type="password"
                    id="senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                    minLength={6}
                    disabled={limiteUsuariosAtingido}
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="confirmarSenha"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirmar Senha
                  </label>
                  <input
                    type="password"
                    id="confirmarSenha"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                    disabled={limiteUsuariosAtingido}
                  />
                </div>
              </>
            )}

            <div className="flex justify-between mt-6">
              {isEditMode && onDesativar && (
                <Button
                  type="button"
                  variant="reprovar"
                  onClick={handleDesativar}
                  disabled={isSaving || isDesativando}
                >
                  {isDesativando ? "Desativando..." : "Desativar Usuário"}
                </Button>
              )}

              <div className="flex space-x-3 ml-auto">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={isSaving || isDesativando}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isSaving ||
                    isDesativando ||
                    (!isEditMode && limiteUsuariosAtingido)
                  }
                >
                  {isSaving
                    ? "Salvando..."
                    : isEditMode
                    ? "Atualizar"
                    : "Criar"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
