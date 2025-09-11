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

// Base button container and label
export const BUTTON_BASE = {
  paddingVertical: 12,
  paddingHorizontal: 14,
  borderRadius: 12,
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
