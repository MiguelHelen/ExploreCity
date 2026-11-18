/**
 * Tela de descoberta aleatória do ExploreCity: "Agite para um ponto aleatório".
 * Usa o acelerômetro (via useShake). Ao detectar uma agitada, sorteia um ponto
 * turístico e mostra foto, nome, curiosidade e um mapa centralizado nele
 * (o mapa só aparece quando está disponível neste ambiente).
 */

import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
  useColorScheme,
} from 'react-native';
import MapView from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlaceMarker } from '@/components/place-marker';
import { getCategoryInfo } from '@/constants/categories';
import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';
import { placeImages } from '@/data/placeImages';
import { places } from '@/data/places';
import { useUserLocation } from '@/services/location-context';
import { SHAKE_THRESHOLD_G, useShake } from '@/services/shake';
import type { Place } from '@/types/place';
import { formatDistance } from '@/utils/distance';
import { mapsAvailable } from '@/utils/maps';
import { distanceToPlace } from '@/utils/nearby';

// Força máxima exibida na barra (acima disso a barra fica cheia).
const METER_MAX_G = 3;

export default function DiscoverScreen() {
  const router = useRouter();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const { coords } = useUserLocation();

  const [place, setPlace] = useState<Place | null>(null);
  const currentId = useRef<string | null>(null); // para não repetir o mesmo lugar em seguida
  const mapRef = useRef<MapView>(null);

  // Valores de animação.
  const appear = useRef(new Animated.Value(0)).current; // aparição do cartão
  const wiggle = useRef(new Animated.Value(0)).current; // celular balançando

  // Sorteia um lugar diferente do atual e dá o feedback de vibração.
  const pickRandom = useCallback(() => {
    const options = places.filter((item) => item.id !== currentId.current);
    if (options.length === 0) return;
    const next = options[Math.floor(Math.random() * options.length)];
    currentId.current = next.id;
    setPlace(next);
    Vibration.vibrate(80);
  }, []);

  // O acelerômetro de verdade: chama pickRandom a cada agitada.
  const { available, magnitude } = useShake(pickRandom);

  // Quando um lugar é sorteado: anima o cartão e centraliza o mapa nele.
  useEffect(() => {
    if (!place) return;
    appear.setValue(0);
    Animated.spring(appear, { toValue: 1, friction: 6, useNativeDriver: true }).start();
    mapRef.current?.animateToRegion(
      {
        latitude: place.latitude,
        longitude: place.longitude,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      },
      700
    );
  }, [place, appear]);

  // O celular desenhado fica balançando de tempos em tempos, chamando o usuário.
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(wiggle, { toValue: 1, duration: 120, useNativeDriver: true }),
        Animated.timing(wiggle, { toValue: -1, duration: 240, useNativeDriver: true }),
        Animated.timing(wiggle, { toValue: 1, duration: 240, useNativeDriver: true }),
        Animated.timing(wiggle, { toValue: 0, duration: 120, useNativeDriver: true }),
        Animated.delay(1400),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [wiggle]);

  const rotate = wiggle.interpolate({ inputRange: [-1, 1], outputRange: ['-14deg', '14deg'] });
  const cardScale = appear.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] });
  const cardShift = appear.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });

  const category = place ? getCategoryInfo(place.category) : null;
  const distance = place && coords ? distanceToPlace(coords, place) : undefined;
  const meterPercent = Math.min(magnitude / METER_MAX_G, 1) * 100;
  const thresholdPercent = (SHAKE_THRESHOLD_G / METER_MAX_G) * 100;
  const overThreshold = magnitude > SHAKE_THRESHOLD_G;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Topo: botão voltar */}
        <View style={styles.topRow}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: colors.backgroundElement, opacity: pressed ? 0.8 : 1 },
            ]}>
            <Text style={[styles.backText, { color: colors.text }]}>←</Text>
          </Pressable>
        </View>

        {/* Chamada para agitar */}
        <View style={styles.hero}>
          <Animated.Text
            style={[
              styles.phone,
              { fontSize: place ? 48 : 88, transform: [{ rotate }] },
            ]}>
            📳
          </Animated.Text>
          <Text style={[styles.title, { color: colors.text }]}>
            {place ? 'Descoberta!' : 'Agite o celular!'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {place
              ? 'Agite de novo para sortear outro lugar.'
              : 'Balance o aparelho para sortear um ponto turístico de São Paulo.'}
          </Text>
        </View>

        {/* Barra: força do movimento, lida do acelerômetro em tempo real */}
        {available === false ? (
          <View style={[styles.notice, { backgroundColor: colors.backgroundElement }]}>
            <Text style={[styles.noticeText, { color: colors.text }]}>
              ⚠️ Este aparelho não tem acelerômetro disponível. Use o botão abaixo para sortear.
            </Text>
          </View>
        ) : (
          <View style={styles.meterBlock}>
            <View style={styles.meterLabels}>
              <Text style={[styles.meterLabel, { color: colors.textSecondary }]}>Força do movimento</Text>
              <Text style={[styles.meterValue, { color: overThreshold ? colors.accent : colors.text }]}>
                {magnitude.toFixed(1)} g
              </Text>
            </View>
            <View style={[styles.meterTrack, { backgroundColor: colors.backgroundSelected }]}>
              <View
                style={[
                  styles.meterFill,
                  {
                    width: `${meterPercent}%`,
                    backgroundColor: overThreshold ? colors.accent : colors.primary,
                  },
                ]}
              />
              {/* Marca do limite: passou dela, conta como agitada */}
              <View style={[styles.meterMark, { left: `${thresholdPercent}%`, backgroundColor: colors.text }]} />
            </View>
          </View>
        )}

        {/* Resultado do sorteio */}
        {place && category && (
          <Animated.View
            style={[
              styles.result,
              Shadow.card,
              {
                backgroundColor: colors.card,
                opacity: appear,
                transform: [{ translateY: cardShift }, { scale: cardScale }],
              },
            ]}>
            <Image source={placeImages[place.image]} style={styles.resultImage} resizeMode="cover" />

            <View style={styles.resultBody}>
              <View style={[styles.badge, { backgroundColor: colors[category.key] }]}>
                <Text style={styles.badgeText}>
                  {category.emoji} {category.singular}
                </Text>
              </View>

              <Text style={[styles.placeName, { color: colors.text }]}>{place.name}</Text>
              {distance !== undefined && (
                <Text style={[styles.distance, { color: colors.textSecondary }]}>
                  📍 {formatDistance(distance)} de você
                </Text>
              )}

              <View style={[styles.curiosity, { backgroundColor: colors.backgroundElement }]}>
                <Text style={[styles.curiosityTitle, { color: colors.accent }]}>💡 Você sabia?</Text>
                <Text style={[styles.curiosityText, { color: colors.text }]}>{place.curiosity}</Text>
              </View>

              {/* Mapa pequeno, centralizado automaticamente no lugar sorteado */}
              {mapsAvailable && (
                <View style={styles.miniMapWrapper}>
                  <MapView
                    ref={mapRef}
                    style={StyleSheet.absoluteFill}
                    initialRegion={{
                      latitude: place.latitude,
                      longitude: place.longitude,
                      latitudeDelta: 0.008,
                      longitudeDelta: 0.008,
                    }}
                    scrollEnabled={false}
                    zoomEnabled={false}
                    rotateEnabled={false}
                    pitchEnabled={false}
                    toolbarEnabled={false}>
                    <PlaceMarker place={place} selected onPress={() => {}} />
                  </MapView>
                </View>
              )}

              <View style={styles.buttonsRow}>
                <Pressable
                  onPress={() => router.push({ pathname: '/place/[id]', params: { id: place.id } })}
                  style={({ pressed }) => [
                    styles.button,
                    { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 },
                  ]}>
                  <Text style={styles.buttonText}>Ver detalhes</Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    router.navigate({
                      pathname: '/map',
                      params: { placeId: place.id, t: String(Date.now()) },
                    })
                  }
                  style={({ pressed }) => [
                    styles.button,
                    { backgroundColor: colors.accent, opacity: pressed ? 0.9 : 1 },
                  ]}>
                  <Text style={styles.buttonText}>🗺️ Ver no mapa</Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Plano B discreto, para acessibilidade ou se o sensor falhar na hora da apresentação */}
        <Pressable onPress={pickRandom} style={styles.fallback}>
          <Text style={[styles.fallbackText, { color: colors.textSecondary }]}>
            Prefere não agitar? Toque aqui para sortear
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.six,
  },
  topRow: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 22,
    fontWeight: '700',
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    gap: Spacing.two,
  },
  phone: {
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  notice: {
    marginHorizontal: Spacing.four,
    marginTop: Spacing.four,
    padding: Spacing.three,
    borderRadius: Radius.medium,
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 20,
  },
  meterBlock: {
    marginHorizontal: Spacing.four,
    marginTop: Spacing.four,
    gap: Spacing.two,
  },
  meterLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meterLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  meterValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  meterTrack: {
    height: 12,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: Radius.pill,
  },
  meterMark: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
  },
  result: {
    marginHorizontal: Spacing.four,
    marginTop: Spacing.four,
    borderRadius: Radius.large,
    overflow: 'hidden',
  },
  resultImage: {
    width: '100%',
    height: 200,
  },
  resultBody: {
    padding: Spacing.three,
    gap: Spacing.two + 2,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
    borderRadius: Radius.pill,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  placeName: {
    fontSize: 24,
    fontWeight: '800',
  },
  distance: {
    fontSize: 14,
    fontWeight: '600',
  },
  curiosity: {
    padding: Spacing.three,
    borderRadius: Radius.medium,
    gap: Spacing.two,
  },
  curiosityTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  curiosityText: {
    fontSize: 15,
    lineHeight: 22,
  },
  miniMapWrapper: {
    height: 170,
    borderRadius: Radius.medium,
    overflow: 'hidden',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: Spacing.two + 2,
    marginTop: Spacing.one,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Radius.pill,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  fallback: {
    alignItems: 'center',
    marginTop: Spacing.four,
    padding: Spacing.three,
  },
  fallbackText: {
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});