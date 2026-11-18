/**
 * Tela Home do ExploreCity.
 * Mostra a saudação, o atalho "Agite", as categorias,
 * os pontos turísticos mais próximos (via GPS) e o botão do mapa.
 */

import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlaceCard } from '@/components/place-card';
import { CATEGORIES } from '@/constants/categories';
import { BottomTabInset, Colors, Radius, Shadow, Spacing } from '@/constants/theme';
import { places } from '@/data/places';
import { useUserLocation } from '@/services/location-context';
import { sortByDistance, type PlaceWithDistance } from '@/utils/nearby';

// Escolhe a saudação conforme a hora do dia.
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function HomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const { coords, status, requestPermission } = useUserLocation();

  // Com GPS: ordena do mais perto para o mais longe. Sem GPS: ordem do JSON.
  const featured: PlaceWithDistance[] = useMemo(() => {
    const list: PlaceWithDistance[] = coords
      ? sortByDistance(coords)
      : places.map((place) => ({ place }));
    return list.slice(0, 6);
  }, [coords]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: BottomTabInset + Spacing.four }}
        showsVerticalScrollIndicator={false}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={[styles.brand, { color: colors.primary }]}>ExploreCity</Text>
          <Text style={[styles.greeting, { color: colors.text }]}>{getGreeting()}, explorador! 👋</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Descubra a história e a cultura de São Paulo.
          </Text>
        </View>

        {/* Aviso sobre o estado do GPS */}
        {status === 'loading' && !coords && (
          <View style={[styles.statusBox, { backgroundColor: colors.backgroundElement }]}>
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>
              📡 Buscando a sua localização...
            </Text>
          </View>
        )}
        {(status === 'denied' || status === 'error') && (
          <Pressable
            onPress={requestPermission}
            style={[styles.statusBox, { backgroundColor: colors.backgroundElement }]}>
            <Text style={[styles.statusText, { color: colors.text }]}>
              {status === 'denied'
                ? '📍 Permita o acesso à localização para ver os lugares perto de você. Toque aqui para tentar de novo.'
                : '⚠️ Não foi possível obter a localização. Verifique se o GPS está ligado e toque aqui.'}
            </Text>
          </Pressable>
        )}

        {/* Atalho: Agite para um ponto aleatório */}
        <Pressable
          onPress={() => router.push('/discover')}
          style={({ pressed }) => [
            styles.shakeButton,
            Shadow.card,
            { backgroundColor: colors.accent, opacity: pressed ? 0.9 : 1 },
          ]}>
          <Text style={styles.shakeEmoji}>📳</Text>
          <View style={styles.shakeTexts}>
            <Text style={styles.shakeTitle}>Agite para uma surpresa</Text>
            <Text style={styles.shakeSubtitle}>Sorteie um lugar para descobrir</Text>
          </View>
        </Pressable>

        {/* Categorias: abrem o mapa já filtrado */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Categorias</Text>
        <View style={styles.categoriesRow}>
          {CATEGORIES.map((category) => (
            <Pressable
              key={category.key}
              onPress={() =>
                router.navigate({
                  pathname: '/map',
                  params: { filter: category.key, t: String(Date.now()) },
                })
              }
              style={({ pressed }) => [
                styles.categoryChip,
                { backgroundColor: colors[category.key], opacity: pressed ? 0.85 : 1 },
              ]}>
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <Text style={styles.categoryLabel}>{category.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Pontos mais próximos */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {coords ? 'Perto de você' : 'Em destaque'}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsRow}>
          {featured.map(({ place, distance }) => (
            <PlaceCard
              key={place.id}
              place={place}
              distanceMeters={distance}
              onPress={() => router.push({ pathname: '/place/[id]', params: { id: place.id } })}
            />
          ))}
        </ScrollView>

        {/* Botão do mapa */}
        <Pressable
          onPress={() => router.navigate('/map')}
          style={({ pressed }) => [
            styles.mapButton,
            { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 },
          ]}>
          <Text style={styles.mapButtonText}>🗺️  Abrir mapa</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    gap: Spacing.one,
  },
  brand: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 15,
  },
  statusBox: {
    marginHorizontal: Spacing.four,
    marginTop: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.medium,
  },
  statusText: {
    fontSize: 14,
    lineHeight: 20,
  },
  shakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginHorizontal: Spacing.four,
    marginTop: Spacing.four,
    padding: Spacing.three,
    borderRadius: Radius.large,
  },
  shakeEmoji: {
    fontSize: 32,
  },
  shakeTexts: {
    flex: 1,
  },
  shakeTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  shakeSubtitle: {
    color: '#FFFFFF',
    fontSize: 13,
    opacity: 0.9,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: Spacing.five,
    marginBottom: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: Spacing.two + 2,
    paddingHorizontal: Spacing.four,
  },
  categoryChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Radius.medium,
    gap: Spacing.one,
  },
  categoryEmoji: {
    fontSize: 26,
  },
  categoryLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  cardsRow: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    gap: Spacing.three,
  },
  mapButton: {
    marginHorizontal: Spacing.four,
    marginTop: Spacing.four,
    paddingVertical: Spacing.three + 2,
    borderRadius: Radius.pill,
    alignItems: 'center',
  },
  mapButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});