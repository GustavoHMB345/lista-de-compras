import { useContext } from 'react';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { DataContext } from '../contexts/DataContext';

export function useAppTheme() {
  // Call hooks unconditionally to satisfy rules-of-hooks
  const schemeHook = useColorScheme();
  const ctx = useContext(DataContext);
  const prefTheme = ctx?.uiPrefs?.theme; // 'light' | 'dark' | undefined
  const scheme = prefTheme === 'dark' || prefTheme === 'light' ? prefTheme : schemeHook || 'light';
  const T = Colors?.[scheme] || Colors.light;
  const palette = {
    bg: T.background,
    card: scheme === 'dark' ? '#1B1F22' : '#FFFFFF',
    text: T.text,
    mutedText: scheme === 'dark' ? '#9BA1A6' : '#6B7280',
    border: scheme === 'dark' ? '#2A2F35' : '#E5E7EB',
    primary: T.tint || '#2563EB',
    success: '#16A34A',
    danger: '#DC2626',
    warning: '#F59E0B',
    altSurface: scheme === 'dark' ? '#1F2428' : '#F3F4F6',
    snackbarBg: scheme === 'dark' ? '#0B0D0E' : '#111827',
    tooltipBg: scheme === 'dark' ? '#0B0D0E' : '#1F2937',
  };
  return { scheme, themeColors: T, palette };
}
