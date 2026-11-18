/**
 * Card de um ponto turístico: foto, categoria, nome e distância.
 * É reutilizado na Home e nas outras telas.
 */

import { Image, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';

import { getCategoryInfo } from '@/constants/categories';
import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';
import { placeImages } from '@/data/placeImages';
import type { Place } from '@/types/place';
import { formatDistance } from '@/utils/distance';

interface PlaceCardProps {
  place: Place;
  distanceMeters?: number; // opcional: só aparece quando sabemos onde o usuário está
  onPress?: () => void;
}

export function PlaceCard({ place, distanceMeters, onPress }: PlaceCardProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const category = getCategoryInfo(place.category);
  const categoryColor = colors[category.key];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        Shadow.card,
        { backgroundColor: colors.card, opacity: pressed ? 0.9 : 1 },
      ]}>
      <Image source={placeImages[place.image]} style={styles.image} resizeMode="cover" />

      <View style={styles.info}>
        <View style={[styles.badge, { backgroundColor: categoryColor }]}>
          <Text style={styles.badgeText}>
            {category.emoji} {category.singular}
          </Text>
        </View>

        <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
          {place.name}
        </Text>

        {distanceMeters !== undefined && (
          <Text style={[styles.distance, { color: colors.textSecondary }]}>
            📍 {formatDistance(distanceMeters)} de você
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 240,
    borderRadius: Radius.large,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150,
  },
  info: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
  },
  distance: {
    fontSize: 13,
  },
});