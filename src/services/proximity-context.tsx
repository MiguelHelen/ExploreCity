/**
 * Provedor de proximidade do ExploreCity.
 * Observa a posição do usuário e, quando ele chega perto de um ponto turístico,
 * dispara a notificação com a curiosidade. Também guarda as configurações
 * (ligado/desligado e raio) e o histórico de lugares já notificados.
 *
 * Como evitamos notificações repetidas:
 *  1. Cada lugar só notifica de novo depois de NOTIFICATION_COOLDOWN_MS.
 *  2. O histórico fica salvo no celular (AsyncStorage), então vale mesmo
 *     se o app for fechado e aberto de novo.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { DEFAULT_RADIUS_METERS, NOTIFICATION_COOLDOWN_MS } from '@/constants/proximity';
import { places } from '@/data/places';
import { useUserLocation } from '@/services/location-context';
import {
  configureNotifications,
  ensureChannel,
  getPermission,
  requestPermission,
  sendPlaceNotification,
  type NotificationPermission,
} from '@/services/notifications';
import { sortByDistance } from '@/utils/nearby';

const STORAGE_NOTIFIED = 'explorecity:notified';
const STORAGE_SETTINGS = 'explorecity:settings';

// Liga o comportamento das notificações uma única vez, quando o app carrega.
configureNotifications();

interface ProximityContextValue {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  radius: number;
  setRadius: (meters: number) => void;
  notified: Record<string, number>; // id do lugar -> hora em que notificou
  permission: NotificationPermission;
  askPermission: () => Promise<void>;
  resetVisit: () => void;
  sendTest: () => Promise<boolean>;
}

const ProximityContext = createContext<ProximityContextValue>({
  enabled: true,
  setEnabled: () => {},
  radius: DEFAULT_RADIUS_METERS,
  setRadius: () => {},
  notified: {},
  permission: 'undetermined',
  askPermission: async () => {},
  resetVisit: () => {},
  sendTest: async () => false,
});

export function ProximityProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { coords } = useUserLocation();

  const [ready, setReady] = useState(false); // true quando já lemos a memória do celular
  const [enabled, setEnabledState] = useState(true);
  const [radius, setRadiusState] = useState(DEFAULT_RADIUS_METERS);
  const [notified, setNotified] = useState<Record<string, number>>({});
  const [permission, setPermission] = useState<NotificationPermission>('undetermined');

  // Cópia "imediata" do histórico. Atualizamos ela na hora para garantir que
  // o mesmo lugar não seja notificado duas vezes em sequência.
  const notifiedRef = useRef<Record<string, number>>({});

  // 1. Ao abrir o app: lê a memória e prepara as notificações.
  useEffect(() => {
    (async () => {
      try {
        const savedNotified = await AsyncStorage.getItem(STORAGE_NOTIFIED);
        if (savedNotified) {
          notifiedRef.current = JSON.parse(savedNotified);
          setNotified(notifiedRef.current);
        }
        const savedSettings = await AsyncStorage.getItem(STORAGE_SETTINGS);
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          if (typeof settings.enabled === 'boolean') setEnabledState(settings.enabled);
          if (typeof settings.radius === 'number') setRadiusState(settings.radius);
        }
      } catch {
        // Se a leitura falhar, seguimos com os valores padrão.
      }

      try {
        await ensureChannel();
        let current = await getPermission();
        if (current === 'undetermined') current = await requestPermission();
        setPermission(current);
      } catch {
        setPermission('denied');
      }

      setReady(true);
    })();
  }, []);

  // 2. Ao tocar em uma notificação: abre a tela de detalhes do lugar.
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const placeId = response.notification.request.content.data?.placeId;
      if (typeof placeId === 'string') {
        router.push({ pathname: '/place/[id]', params: { id: placeId } });
      }
    });
    return () => subscription.remove();
  }, [router]);

  // 3. O vigia: a cada nova posição, vê se há um lugar dentro do raio.
  useEffect(() => {
    if (!ready || !enabled || !coords || permission !== 'granted') return;

    const now = Date.now();
    const target = sortByDistance(coords).find(({ place, distance }) => {
      if (distance === undefined || distance > radius) return false;
      const last = notifiedRef.current[place.id];
      return !last || now - last > NOTIFICATION_COOLDOWN_MS;
    });
    if (!target) return;

    // Marca ANTES de enviar, para não notificar duas vezes.
    notifiedRef.current = { ...notifiedRef.current, [target.place.id]: now };
    setNotified(notifiedRef.current);
    AsyncStorage.setItem(STORAGE_NOTIFIED, JSON.stringify(notifiedRef.current)).catch(() => {});

    sendPlaceNotification(target.place).catch(() => {});
  }, [coords, ready, enabled, radius, permission]);

  // Salva as configurações no celular.
  const saveSettings = (nextEnabled: boolean, nextRadius: number) => {
    AsyncStorage.setItem(
      STORAGE_SETTINGS,
      JSON.stringify({ enabled: nextEnabled, radius: nextRadius })
    ).catch(() => {});
  };

  const setEnabled = (value: boolean) => {
    setEnabledState(value);
    saveSettings(value, radius);
  };

  const setRadius = (meters: number) => {
    setRadiusState(meters);
    saveSettings(enabled, meters);
  };

  const askPermission = useCallback(async () => {
    setPermission(await requestPermission());
  }, []);

  // Apaga o histórico: todos os lugares voltam a poder notificar.
  const resetVisit = useCallback(() => {
    notifiedRef.current = {};
    setNotified({});
    AsyncStorage.removeItem(STORAGE_NOTIFIED).catch(() => {});
  }, []);

  // Notificação de teste: usa o lugar mais próximo (ou o primeiro da lista).
  const sendTest = useCallback(async () => {
    if (permission !== 'granted') return false;
    const place = coords ? sortByDistance(coords)[0].place : places[0];
    await sendPlaceNotification(place);
    return true;
  }, [coords, permission]);

  return (
    <ProximityContext.Provider
      value={{
        enabled,
        setEnabled,
        radius,
        setRadius,
        notified,
        permission,
        askPermission,
        resetVisit,
        sendTest,
      }}>
      {children}
    </ProximityContext.Provider>
  );
}

// Atalho para as telas lerem os dados de proximidade.
export function useProximity() {
  return useContext(ProximityContext);
}