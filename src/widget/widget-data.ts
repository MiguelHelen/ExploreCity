/**
 * Dados do widget do ExploreCity.
 * O app salva aqui o ponto turístico mais próximo (calculado com o GPS),
 * e o widget lê esse dado para se desenhar.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import { places } from '../data/places';
import type { Place } from '../types/place';

const STORAGE_KEY = 'explorecity:widget-nearest';

interface SavedNearest {
  placeId: string;
  distance: number; // em metros
  updatedAt: number;
}

// Chamado pelo app: guarda o ponto mais próximo da última posição conhecida.
export async function saveNearest(placeId: string, distance: number): Promise<void> {
  const value: SavedNearest = { placeId, distance, updatedAt: Date.now() };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export interface WidgetData {
  place: Place;
  distance?: number; // só existe quando temos uma posição salva
}

// Chamado pelo widget: lê o que o app salvou.
// Se ainda não há nada salvo, mostra o primeiro lugar da lista como destaque.
export async function loadWidgetData(): Promise<WidgetData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as SavedNearest;
      const place = places.find((item) => item.id === saved.placeId);
      if (place) return { place, distance: saved.distance };
    }
  } catch {
    // Se a leitura falhar, usamos o destaque padrão.
  }
  return { place: places[0] };
}