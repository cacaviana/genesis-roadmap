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

export interface Ator {
  id: string;
  nome: string;
  papel: string;
  cor: string;
}

export interface Caso {
  id: string;
  ordem: number;
  atorId: string;
  nome: string;
  passo: string;
  oQueAcontece: string;
  porQueImporta?: string;
}
