// src/components/EmendaFormModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useNotifications } from "@/components/ui/Notification";

interface EmendaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  emenda?: {
    id: number;
    titulo: string;
    descricao: string;
    dataApresentacao: string;
    status: "pendente" | "em_votacao" | "aprovada" | "reprovada";
  };
  onSave: (emenda: any) => Promise<void>;
}

export function EmendaFormModal({
  isOpen,
  onClose,
  emenda,
  onSave,
}: EmendaFormModalProps) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataApresentacao, setDataApresentacao] = useState("");
  const [status, setStatus] = useState<
    "pendente" | "em_votacao" | "aprovada" | "reprovada"
  >("pendente");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addNotification } = useNotifications();
  const isEditMode = !!emenda;

  // Preencher o formulário quando estiver em modo de edição
  useEffect(() => {
    if (emenda) {
      setTitulo(emenda.titulo);
      setDescricao(emenda.descricao);

      // Formatar a data para o formato esperado pelo input type="datetime-local"
      const dataObj = new Date(emenda.dataApresentacao);
      const formattedDate = dataObj.toISOString().slice(0, 16);
      setDataApresentacao(formattedDate);

      setStatus(emenda.status);
    } else {
      // Valores padrão para criação
      setTitulo("");
      setDescricao("");
      setDataApresentacao("");
      setStatus("pendente");
    }
  }, [emenda]);

  // Dentro do componente EmendaFormModal, na função handleSubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo || !descricao || !dataApresentacao) {
      addNotification("Preencha todos os campos obrigatórios", "error");
      return;
    }

    try {
      setIsSubmitting(true);

      // Crie um objeto que corresponda à interface EmendaInput
      const emendaData: any = {
        titulo,
        descricao,
        dataApresentacao,
        status,
      };

      // Se estamos no modo de edição, chamamos a função onSave com o ID separadamente
      if (isEditMode && emenda) {
        await onSave({ ...emendaData, id: emenda.id });
      } else {
        await onSave(emendaData);
      }

      addNotification(
        `Emenda ${isEditMode ? "atualizada" : "criada"} com sucesso!`,
        "success"
      );

      onClose();
    } catch (error) {
      console.error("Erro ao salvar emenda:", error);
      addNotification(
        `Erro ao ${isEditMode ? "atualizar" : "criar"} emenda`,
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-confresa-azul">
            {isEditMode ? "Editar Emenda" : "Nova Emenda"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Fechar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="titulo"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Título*
            </label>
            <input
              type="text"
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-confresa-azul focus:border-confresa-azul"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="descricao"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Descrição*
            </label>
            <textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-confresa-azul focus:border-confresa-azul"
              required
            ></textarea>
          </div>

          <div className="mb-4">
            <label
              htmlFor="dataApresentacao"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Data de Apresentação*
            </label>
            <input
              type="datetime-local"
              id="dataApresentacao"
              value={dataApresentacao}
              onChange={(e) => setDataApresentacao(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-confresa-azul focus:border-confresa-azul"
              required
            />
          </div>

          {isEditMode && (
            <div className="mb-4">
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-confresa-azul focus:border-confresa-azul"
              >
                <option value="pendente">Pendente</option>
                <option value="em_votacao">Em Votação</option>
                <option value="aprovada">Aprovada</option>
                <option value="reprovada">Reprovada</option>
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              type="button"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Salvando...
                </span>
              ) : (
                `${isEditMode ? "Atualizar" : "Criar"} Emenda`
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
