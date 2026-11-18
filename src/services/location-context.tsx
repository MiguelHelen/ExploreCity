/**
 * Provedor de localização do ExploreCity.
 * Pede permissão ao usuário, liga o GPS e mantém a posição atual atualizada.
 * Qualquer tela pode ler a posição com: const { coords, status } = useUserLocation();
 */

import * as Location from 'expo-location';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from 'react';

export interface Coords {
  latitude: number;
  longitude: number;
}

// loading = procurando | granted = funcionando | denied = sem permissão | error = falhou
export type LocationStatus = 'loading' | 'granted' | 'denied' | 'error';

interface LocationContextValue {
  coords: Coords | null;
  status: LocationStatus;
  requestPermission: () => Promise<void>;
}

const LocationContext = createContext<LocationContextValue>({
  coords: null,
  status: 'loading',
  requestPermission: async () => {},
});

export function LocationProvider({ children }: { children: ReactNode }) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [status, setStatus] = useState<LocationStatus>('loading');
  const subscription = useRef<Location.LocationSubscription | null>(null);

  const start = useCallback(async () => {
    try {
      setStatus('loading');

      // 1. Pede permissão (aparece a janelinha do Android)
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setStatus('denied');
        return;
      }

      // 2. Usa a última posição conhecida para a tela não ficar vazia
      const last = await Location.getLastKnownPositionAsync();
      if (last) {
        setCoords({ latitude: last.coords.latitude, longitude: last.coords.longitude });
        setStatus('granted');
      }

      // 3. Acompanha a posição: atualiza a cada 20 metros andados (ou 5 segundos)
      subscription.current?.remove();
      subscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 20,
          timeInterval: 5000,
        },
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setStatus('granted');
        }
      );
    } catch {
      setStatus('error');
    }
  }, []);

  // Liga o GPS quando o app abre e desliga quando ele fecha.
  useEffect(() => {
    start();
    return () => {
      subscription.current?.remove();
    };
  }, [start]);

  return (
    <LocationContext.Provider value={{ coords, status, requestPermission: start }}>
      {children}
    </LocationContext.Provider>
  );
}

// Atalho para as telas lerem a localização.
export function useUserLocation() {
  return useContext(LocationContext);
}