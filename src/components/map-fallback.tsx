/**
 * Tela alternativa ao mapa, usada quando o mapa do Google não está disponível
 * (development build sem chave de API). Mostra os lugares em lista, por distância.
 */

import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getCategoryInfo } from '@/constants/categories';
import { BottomTabInset, Colors, Radius, Shadow, Spacing } from '@/constants/theme';
import { places } from '@/data/places';
import { useUserLocation } from '@/services/location-context';
import { formatDistance } from '@/utils/distance';
import { sortByDistance, type PlaceWithDistance } from '@/utils/nearby';

export function MapFallback() {
  const router = useRouter();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const { coords } = useUserLocation();

  const list: PlaceWithDistance[] = useMemo(
    () => (coords ? sortByDistance(coords) : places.map((place) => ({ place }))),
    [coords]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: BottomTabInset + Spacing.four }}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Lugares</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Do mais perto para o mais longe.
          </Text>
        </View>

        <View style={[styles.notice, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.noticeText, { color: colors.text }]}>
            🗺️ O mapa não está disponível nesta versão de teste, porque ela não tem a chave do
            Google Maps. No Expo Go o mapa funciona normalmente.
          </Text>
        </View>

        <View style={styles.list}>
          {list.map(({ place, distance }) => {
            const category = getCategoryInfo(place.category);
            return (
              <Pressable
                key={place.id}
                onPress={() => router.push({ pathname: '/place/[id]', params: { id: place.id } })}
                style={[styles.row, Shadow.card, { backgroundColor: colors.card }]}>
                <View style={[styles.dot, { backgroundColor: colors[category.key] }]}>
                  <Text style={styles.dotEmoji}>{category.emoji}</Text>
                </View>
                <View style={styles.rowTexts}>
                  <Text style={[styles.rowName, { color: colors.text }]} numberOfLines={1}>
                    {place.name}
                  </Text>
                  <Text style={[styles.rowInfo, { color: colors.textSecondary }]}>
                    {distance !== undefined
                      ? `${category.singular} • ${formatDistance(distance)} de você`
                      : category.singular}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
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
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 15,
  },
  notice: {
    marginHorizontal: Spacing.four,
    marginTop: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.medium,
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 20,
  },
  list: {
    gap: Spacing.two + 2,
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.four,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.medium,
  },
  dot: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotEmoji: {
    fontSize: 18,
  },
  rowTexts: {
    flex: 1,
    gap: 2,
  },
  rowName: {
    fontSize: 16,
    fontWeight: '700',
  },
  rowInfo: {
    fontSize: 13,
  },
});