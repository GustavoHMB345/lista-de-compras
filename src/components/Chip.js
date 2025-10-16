import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import {
  CHIP_ACTIVE as STATIC_CHIP_ACTIVE,
  CHIP_BASE as STATIC_CHIP_BASE,
  CHIP_TEXT as STATIC_CHIP_TEXT,
  CHIP_TEXT_ACTIVE as STATIC_CHIP_TEXT_ACTIVE,
  buildChipTokens,
  getRipple,
} from '../styles/theme';

export default function Chip({
  label,
  emoji,
  active,
  onPress,
  style,
  textStyle,
  children,
  accessibilityLabel,
  accessibilityRole,
  testID,
  ...rest
}) {
  const theme = useColorScheme?.() ?? 'light';
  const { CHIP_BASE, CHIP_ACTIVE, CHIP_TEXT, CHIP_TEXT_ACTIVE } = buildChipTokens(
    Colors?.[theme] || {},
  );
  // Compute effective background to choose contrasting text color
  const isLightColor = (c) => {
    if (!c || typeof c !== 'string') return false;
    let r, g, b;
    if (c.startsWith('#')) {
      const hex = c.replace('#', '');
      if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
      } else if (hex.length === 6) {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
      }
    } else if (c.startsWith('rgb')) {
      const m = c.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
      if (m) {
        r = parseInt(m[1], 10);
        g = parseInt(m[2], 10);
        b = parseInt(m[3], 10);
      }
    }
    if ([r, g, b].some((v) => typeof v !== 'number' || Number.isNaN(v))) return false;
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.7;
  };

  const baseStyle = CHIP_BASE || STATIC_CHIP_BASE;
  const activeStyle = active ? CHIP_ACTIVE || STATIC_CHIP_ACTIVE : null;
  const flattened = StyleSheet.flatten([baseStyle, activeStyle, style]) || {};
  const effectiveBg = flattened.backgroundColor;
  const computedLabelColor = isLightColor(effectiveBg) ? '#111827' : '#ffffff';
  return (
    <Pressable
      onPress={onPress}
      android_ripple={getRipple('rgba(37,99,235,0.18)')}
      style={({ pressed }) => [
        baseStyle,
        active && (activeStyle || STATIC_CHIP_ACTIVE),
        pressed && { opacity: 0.9 },
        style,
      ]}
      accessibilityRole={accessibilityRole || 'button'}
      accessibilityLabel={accessibilityLabel || label}
      testID={testID}
      {...rest}
    >
      {emoji ? (
        <Text
          style={[
            { fontSize: 12 },
            active && (CHIP_TEXT_ACTIVE || STATIC_CHIP_TEXT_ACTIVE),
            { color: computedLabelColor },
          ]}
          maxFontSizeMultiplier={1.2}
        >
          {emoji}
        </Text>
      ) : null}
      {children ? (
        children
      ) : (
        <Text
          style={[
            CHIP_TEXT || STATIC_CHIP_TEXT,
            active && (CHIP_TEXT_ACTIVE || STATIC_CHIP_TEXT_ACTIVE),
            { color: computedLabelColor },
            textStyle,
          ]}
          maxFontSizeMultiplier={1.2}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
