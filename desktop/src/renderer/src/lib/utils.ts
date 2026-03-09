import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Formata número para moeda brasileira: R$ 19,80 */
export function formatarMoeda(valor: number | string): string {
  const num = typeof valor === 'string' ? Number(valor) : valor
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
