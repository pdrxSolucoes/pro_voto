import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Format date to local string
export function formatDate(date: Date | string): string {
  if (!date) return "";

  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Format status to display text
export function formatStatus(status: string): string {
  switch (status) {
    case "pendente":
      return "Pendente";
    case "em_votacao":
      return "Em Votação";
    case "aprovada":
      return "Aprovada";
    case "reprovada":
      return "Reprovada";
    case "em_andamento":
      return "Em Andamento";
    default:
      return status;
  }
}

// Get status color
export function getStatusColor(status: string): string {
  switch (status) {
    case "pendente":
      return "bg-yellow-100 text-yellow-800";
    case "em_votacao":
    case "em_andamento":
      return "bg-blue-100 text-blue-800";
    case "aprovada":
      return "bg-green-100 text-green-800";
    case "reprovada":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

// Format vote to display text
export function formatVoto(voto: string | null): string {
  if (!voto) return "-";

  switch (voto) {
    case "aprovar":
      return "Aprovado";
    case "desaprovar":
      return "Reprovado";
    case "abster":
      return "Abstenção";
    default:
      return voto;
  }
}

// Get vote color
export function getVotoColor(voto: string | null): string {
  if (!voto) return "bg-gray-100 text-gray-800";

  switch (voto) {
    case "aprovar":
      return "bg-green-100 text-green-800";
    case "desaprovar":
      return "bg-red-100 text-red-800";
    case "abster":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

// Calculate progress percentage
export function calculateProgress(atual: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((atual / total) * 100);
}
