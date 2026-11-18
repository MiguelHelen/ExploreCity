/**
 * Rota da aba "Mapa".
 * Se o mapa do Google está disponível, mostra o mapa interativo.
 * Se não (development build sem chave), mostra a lista de lugares.
 * O botão laranja abre o mapa manualmente: use SOMENTE no Expo Go.
 */

import Constants from 'expo-constants';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MapFallback } from '@/components/map-fallback';
import MapScreen from '@/components/map-screen';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { mapsAvailable } from '@/utils/maps';

export default function MapRoute() {
  const [forceMap, setForceMap] = useState(false);

  if (mapsAvailable || forceMap) return <MapScreen />;

  return (
    <View style={styles.container}>
      <MapFallback />
      <Pressable onPress={() => setForceMap(true)} style={styles.forceButton}>
        <Text style={styles.forceText}>Estou no Expo Go: abrir o mapa</Text>
        <Text style={styles.forceHint}>Ambiente detectado: {String(Constants.executionEnvironment)}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  forceButton: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    bottom: BottomTabInset + Spacing.two,
    alignItems: 'center',
    paddingVertical: Spacing.two + 2,
    borderRadius: Radius.pill,
    backgroundColor: '#F28C28',
  },
  forceText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  forceHint: {
    color: '#FFFFFF',
    fontSize: 11,
    opacity: 0.9,
  },
});