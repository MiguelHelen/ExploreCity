/**
 * Porta de entrada dos dados do ExploreCity.
 * Lê o arquivo places.json (lugares reais) e, durante os testes,
 * também o testPlaces.json (pontos de teste perto do desenvolvedor).
 */

import type { Place } from '@/types/place';

import placesJson from './places.json';
import testPlacesJson from './testPlaces.json';

// Mude para true para incluir os pontos de teste (útil para testar notificações).
const INCLUDE_TEST_PLACES = false;

const realPlaces = placesJson as Place[];
const testPlaces = testPlacesJson as Place[];

// Lista completa de pontos turísticos, com o molde TypeScript aplicado.
export const places: Place[] = INCLUDE_TEST_PLACES ? [...realPlaces, ...testPlaces] : realPlaces;

// Procura um ponto pelo id. Devolve undefined se não existir.
export function getPlaceById(id: string): Place | undefined {
  return places.find((place) => place.id === id);
}