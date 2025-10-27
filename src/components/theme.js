import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { Appearance } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

const STORAGE_KEY = 'ui.themeOverride'; // 'light' | 'dark' | 'system'
// Use a stable brand color for primary across schemes to ensure consistent contrast
const BRAND_PRIMARY = '#2563EB';
const ON_PRIMARY = '#FFFFFF';

function buildTokens(scheme) {
  const base = Colors?.[scheme] || Colors.light;
  return {
    background: base.background,
    text: base.text,
    primary: BRAND_PRIMARY,
    onPrimary: ON_PRIMARY,
    icon: base.icon || '#687076',
    card: scheme === 'dark' ? '#1B1F21' : '#FFFFFF',
    border: scheme === 'dark' ? '#2A2F33' : '#E5E7EB',
    muted: scheme === 'dark' ? '#9BA1A6' : '#6B7280',
    chipBg: scheme === 'dark' ? '#2A2F33' : '#F3F4F6',
    inputBg: scheme === 'dark' ? '#0F1214' : '#F9FAFB',
    success: '#16A34A',
    danger: '#EF4444',
  };
}

const ThemeCtx = React.createContext(null);

export function ThemeProvider({ children, initialOverride }) {
  const system = (typeof Appearance?.getColorScheme === 'function' ? Appearance.getColorScheme() : 'light') || 'light';
  const hookScheme = (typeof useColorScheme === 'function' ? useColorScheme() : system) || system;
  const [schemeOverride, setSchemeOverride] = React.useState(initialOverride || 'light');
  const [systemScheme, setSystemScheme] = React.useState(hookScheme || system);

  React.useEffect(() => {
    const sub = Appearance?.addChangeListener?.(({ colorScheme }) => {
      if (colorScheme) setSystemScheme(colorScheme);
    });
    return () => {
      try { sub?.remove?.(); } catch {}
    };
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setSchemeOverride(saved);
        }
      } catch {}
    })();
  }, []);

  const effectiveScheme = schemeOverride === 'light' || schemeOverride === 'dark'
    ? schemeOverride
    : (systemScheme || 'light');

  const colors = Colors?.[effectiveScheme] || Colors.light;
  const tokens = React.useMemo(() => buildTokens(effectiveScheme), [effectiveScheme]);

  const setTheme = React.useCallback(async (override) => {
    const val = (override === 'light' || override === 'dark') ? override : 'system';
    setSchemeOverride(val);
    try { await AsyncStorage.setItem(STORAGE_KEY, val); } catch {}
  }, []);

  const value = React.useMemo(() => ({
    scheme: effectiveScheme,
    colors,
    tokens,
    schemeOverride,
    setSchemeOverride: setTheme,
  }), [effectiveScheme, colors, tokens, schemeOverride, setTheme]);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const ctx = React.useContext(ThemeCtx);
  if (ctx) return ctx;
  const scheme = (typeof useColorScheme === 'function' ? useColorScheme() : 'light') || 'light';
  const colors = Colors?.[scheme] || Colors.light;
  const tokens = buildTokens(scheme);
  return { scheme, colors, tokens, schemeOverride: 'light', setSchemeOverride: () => {} };
}
