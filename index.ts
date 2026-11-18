/**
 * Arquivo de entrada do ExploreCity.
 * Carrega o app (Expo Router) e registra o "tratador" do widget Android.
 *
 * O widget só existe no development build / APK. No Expo Go a biblioteca nativa
 * não está disponível, então o registro é protegido por try/catch:
 * assim o app continua abrindo normalmente, apenas sem o widget.
 */

import 'expo-router/entry';

try {
  const { registerWidgetTaskHandler } = require('react-native-android-widget');
  const { widgetTaskHandler } = require('./src/widget/widget-task-handler');
  registerWidgetTaskHandler(widgetTaskHandler);
} catch {
  console.log('[ExploreCity] Widget indisponível neste ambiente (normal no Expo Go).');
}