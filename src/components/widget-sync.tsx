/**
 * Componente invisível: quando o GPS atualiza a posição, descobre o ponto
 * turístico mais próximo, salva e avisa o widget para se atualizar.
 */

import { useEffect, useRef } from 'react';

import { useUserLocation } from '@/services/location-context';
import { sortByDistance } from '@/utils/nearby';
import { refreshWidget } from '@/widget/refresh-widget';
import { saveNearest } from '@/widget/widget-data';

// Intervalo mínimo entre duas atualizações do widget (em milissegundos).
const MIN_INTERVAL_MS = 15000;

export function WidgetSync() {
  const { coords } = useUserLocation();
  const lastSync = useRef(0);

  useEffect(() => {
    if (!coords) return;

    const now = Date.now();
    if (now - lastSync.current < MIN_INTERVAL_MS) return;
    lastSync.current = now;

    const nearest = sortByDistance(coords)[0];
    if (!nearest || nearest.distance === undefined) return;

    saveNearest(nearest.place.id, nearest.distance)
      .then(refreshWidget)
      .catch(() => {});
  }, [coords]);

  return null;
}