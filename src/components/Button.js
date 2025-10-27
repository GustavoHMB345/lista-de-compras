import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import {
    buildButtonTokens,
    BUTTON_BASE,
    getRipple,
    GRADIENTS,
    BUTTON_VARIANTS as STATIC_BUTTON_VARIANTS,
    TEXT_BUTTON as STATIC_TEXT_BUTTON,
} from '../styles/theme';
import { useTheme } from './theme';

export default function Button({
  variant = 'primary',
  title,
  style,
  textStyle,
  children,
  loading,
  disabled,
  accessibilityLabel,
  accessibilityRole,
  testID,
  withGradient = false,
  gradientPreset,
  gradientColors,
  ...props
}) {
  const { colors: themeColors } = useTheme();
  const { BUTTON_VARIANTS, TEXT_BUTTON } = buildButtonTokens(themeColors || {});
  const variantStyle =
    BUTTON_VARIANTS[variant] ||
    BUTTON_VARIANTS.primary ||
    STATIC_BUTTON_VARIANTS[variant] ||
    STATIC_BUTTON_VARIANTS.primary;

  // Helper: detect if a color is light (for contrast)
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
    // Perceived luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.7; // treat very light backgrounds as light
  };

  const flattened = StyleSheet.flatten(style) || {};
  let effectiveBg = flattened.backgroundColor ?? variantStyle?.backgroundColor;
  // Some callers set transparent or leave undefined; derive from theme in those cases
  if (!effectiveBg || effectiveBg === 'transparent') {
    if (variant === 'light') {
      effectiveBg = (themeColors && themeColors.background) || '#ffffff';
    } else {
      effectiveBg = (themeColors && themeColors.tint) || '#2563EB';
    }
  }
  // Default: white text; if light variant or light bg, use dark text
  const computedLabelColor = variant === 'light' || isLightColor(effectiveBg) ? '#111827' : '#fff';

  const labelStyle = [TEXT_BUTTON || STATIC_TEXT_BUTTON, { color: computedLabelColor }, textStyle];
  const rippleColor =
    variant === 'light' || isLightColor(effectiveBg)
      ? 'rgba(0,0,0,0.08)'
      : 'rgba(255,255,255,0.15)';
  const content = loading ? (
    <ActivityIndicator color={computedLabelColor} />
  ) : children ? (
    children
  ) : (
    <Text style={labelStyle} maxFontSizeMultiplier={1.2}>
      {title}
    </Text>
  );

  // Resolve gradient colors if requested
  const resolvedGradient =
    withGradient && (gradientColors || (gradientPreset && GRADIENTS[gradientPreset]));

  // When using gradient, we render a wrapper with overflow hidden and an absolute gradient
  if (resolvedGradient) {
    return (
      <Pressable
        android_ripple={getRipple('rgba(255,255,255,0.15)')}
        style={({ pressed }) => [
          BUTTON_BASE,
          // Provide a fallback colored bg based on variant for when gradient isn't visible (android ripple)
          variantStyle,
          { overflow: 'hidden' },
          (pressed || loading) && { opacity: 0.98 },
          disabled && { opacity: 0.6 },
          style,
        ]}
        disabled={disabled || loading}
        accessibilityRole={accessibilityRole || 'button'}
        accessibilityLabel={accessibilityLabel || title}
        testID={testID}
        {...props}
      >
        <LinearGradient
          colors={resolvedGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {content}
      </Pressable>
    );
  }

  // Default non-gradient button
  return (
    <Pressable
      android_ripple={getRipple(rippleColor)}
      style={({ pressed }) => [
        BUTTON_BASE,
        variantStyle,
        (pressed || loading) && { opacity: 0.96 },
        disabled && { opacity: 0.6 },
        style,
      ]}
      disabled={disabled || loading}
      accessibilityRole={accessibilityRole || 'button'}
      accessibilityLabel={accessibilityLabel || title}
      testID={testID}
      {...props}
    >
      {content}
    </Pressable>
  );
}
