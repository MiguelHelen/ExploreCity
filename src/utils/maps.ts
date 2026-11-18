/**
 * Verifica se o mapa do Google pode ser usado neste ambiente.
 *
 * - No Expo Go o mapa funciona (o Expo Go já traz uma chave embutida).
 * - Em um development build / APK, o Android exige uma chave de API do Google Maps
 *   no app.json. Sem ela, o Google derruba o app ao abrir um mapa.
 *   Então, sem chave, o app mostra uma alternativa em lista.
 */

import Constants, { ExecutionEnvironment } from 'expo-constants';

export const mapsAvailable: boolean =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
  Boolean(Constants.expoConfig?.android?.config?.googleMaps?.apiKey);