export type Variante = 'ok' | 'warn' | 'crit' | 'purple' | 'info' | 'ghost';

export interface Bloco {
  id: string;
  nome: string;
  tag: string;
  resumo: string;
  variante?: Variante;

  ondeMora: string;
  oQueFaz: string;
  recebeDe: string[];
  entrega: string[];
  observacoes?: string[];
}
