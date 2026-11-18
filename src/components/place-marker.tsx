/**
 * Marcador de um ponto turístico no mapa.
 * É um círculo colorido com o emoji da categoria.
 * O marcador selecionado fica maior.
 */

import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import { Marker } from 'react-native-maps';

import { getCategoryInfo } from '@/constants/categories';
import { Colors } from '@/constants/theme';
import type { Place } from '@/types/place';

interface PlaceMarkerProps {
  place: Place;
  selected: boolean;
  onPress: () => void;
}

export function PlaceMarker({ place, selected, onPress }: PlaceMarkerProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const category = getCategoryInfo(place.category);

  // No Android, o mapa "tira uma foto" do marcador. Deixamos o desenho
  // atualizar por um instante e depois paramos, o que deixa o mapa mais leve.
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  useEffect(() => {
    setTracksViewChanges(true);
    const timer = setTimeout(() => setTracksViewChanges(false), 600);
    return () => clearTimeout(timer);
  }, [selected]);

  const size = selected ? 52 : 40;

  return (
    <Marker
      coordinate={{ latitude: place.latitude, longitude: place.longitude }}
      onPress={onPress}
      tracksViewChanges={tracksViewChanges}
      anchor={{ x: 0.5, y: 0.5 }}
      zIndex={selected ? 10 : 1}>
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors[category.key],
          },
        ]}>
        <Text style={{ fontSize: selected ? 26 : 20 }}>{category.emoji}</Text>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
});