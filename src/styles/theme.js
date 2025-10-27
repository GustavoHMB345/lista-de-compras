// Centralized style tokens for buttons, chips, and feedback
import { Platform } from 'react-native';

export const colors = {
  primary: '#2563EB',
  primaryText: '#ffffff',
  secondary: '#6366F1',
  success: '#16A34A',
  danger: '#DC2626',
  warning: '#F59E0B',
  dark: '#111827',
  gray: '#6B7280',
  lightGray: '#E5E7EB',
  bg: '#ffffff',
  chipBg: '#F9FAFB',
  chipBorder: '#E5E7EB',
};

// Extended tokens
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };
export const radius = { sm: 8, md: 10, lg: 12, xl: 16, xxl: 22 };
export const shadows = {
  card: {
    shadowColor: '#0B0B0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 10,
    elevation: 7,
  },
  soft: {
    shadowColor: '#0B0B0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
};
export const zIndex = { tabBar: 60, modal: 100, snackbar: 120 };
export const typography = {
  h1: { fontSize: 22, fontWeight: '700', color: '#111827' },
  h2: { fontSize: 18, fontWeight: '700', color: '#111827' },
  body: { fontSize: 16, color: '#374151' },
  caption: { fontSize: 12, color: '#6B7280' },
};

// Gradient presets (start -> end). Keep colors bright and accessible.
export const GRADIENTS = {
  primary: ['#4F46E5', '#2563EB'],
  secondary: ['#8B5CF6', '#3B82F6'],
  success: ['#16A34A', '#22C55E'],
  danger: ['#DC2626', '#EF4444'],
  gray: ['#6B7280', '#4B5563'],
};

// Base button container and label
export const BUTTON_BASE = {
  paddingVertical: 12,
  paddingHorizontal: 14,
  borderRadius: radius.md,
  minHeight: 44,
  alignItems: 'center',
  justifyContent: 'center',
  alignSelf: 'center',
};

export const BUTTON_VARIANTS = {
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.secondary },
  success: { backgroundColor: colors.success },
  danger: { backgroundColor: colors.danger },
  dark: { backgroundColor: colors.dark },
  gray: { backgroundColor: colors.gray },
  light: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.lightGray },
};

export const TEXT_BUTTON = {
  color: colors.primaryText,
  fontWeight: '700',
  fontSize: 14,
};

// Chip tokens
export const CHIP_BASE = {
  borderWidth: 1,
  borderColor: colors.chipBorder,
  backgroundColor: colors.chipBg,
  paddingVertical: 10,
  paddingHorizontal: 12,
  borderRadius: 999,
  minHeight: 36,
  alignItems: 'center',
  justifyContent: 'center',
  alignSelf: 'flex-start',
  flexDirection: 'row',
  gap: 6,
};

export const CHIP_ACTIVE = {
  backgroundColor: colors.primary,
  borderColor: colors.primary,
};

export const CHIP_TEXT = {
  color: '#374151',
  fontWeight: '600',
  fontSize: 12,
};

export const CHIP_TEXT_ACTIVE = {
  color: '#ffffff',
};

// Android ripple helper
export const getRipple = (color = 'rgba(0,0,0,0.12)', borderless = false) =>
  Platform.OS === 'android' ? { color, borderless } : undefined;

export const breakpoints = { sm: 380, md: 720, lg: 1100 };

// Theme-aware builders (light/dark) using Colors.ts tokens
// themeColors shape expected: { text, background, tint, icon, tabIconDefault, tabIconSelected }
export const buildButtonTokens = (themeColors) => {
  const BUTTON_VARIANTS = {
    primary: { backgroundColor: themeColors?.tint || colors.primary },
    secondary: { backgroundColor: colors.secondary },
    success: { backgroundColor: colors.success },
    danger: { backgroundColor: colors.danger },
    dark: { backgroundColor: colors.dark },
    gray: { backgroundColor: colors.gray },
    // Keep light buttons visually light regardless of theme to avoid black pills on light cards
    light: {
      backgroundColor: colors.bg, // always white surface
      borderWidth: 1,
      borderColor: colors.lightGray,
    },
  };
  const TEXT_BUTTON = {
    color: '#ffffff', // keep white text for contrast on colored buttons
    fontWeight: '700',
    fontSize: 14,
  };
  return { BUTTON_VARIANTS, TEXT_BUTTON };
};

export const buildChipTokens = (themeColors) => {
  // Determine light/dark heuristically from the theme background
  const bg = (themeColors?.background || '').toLowerCase();
  const isDark = !!bg && bg !== '#fff' && bg !== '#ffffff';

  const CHIP_BASE = {
    borderWidth: 1,
    // Light: soft gray pill; Dark: solid black as requested
    borderColor: isDark ? '#2A2F33' : colors.chipBorder,
    backgroundColor: isDark ? '#000000' : colors.chipBg,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 6,
  };
  const CHIP_ACTIVE = {
    // Light: keep brand primary; Dark: invert to white with black text
    backgroundColor: isDark ? '#FFFFFF' : colors.primary,
    borderColor: isDark ? '#FFFFFF' : colors.primary,
  };
  const CHIP_TEXT = {
    // Light: dark text; Dark: light text (on black base)
    color: isDark ? '#FFFFFF' : '#111827',
    fontWeight: '600',
    fontSize: 12,
  };
  const CHIP_TEXT_ACTIVE = {
    // Light active (blue bg): white; Dark active (white bg): black
    color: isDark ? '#000000' : '#ffffff',
  };
  return { CHIP_BASE, CHIP_ACTIVE, CHIP_TEXT, CHIP_TEXT_ACTIVE };
};
