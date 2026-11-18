/**
 * Informações das categorias de pontos turísticos:
 * nome exibido, emoji e a chave que liga a categoria à sua cor no tema.
 */

import type { Category } from '@/types/place';

export interface CategoryInfo {
  key: Category; // também é o nome da cor em theme.ts (museum, park, monument)
  label: string; // plural, usado nos filtros ("Museus")
  singular: string; // singular, usado nos cards ("Museu")
  emoji: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { key: 'museum', label: 'Museus', singular: 'Museu', emoji: '🏛️' },
  { key: 'park', label: 'Parques', singular: 'Parque', emoji: '🌳' },
  { key: 'monument', label: 'Monumentos', singular: 'Monumento', emoji: '🗿' },
];

// Busca as informações de uma categoria pela chave.
export function getCategoryInfo(key: Category): CategoryInfo {
  return CATEGORIES.find((category) => category.key === key) ?? CATEGORIES[0];
}