import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata uma data ISO para exibição no formato brasileiro
 * @param isoDate Data em formato ISO ou objeto Date
 * @returns String formatada (DD/MM/YYYY HH:MM)
 */
export function formatarData(isoDate: string | Date): string {
  if (!isoDate) return "";

  const data = typeof isoDate === "string" ? new Date(isoDate) : isoDate;

  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Formata um valor monetário para exibição
 * @param valor Valor numérico
 * @returns String formatada (R$ 0,00)
 */
export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Trunca um texto longo e adiciona reticências
 * @param texto Texto a ser truncado
 * @param tamanhoMaximo Tamanho máximo do texto
 * @returns Texto truncado
 */
export function truncarTexto(texto: string, tamanhoMaximo: number): string {
  if (!texto) return "";
  if (texto.length <= tamanhoMaximo) return texto;

  return texto.substring(0, tamanhoMaximo) + "...";
}

/**
 * Gera um slug a partir de um texto
 * @param texto Texto para gerar o slug
 * @returns Slug gerado
 */
export function gerarSlug(texto: string): string {
  if (!texto) return "";

  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "-");
}
