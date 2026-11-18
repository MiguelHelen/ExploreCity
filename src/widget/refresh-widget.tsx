/**
 * Pede ao Android para redesenhar o widget com os dados mais recentes.
 * Se a biblioteca não existir (Expo Go), simplesmente não faz nada.
 */

import { Platform } from 'react-native';

import { loadWidgetData } from './widget-data';

export async function refreshWidget(): Promise<void> {
  if (Platform.OS !== 'android') return;

  try {
    const { requestWidgetUpdate } = require('react-native-android-widget');
    const { NearestPlaceWidget } = require('./NearestPlaceWidget');
    const data = await loadWidgetData();

    await requestWidgetUpdate({
      widgetName: 'NearestPlace',
      renderWidget: (info: { width: number; height: number }) => (
        <NearestPlaceWidget
          place={data.place}
          distance={data.distance}
          width={info.width}
          height={info.height}
        />
      ),
      widgetNotFound: () => {},
    });
  } catch {
    // Sem a biblioteca nativa (Expo Go): o widget não existe, então ignoramos.
  }
}