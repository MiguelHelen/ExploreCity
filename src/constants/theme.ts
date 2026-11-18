/**
 * Tema visual do ExploreCity.
 * Aqui ficam as cores, fontes, espaçamentos, bordas e sombras do app.
 * Todas as telas leem os valores deste arquivo.
 */

import '@/global.css';

import { Platform } from 'react-native';

// Cores do app, em duas versões: modo claro (light) e modo escuro (dark).
export const Colors = {
  light: {
    text: '#13262B',
    background: '#FAF7F2', // fundo areia
    backgroundElement: '#F1ECE3',
    backgroundSelected: '#E6DFD2',
    textSecondary: '#5F6B6F',
    primary: '#0F4C5C', // azul-petróleo
    accent: '#F28C28', // laranja pôr do sol
    card: '#FFFFFF',
    border: '#E8E1D5',
    museum: '#7B4FA3', // roxo
    park: '#2E9E5B', // verde
    monument: '#D2693A', // terracota
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
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

// Espaçamentos padrão (em pixels).
export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

// Arredondamento das bordas: cards, botões e fotos.
export const Radius = {
  small: 10,
  medium: 16,
  large: 24,
  pill: 999,
} as const;

// Sombra discreta para os cards (funciona no Android e no iOS).
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