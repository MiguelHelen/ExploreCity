/**
 * Tela "Guia": a visita guiada do ExploreCity.
 * Mostra o progresso (lugares descobertos), as configurações dos alertas
 * de proximidade e as ferramentas de teste.
 */

import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
    useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getCategoryInfo } from '@/constants/categories';
import { RADIUS_OPTIONS } from '@/constants/proximity';
import { BottomTabInset, Colors, Radius, Shadow, Spacing } from '@/constants/theme';
import { places } from '@/data/places';
import { useUserLocation } from '@/services/location-context';
import { useProximity } from '@/services/proximity-context';
import { formatDistance } from '@/utils/distance';
import { sortByDistance, type PlaceWithDistance } from '@/utils/nearby';

export default function GuideScreen() {
  const router = useRouter();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const { coords } = useUserLocation();
  const { enabled, setEnabled, radius, setRadius, notified, permission, askPermission, resetVisit, sendTest } =
    useProximity();

  // Todos os lugares, do mais perto para o mais longe (se tivermos GPS).
  const list: PlaceWithDistance[] = useMemo(
    () => (coords ? sortByDistance(coords) : places.map((place) => ({ place }))),
    [coords]
  );

  const discovered = places.filter((place) => notified[place.id]).length;
  const progress = places.length > 0 ? discovered / places.length : 0;

  const handleTest = async () => {
    try {
      const sent = await sendTest();
      if (!sent) {
        Alert.alert('Notificações bloqueadas', 'Permita as notificações para o ExploreCity primeiro.');
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível enviar a notificação de teste.');
    }
  };

  const handleReset = () => {
    Alert.alert('Reiniciar visita', 'Todos os lugares voltam a poder enviar notificações. Continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Reiniciar', style: 'destructive', onPress: resetVisit },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: BottomTabInset + Spacing.four }}
        showsVerticalScrollIndicator={false}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={[styles.brand, { color: colors.primary }]}>Visita guiada</Text>
          <Text style={[styles.title, { color: colors.text }]}>Descubra a cidade andando</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Quando você chegar perto de um lugar, o ExploreCity avisa e conta uma curiosidade.
          </Text>
        </View>

        {/* Progresso */}
        <View style={[styles.card, Shadow.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            🧭 {discovered} de {places.length} lugares descobertos
          </Text>
          <View style={[styles.progressTrack, { backgroundColor: colors.backgroundSelected }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: colors.accent, width: `${Math.round(progress * 100)}%` },
              ]}
            />
          </View>
        </View>

        {/* Aviso: permissão de notificações */}
        {permission !== 'granted' && (
          <Pressable
            onPress={askPermission}
            style={[styles.warning, { backgroundColor: colors.backgroundElement }]}>
            <Text style={[styles.warningText, { color: colors.text }]}>
              🔔 As notificações estão desligadas. Toque aqui para permitir. Se a janela não aparecer,
              ative em Configurações do celular → Apps → Expo Go → Notificações.
            </Text>
          </Pressable>
        )}

        {/* Configurações */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Alertas de proximidade</Text>
        <View style={[styles.card, Shadow.card, { backgroundColor: colors.card }]}>
          <View style={styles.switchRow}>
            <View style={styles.switchTexts}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Avisar quando eu chegar perto</Text>
              <Text style={[styles.smallText, { color: colors.textSecondary }]}>
                Funciona com o app aberto.
              </Text>
            </View>
            <Switch
              value={enabled}
              onValueChange={setEnabled}
              trackColor={{ true: colors.primary, false: colors.backgroundSelected }}
              thumbColor="#FFFFFF"
            />
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>Raio de proximidade</Text>
          <View style={styles.radiusRow}>
            {RADIUS_OPTIONS.map((option) => {
              const active = radius === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => setRadius(option)}
                  style={[
                    styles.radiusChip,
                    { backgroundColor: active ? colors.primary : colors.backgroundElement },
                  ]}>
                  <Text style={[styles.radiusText, { color: active ? '#FFFFFF' : colors.text }]}>
                    {formatDistance(option)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Lista da visita */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Roteiro</Text>
        <View style={styles.list}>
          {list.map(({ place, distance }) => {
            const category = getCategoryInfo(place.category);
            const visited = Boolean(notified[place.id]);
            const inRange = distance !== undefined && distance <= radius;
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
                  <Text
                    style={[
                      styles.rowInfo,
                      { color: inRange ? colors.accent : colors.textSecondary },
                    ]}>
                    {inRange ? '📍 Dentro do raio' : distance !== undefined ? `${formatDistance(distance)} de você` : category.singular}
                  </Text>
                </View>
                <Text style={styles.rowStatus}>{visited ? '✅' : '○'}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Ferramentas de teste */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Ferramentas de teste</Text>
        <View style={[styles.card, Shadow.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.smallText, { color: colors.textSecondary }]}>Sua posição atual:</Text>
          <Text selectable style={[styles.coords, { color: colors.text }]}>
            {coords ? `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}` : 'Procurando o GPS...'}
          </Text>

          <Pressable
            onPress={handleTest}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 },
            ]}>
            <Text style={styles.buttonText}>🔔 Enviar notificação de teste</Text>
          </Pressable>

          <Pressable
            onPress={handleReset}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: colors.backgroundElement, opacity: pressed ? 0.9 : 1 },
            ]}>
            <Text style={[styles.buttonText, { color: colors.text }]}>↺ Reiniciar visita</Text>
          </Pressable>
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
  brand: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: Spacing.five,
    marginBottom: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  card: {
    marginHorizontal: Spacing.four,
    marginTop: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.large,
    gap: Spacing.two + 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  smallText: {
    fontSize: 13,
  },
  progressTrack: {
    height: 10,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.pill,
  },
  warning: {
    marginHorizontal: Spacing.four,
    marginTop: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.medium,
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  switchTexts: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: Spacing.two,
  },
  radiusRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  radiusChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two + 2,
    borderRadius: Radius.pill,
  },
  radiusText: {
    fontSize: 14,
    fontWeight: '800',
  },
  list: {
    gap: Spacing.two + 2,
    paddingHorizontal: Spacing.four,
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
    fontWeight: '600',
  },
  rowStatus: {
    fontSize: 18,
  },
  coords: {
    fontSize: 15,
    fontWeight: '700',
  },
  button: {
    paddingVertical: Spacing.three,
    borderRadius: Radius.pill,
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});