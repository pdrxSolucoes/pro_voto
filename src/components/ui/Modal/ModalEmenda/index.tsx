// src/components/ui/Modal/ModalEmenda.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";

interface Emenda {
  id: number;
  titulo: string;
  descricao: string;
  dataApresentacao: string;
  status: "pendente" | "em_votacao" | "aprovada" | "reprovada";
}

interface EmendaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  emenda?: Emenda;
  onSave: (data: { titulo: string; descricao: string }) => Promise<void>;
}

export function EmendaFormModal({
  isOpen,
  onClose,
  emenda,
  onSave,
}: EmendaFormModalProps) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!emenda;

  // Carregar dados da emenda quando estiver em modo de edição
  useEffect(() => {
    if (emenda) {
      setTitulo(emenda.titulo);
      setDescricao(emenda.descricao);
    } else {
      // Limpar formulário quando for nova emenda
      setTitulo("");
      setDescricao("");
    }
    // Limpar erro ao abrir/fechar modal
    setError(null);
  }, [emenda, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      // Estruturar dados corretamente
      const data = {
        titulo,
        descricao,
      };

      console.log("Enviando dados do modal:", data);
      await onSave(data);
      onClose();
    } catch (err) {
      console.error("Erro ao salvar emenda:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Ocorreu um erro ao salvar a emenda"
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {isEditMode ? "Editar Emenda" : "Nova Emenda"}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="titulo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Título
              </label>
              <input
                type="text"
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="descricao"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Descrição
              </label>
              <textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md h-32"
                required
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Salvando..." : isEditMode ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
