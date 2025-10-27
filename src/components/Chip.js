import { Pressable, StyleSheet, Text } from 'react-native';
import { Colors } from '../../constants/Colors';
import {
  CHIP_ACTIVE as STATIC_CHIP_ACTIVE,
  CHIP_BASE as STATIC_CHIP_BASE,
  CHIP_TEXT as STATIC_CHIP_TEXT,
  CHIP_TEXT_ACTIVE as STATIC_CHIP_TEXT_ACTIVE,
  buildChipTokens,
  getRipple,
} from '../styles/theme';
import { useTheme } from './theme';

export default function Chip({
  label,
  emoji,
  active,
  onPress,
  style,
  textStyle,
  count,
  countContainerStyle,
  countTextStyle,
  children,
  accessibilityLabel,
  accessibilityRole,
  testID,
  ...rest
}) {
  // Use app ThemeProvider for consistent scheme across the app (avoids mismatch with system scheme)
  const { scheme } = useTheme?.() || { scheme: 'light' };
  const { CHIP_BASE, CHIP_ACTIVE, CHIP_TEXT, CHIP_TEXT_ACTIVE } = buildChipTokens(
    Colors?.[scheme] || {},
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
  // Fallbacks for responsiveness and touch target when theme doesn't define them
  const fallbackChipStyle = {};
  if (flattened.minHeight == null) fallbackChipStyle.minHeight = 40;
  if (flattened.paddingHorizontal == null) fallbackChipStyle.paddingHorizontal = 12;
  if (flattened.paddingVertical == null) fallbackChipStyle.paddingVertical = 8;
  if (flattened.borderRadius == null) fallbackChipStyle.borderRadius = 999;
  if (flattened.alignItems == null) fallbackChipStyle.alignItems = 'center';
  if (flattened.flexDirection == null) fallbackChipStyle.flexDirection = 'row';
  const effectiveBg = flattened.backgroundColor;
  const computedLabelColor = isLightColor(effectiveBg) ? '#111827' : '#ffffff';
  // Badge styles derived from background brightness (works for both active/inactive)
  const bgIsLight = isLightColor(effectiveBg);
  const badgeBg = bgIsLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.18)';
  const badgeTextColor = bgIsLight ? '#1F2937' : '#ECEDEE';
  // Adaptive ripple color to avoid odd tints on different backgrounds
  const rippleColor = (() => {
    // When background is light (e.g., white active chip in dark theme), use a subtle dark ripple
    // When background is dark (e.g., black base in dark theme or blue active in light), use a subtle light ripple
    if (isLightColor((StyleSheet.flatten([baseStyle, active && activeStyle]) || {}).backgroundColor)) {
      return 'rgba(0,0,0,0.08)';
    }
    return 'rgba(255,255,255,0.16)';
  })();

  return (
    <Pressable
      onPress={onPress}
      android_ripple={getRipple(rippleColor)}
      style={({ pressed }) => [
        baseStyle,
        active && (activeStyle || STATIC_CHIP_ACTIVE),
        // Avoid whitening the chip on press; use a subtle scale instead of opacity
        pressed && { transform: [{ scale: 0.98 }] },
        fallbackChipStyle,
        style,
      ]}
      accessibilityRole={accessibilityRole || 'button'}
      accessibilityLabel={accessibilityLabel || label}
      testID={testID}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      {...rest}
    >
      {emoji ? (
        <Text
          style={[
            { fontSize: 12, marginRight: 8 },
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
        <>
          <Text
            style={[
              CHIP_TEXT || STATIC_CHIP_TEXT,
              active && (CHIP_TEXT_ACTIVE || STATIC_CHIP_TEXT_ACTIVE),
              { color: computedLabelColor },
              textStyle,
            ]}
            maxFontSizeMultiplier={1.2}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {label}
          </Text>
          {typeof count !== 'undefined' && count !== null && (
            <Text
              style={[
                {
                  marginLeft: 10,
                  backgroundColor: badgeBg,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 999,
                  fontSize: 12,
                  color: badgeTextColor,
                  textAlignVertical: 'center',
                  includeFontPadding: false,
                },
                countTextStyle,
              ]}
              maxFontSizeMultiplier={1.2}
            >
              {String(count)}
            </Text>
          )}
        </>
      )}
    </Pressable>
  );
}
