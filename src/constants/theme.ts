/**
 * Sport Movement — Design Tokens
 * Paleta de colores, tipografía y constantes globales del diseño.
 */

import { Platform } from 'react-native';

// ──────────────────────────────────────────────
//  Brand Colors
// ──────────────────────────────────────────────
export const BrandColors = {
  /** Fucsia/Rosa vibrante – barra inferior y acentos */
  pink: '#FF2D78',
  pinkLight: '#FF5FA0',
  pinkDark: '#D4005E',

  /** Púrpura – overlay de imágenes y cards */
  purple: '#4B1FA8',
  purpleLight: '#6B3FC4',
  purpleDark: '#2E0A7A',
  purpleOverlay: 'rgba(75, 31, 168, 0.55)',

  /** Neutros */
  white: '#FFFFFF',
  offWhite: '#F5F5F7',
  black: '#0A0A0A',
  darkGray: '#1C1C1E',
  mediumGray: '#636366',
  lightGray: '#E5E5EA',
};

// ──────────────────────────────────────────────
//  Backwards-compat export (used by original layout)
// ──────────────────────────────────────────────
const tintColorLight = BrandColors.pink;
const tintColorDark = BrandColors.white;

export const Colors = {
  light: {
    text: BrandColors.black,
    background: BrandColors.white,
    tint: tintColorLight,
    icon: BrandColors.mediumGray,
    tabIconDefault: BrandColors.mediumGray,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

// ──────────────────────────────────────────────
//  Typography
// ──────────────────────────────────────────────
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
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// ──────────────────────────────────────────────
//  Spacing & Layout
// ──────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
};
