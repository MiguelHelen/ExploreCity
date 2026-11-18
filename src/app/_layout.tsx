/**
 * Layout geral do ExploreCity.
 * Usa uma pilha (Stack): o grupo "(tabs)" é a base do app (Home, Mapa e Guia),
 * e telas como a de detalhes abrem por cima dele.
 * Os provedores envolvem tudo, para todas as telas terem acesso ao GPS
 * e às notificações de proximidade. O WidgetSync mantém o widget atualizado.
 */

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold, Poppins_800ExtraBold } from '@expo-google-fonts/poppins';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { WidgetSync } from '@/components/widget-sync';
import { LocationProvider } from '@/services/location-context';
import { ProximityProvider } from '@/services/proximity-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  const [fontsLoaded] = useFonts({
    Poppins_400Regular, 
    Poppins_500Medium, 
    Poppins_700Bold, 
    Poppins_800ExtraBold
  });

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <LocationProvider>
        <ProximityProvider>
          <WidgetSync />
          <AnimatedSplashOverlay />
          <Stack screenOptions={{ headerShown: false }} />
        </ProximityProvider>
      </LocationProvider>
    </ThemeProvider>
  );
}