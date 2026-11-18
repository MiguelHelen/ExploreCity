/**
 * Tela de detalhes de um ponto turístico.
 * Recebe o id pelo endereço (/place/masp) e mostra foto, categoria,
 * distância até o usuário, descrição histórica e curiosidade.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getCategoryInfo } from '@/constants/categories';
import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';
import { placeImages } from '@/data/placeImages';
import { getPlaceById } from '@/data/places';
import { useUserLocation } from '@/services/location-context';
import { formatDistance } from '@/utils/distance';
import { distanceToPlace } from '@/utils/nearby';

export default function PlaceDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const { coords } = useUserLocation();

  const place = getPlaceById(id);

  // Se o id não existir no JSON, mostramos uma mensagem em vez de quebrar o app.
  if (!place) {
    return (
      <SafeAreaView style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFound, { color: colors.text }]}>Lugar não encontrado.</Text>
        <Pressable onPress={() => router.back()} style={[styles.button, { backgroundColor: colors.primary }]}>
          <Text style={styles.buttonText}>Voltar</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const category = getCategoryInfo(place.category);
  const categoryColor = colors[category.key];
  const distance = coords ? distanceToPlace(coords, place) : undefined;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Foto grande com botão de voltar por cima */}
        <View>
          <Image source={placeImages[place.image]} style={styles.heroImage} resizeMode="cover" />
          <SafeAreaView edges={['top']} style={styles.backWrapper}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.8 : 1 }]}>
              <Text style={styles.backText}>←</Text>
            </Pressable>
          </SafeAreaView>
        </View>

        {/* Conteúdo: sobe um pouco sobre a foto, com cantos arredondados */}
        <View style={[styles.content, { backgroundColor: colors.background }]}>
          <View style={[styles.badge, { backgroundColor: categoryColor }]}>
            <Text style={styles.badgeText}>
              {category.emoji} {category.singular}
            </Text>
          </View>

          <Text style={[styles.name, { color: colors.text }]}>{place.name}</Text>

          {distance !== undefined && (
            <Text style={[styles.distance, { color: colors.textSecondary }]}>
              📍 {formatDistance(distance)} de você
            </Text>
          )}

          <Text style={[styles.sectionTitle, { color: colors.text }]}>História</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>{place.description}</Text>

          <View style={[styles.curiosityCard, Shadow.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.curiosityTitle, { color: colors.accent }]}>💡 Você sabia?</Text>
            <Text style={[styles.curiosityText, { color: colors.text }]}>{place.curiosity}</Text>
          </View>

          <Pressable
            onPress={() =>
              router.navigate({
                pathname: '/map',
                params: { placeId: place.id, t: String(Date.now()) },
              })
            }
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 },
            ]}>
            <Text style={styles.buttonText}>🗺️  Ver no mapa</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  notFound: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: Spacing.six,
  },
  heroImage: {
    width: '100%',
    height: 320,
  },
  backWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  content: {
    marginTop: -Spacing.four,
    borderTopLeftRadius: Radius.large,
    borderTopRightRadius: Radius.large,
    padding: Spacing.four,
    gap: Spacing.three,
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
  name: {
    fontSize: 28,
    fontWeight: '800',
  },
  distance: {
    fontSize: 15,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: Spacing.two,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  curiosityCard: {
    padding: Spacing.three,
    borderRadius: Radius.medium,
    gap: Spacing.two,
  },
  curiosityTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  curiosityText: {
    fontSize: 15,
    lineHeight: 22,
  },
  button: {
    marginTop: Spacing.three,
    paddingVertical: Spacing.three + 2,
    borderRadius: Radius.pill,
    alignItems: 'center',
    paddingHorizontal: Spacing.five,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});