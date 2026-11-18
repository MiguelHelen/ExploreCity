import { StyleSheet, View } from 'react-native';

import { MapFallback } from '@/components/map-fallback';
import MapScreen from '@/components/map-screen';
import { mapsAvailable } from '@/utils/maps';

export default function MapRoute() {
  if (mapsAvailable) return <MapScreen />;

  return (
    <View style={styles.container}>
      <MapFallback />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});