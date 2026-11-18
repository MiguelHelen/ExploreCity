/**
 * Funções de distância do ExploreCity.
 * Usadas na Home, no mapa, nos detalhes e nas notificações de proximidade.
 */

const EARTH_RADIUS_METERS = 6371000; // raio médio da Terra, em metros

// Converte graus em radianos (a matemática da fórmula usa radianos).
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calcula a distância em metros entre dois pontos do mapa.
 * Usa a fórmula de Haversine, que considera que a Terra é redonda.
 */
export function getDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

/**
 * Transforma metros em texto amigável.
 * Exemplos: 350 -> "350 m", 2900 -> "2,9 km"
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
}