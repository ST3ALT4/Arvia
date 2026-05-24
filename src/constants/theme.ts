/**
 * ARVIA — Market Intelligence Dashboard Theme
 * Dark-mode financial terminal aesthetic
 */

import '@/global.css';

import { Platform } from 'react-native';

export const ArviaPalette = {
  bg: '#060a10',
  bg2: '#0b1220',
  bg3: '#101828',
  border: 'rgba(255,255,255,0.07)',
  gold: '#f0b429',
  gold2: '#ffd166',
  cyan: '#06d6a0',
  red: '#ef4444',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  text: '#e2e8f0',
  muted: '#64748b',
  card: 'rgba(255,255,255,0.03)',
  cardSolid: '#0d1526',
} as const;

export const Colors = {
  light: {
    text: ArviaPalette.text,
    background: ArviaPalette.bg,
    backgroundElement: ArviaPalette.bg2,
    backgroundSelected: ArviaPalette.bg3,
    textSecondary: ArviaPalette.muted,
  },
  dark: {
    text: ArviaPalette.text,
    background: ArviaPalette.bg,
    backgroundElement: ArviaPalette.bg2,
    backgroundSelected: ArviaPalette.bg3,
    textSecondary: ArviaPalette.muted,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "'DM Sans', var(--font-display)",
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: "'Space Mono', var(--font-mono)",
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

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 1200;
