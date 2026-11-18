/**
 * Rota da aba "Mapa".
 * Se o mapa do Google está disponível, mostra o mapa interativo.
 * Se não (development build sem chave), mostra a lista de lugares.
 */

import { MapFallback } from '@/components/map-fallback';
import MapScreen from '@/components/map-screen';
import { mapsAvailable } from '@/utils/maps';

export default function MapRoute() {
  return mapsAvailable ? <MapScreen /> : <MapFallback />;
}