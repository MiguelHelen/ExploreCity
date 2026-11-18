/**
 * Serviço de notificações do ExploreCity.
 * Cuida da permissão, do canal do Android e do envio das notificações locais.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Category, Place } from '@/types/place';

export type NotificationPermission = 'granted' | 'denied' | 'undetermined';

// "Canal" é como o Android agrupa notificações. Com importância alta,
// a notificação aparece como um aviso no topo da tela.
const CHANNEL_ID = 'proximity';

// Guarda se o canal foi criado com sucesso.
let channelReady = false;

// Frase de abertura de cada categoria (parte do clima de "visita guiada").
const INTRO: Record<Category, string> = {
  museum: 'Você está perto de um museu!',
  park: 'Você está perto de um parque!',
  monument: 'Você está próximo de um lugar histórico!',
};

// Define como as notificações se comportam com o app aberto: aparecem como aviso.
export function configureNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

// Cria o canal no Android. Nunca lança erro: se falhar, devolve false
// e as notificações usam o canal padrão do sistema.
export async function ensureChannel(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  try {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Pontos turísticos próximos',
      importance: Notifications.AndroidImportance.HIGH,
    });
    channelReady = true;
    return true;
  } catch (error) {
    channelReady = false;
    console.warn('[ExploreCity] Não foi possível criar o canal de notificações:', error);
    return false;
  }
}

// Consulta a permissão atual, sem perguntar ao usuário.
export async function getPermission(): Promise<NotificationPermission> {
  const result = await Notifications.getPermissionsAsync();
  if (result.granted) return 'granted';
  return result.canAskAgain ? 'undetermined' : 'denied';
}

// Pede permissão ao usuário (aparece a janelinha do Android).
export async function requestPermission(): Promise<NotificationPermission> {
  await ensureChannel();
  const result = await Notifications.requestPermissionsAsync();
  if (result.granted) return 'granted';
  return result.canAskAgain ? 'undetermined' : 'denied';
}

// Dispara, agora, a notificação com a curiosidade do lugar.
export async function sendPlaceNotification(place: Place) {
  // Se o canal ainda não foi criado, tenta criar antes de enviar.
  if (Platform.OS === 'android' && !channelReady) {
    await ensureChannel();
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `📍 ${INTRO[place.category]}`,
        subtitle: place.name,
        body: `${place.name}: ${place.curiosity}`,
        data: { placeId: place.id }, // usado para abrir os detalhes ao tocar
      },
      // Com canal: aviso no topo. Sem canal (plano B): canal padrão do Android.
      trigger: channelReady ? { channelId: CHANNEL_ID } : null,
    });
  } catch (error) {
    console.warn('[ExploreCity] Falha ao enviar a notificação:', error);
    throw error;
  }
}