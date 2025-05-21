// src/components/ui/Modal/ModalProjeto.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";

interface Projeto {
  id: number;
  titulo: string;
  descricao: string;
  data_apresentacao: string;
  status: "pendente" | "em_votacao" | "aprovada" | "reprovada";
}

interface ProjetoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  projeto?: Projeto;
  onSave: (data: { titulo: string; descricao: string }) => Promise<void>;
}

export function ProjetoFormModal({
  isOpen,
  onClose,
  projeto,
  onSave,
}: ProjetoFormModalProps) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!projeto;

  useEffect(() => {
    if (projeto) {
      setTitulo(projeto.titulo);
      setDescricao(projeto.descricao);
    } else {
      setTitulo("");
      setDescricao("");
    }
    setError(null);
  }, [projeto, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const data = {
        titulo,
        descricao,
      };

      await onSave(data);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocorreu um erro ao salvar o projeto"
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
            {isEditMode ? "Editar Projeto" : "Novo Projeto"}
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
