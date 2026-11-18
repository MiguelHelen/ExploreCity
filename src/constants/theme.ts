/**
 * Tema visual do ExploreCity.
 */

// @ts-ignore - Ignora o aviso do TypeScript para a importação do CSS
import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#13262B',
    background: '#FAF7F2',
    backgroundElement: '#F1ECE3',
    backgroundSelected: '#E6DFD2',
    textSecondary: '#5F6B6F',
    primary: '#0F4C5C',
    accent: '#F28C28',
    card: '#FFFFFF',
    border: '#E8E1D5',
    museum: '#7B4FA3',
    park: '#2E9E5B',
    monument: '#D2693A',
  },
  dark: {
    text: '#F5F1EA',
    background: '#0B1A1F',
    backgroundElement: '#16292F',
    backgroundSelected: '#1F3840',
    textSecondary: '#A9B8BC',
    primary: '#4FB3C8',
    accent: '#F5A04A',
    card: '#13262C',
    border: '#233840',
    museum: '#B58BE0',
    park: '#5ACB8A',
    monument: '#F08A5D',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'Poppins_500Medium',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'Poppins_500Medium',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'Poppins_500Medium',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  small: 10,
  medium: 16,
  large: 24,
  pill: 999,
} as const;

export const Shadow = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;