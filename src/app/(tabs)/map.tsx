/**
 * Tela do Mapa do ExploreCity.
 * Mostra os pontos turísticos como marcadores coloridos, a posição do usuário,
 * filtros por categoria, o ponto mais próximo e um card com informações
 * ao tocar em um marcador.
 *
 * Outras telas podem abrir o mapa já configurado, mandando parâmetros:
 *  - placeId: abre com aquele lugar selecionado
 *  - filter: abre filtrado em uma categoria
 *  - t: hora do pedido (faz o mapa perceber um pedido novo)
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import MapView from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PlaceMarker } from '@/components/place-marker';
import { CATEGORIES, getCategoryInfo } from '@/constants/categories';
import { BottomTabInset, Colors, Radius, Shadow, Spacing } from '@/constants/theme';
import { placeImages } from '@/data/placeImages';
import { getPlaceById, places } from '@/data/places';
import { useUserLocation } from '@/services/location-context';
import type { Category, Place } from '@/types/place';
import { formatDistance } from '@/utils/distance';
import { distanceToPlace, sortByDistance } from '@/utils/nearby';

// Centro de São Paulo: onde o mapa começa antes de sabermos onde o usuário está.
const SAO_PAULO = { latitude: -23.5505, longitude: -46.6333 };

export default function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const { coords } = useUserLocation();

  // Parâmetros enviados por outras telas (todos opcionais).
  const {
    placeId,
    filter: filterParam,
    t,
  } = useLocalSearchParams<{ placeId?: string; filter?: string; t?: string }>();

  const mapRef = useRef<MapView>(null);
  const centeredOnUser = useRef(false);

  // Guarda a hora do último toque em um marcador. No Android, um toque em
  // marcador também pode chegar ao mapa por baixo e fechar o card sem querer.
  const lastMarkerPress = useRef(0);

  const [filter, setFilter] = useState<Category | null>(null); // null = todas
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedPlace = selectedId ? getPlaceById(selectedId) : undefined;

  // Lugares visíveis, de acordo com o filtro.
  const visiblePlaces = useMemo(
    () => (filter ? places.filter((place) => place.category === filter) : places),
    [filter]
  );

  // O ponto turístico mais próximo do usuário.
  const nearest = useMemo(() => (coords ? sortByDistance(coords)[0] : undefined), [coords]);

  // Move a câmera do mapa para uma posição, com animação.
  const focusOn = useCallback((latitude: number, longitude: number, delta = 0.012) => {
    mapRef.current?.animateToRegion(
      { latitude, longitude, latitudeDelta: delta, longitudeDelta: delta },
      600
    );
  }, []);

  // Seleciona um lugar: mostra o card e centraliza o mapa nele.
  const selectPlace = useCallback(
    (place: Place) => {
      setSelectedId(place.id);
      focusOn(place.latitude, place.longitude);
    },
    [focusOn]
  );

  // Quando o GPS chega pela primeira vez, centraliza o mapa no usuário
  // (a não ser que a tela tenha sido aberta já em um lugar específico).
  useEffect(() => {
    if (coords && !centeredOnUser.current && !placeId) {
      centeredOnUser.current = true;
      focusOn(coords.latitude, coords.longitude, 0.03);
    }
  }, [coords, placeId, focusOn]);

  // Pedido de outra tela: abrir já em um lugar específico.
  useEffect(() => {
    if (!placeId) return;
    const place = getPlaceById(placeId);
    if (place) {
      centeredOnUser.current = true;
      setFilter(null);
      const timer = setTimeout(() => selectPlace(place), 400);
      return () => clearTimeout(timer);
    }
  }, [placeId, t, selectPlace]);

  // Pedido de outra tela: abrir já filtrado em uma categoria.
  useEffect(() => {
    if (!filterParam) return;
    const category = CATEGORIES.find((item) => item.key === filterParam);
    if (category) {
      setFilter(category.key);
      setSelectedId(null);
    }
  }, [filterParam, t]);

  // Ao mudar o filtro, limpamos a seleção para não ficar um card de um lugar escondido.
  const changeFilter = (next: Category | null) => {
    setFilter(next);
    setSelectedId(null);
  };

  // Toque em um marcador: registra a hora e seleciona o lugar.
  const handleMarkerPress = (place: Place) => {
    lastMarkerPress.current = Date.now();
    selectPlace(place);
  };

  // Toque no mapa: fecha o card, a não ser que seja o "eco" de um toque em marcador.
  const handleMapPress = () => {
    if (Date.now() - lastMarkerPress.current < 500) return;
    setSelectedId(null);
  };

  const selectedDistance =
    coords && selectedPlace ? distanceToPlace(coords, selectedPlace) : undefined;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={{ ...SAO_PAULO, latitudeDelta: 0.12, longitudeDelta: 0.12 }}
        showsUserLocation
        showsMyLocationButton={false}
        toolbarEnabled={false}
        onPress={handleMapPress}>
        {visiblePlaces.map((place) => (
          <PlaceMarker
            key={place.id}
            place={place}
            selected={place.id === selectedId}
            onPress={() => handleMarkerPress(place)}
          />
        ))}
      </MapView>

      {/* Filtros e atalho do ponto mais próximo, por cima do mapa */}
      <View style={[styles.topArea, { paddingTop: insets.top + Spacing.two }]} pointerEvents="box-none">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}>
          <Pressable
            onPress={() => changeFilter(null)}
            style={[
              styles.chip,
              Shadow.card,
              { backgroundColor: filter === null ? colors.primary : colors.card },
            ]}>
            <Text style={[styles.chipText, { color: filter === null ? '#FFFFFF' : colors.text }]}>
              Todos
            </Text>
          </Pressable>

          {CATEGORIES.map((category) => {
            const active = filter === category.key;
            return (
              <Pressable
                key={category.key}
                onPress={() => changeFilter(category.key)}
                style={[
                  styles.chip,
                  Shadow.card,
                  { backgroundColor: active ? colors[category.key] : colors.card },
                ]}>
                <Text style={[styles.chipText, { color: active ? '#FFFFFF' : colors.text }]}>
                  {category.emoji} {category.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {nearest && (
          <Pressable
            onPress={() => {
              setFilter(null);
              selectPlace(nearest.place);
            }}
            style={[styles.nearestChip, Shadow.card, { backgroundColor: colors.accent }]}>
            <Text style={styles.nearestText} numberOfLines={1}>
              📍 Mais próximo: {nearest.place.name}
              {nearest.distance !== undefined ? ` • ${formatDistance(nearest.distance)}` : ''}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Botão: centralizar em mim */}
      {coords && (
        <Pressable
          onPress={() => focusOn(coords.latitude, coords.longitude, 0.02)}
          style={[
            styles.locateButton,
            Shadow.card,
            {
              backgroundColor: colors.card,
              bottom: BottomTabInset + (selectedPlace ? 130 : Spacing.three),
            },
          ]}>
          <Text style={styles.locateIcon}>🎯</Text>
        </Pressable>
      )}

      {/* Card de informações do lugar selecionado */}
      {selectedPlace && (
        <Pressable
          onPress={() => router.push({ pathname: '/place/[id]', params: { id: selectedPlace.id } })}
          style={[
            styles.infoCard,
            Shadow.card,
            { backgroundColor: colors.card, bottom: BottomTabInset + Spacing.two },
          ]}>
          <Image source={placeImages[selectedPlace.image]} style={styles.infoImage} resizeMode="cover" />
          <View style={styles.infoTexts}>
            <Text style={[styles.infoCategory, { color: colors[getCategoryInfo(selectedPlace.category).key] }]}>
              {getCategoryInfo(selectedPlace.category).emoji} {getCategoryInfo(selectedPlace.category).singular}
            </Text>
            <Text style={[styles.infoName, { color: colors.text }]} numberOfLines={2}>
              {selectedPlace.name}
            </Text>
            {selectedDistance !== undefined && (
              <Text style={[styles.infoDistance, { color: colors.textSecondary }]}>
                📍 {formatDistance(selectedDistance)} de você
              </Text>
            )}
            <Text style={[styles.infoLink, { color: colors.primary }]}>Ver detalhes →</Text>
          </View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    gap: Spacing.two,
  },
  chipsRow: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '700',
  },
  nearestChip: {
    alignSelf: 'flex-start',
    marginLeft: Spacing.three,
    maxWidth: '90%',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
  },
  nearestText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  locateButton: {
    position: 'absolute',
    right: Spacing.three,
    width: 48,
    height: 48,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locateIcon: {
    fontSize: 22,
  },
  infoCard: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.two + 2,
    borderRadius: Radius.large,
  },
  infoImage: {
    width: 96,
    height: 96,
    borderRadius: Radius.medium,
  },
  infoTexts: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  infoCategory: {
    fontSize: 12,
    fontWeight: '800',
  },
  infoName: {
    fontSize: 17,
    fontWeight: '800',
  },
  infoDistance: {
    fontSize: 13,
  },
  infoLink: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
});