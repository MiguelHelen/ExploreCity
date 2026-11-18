/**
 * Funções para descobrir quais pontos turísticos estão perto do usuário.
 */

import { places } from '@/data/places';
import type { Coords } from '@/services/location-context';
import type { Place } from '@/types/place';

import { getDistanceInMeters } from './distance';

export interface PlaceWithDistance {
  place: Place;
  distance?: number; // em metros; fica vazio quando ainda não sabemos onde o usuário está
}

// Devolve todos os pontos turísticos ordenados do mais perto para o mais longe.
export function sortByDistance(coords: Coords): PlaceWithDistance[] {
  return places
    .map((place) => ({
      place,
      distance: getDistanceInMeters(coords.latitude, coords.longitude, place.latitude, place.longitude),
    }))
    .sort((a, b) => a.distance - b.distance);
}

// Distância (em metros) entre o usuário e um ponto específico.
export function distanceToPlace(coords: Coords, place: Place): number {
  return getDistanceInMeters(coords.latitude, coords.longitude, place.latitude, place.longitude);
}