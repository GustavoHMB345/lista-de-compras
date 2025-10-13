import { ActivityIndicator, Pressable, Text } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import {
  BUTTON_BASE,
  BUTTON_VARIANTS as STATIC_BUTTON_VARIANTS,
  TEXT_BUTTON as STATIC_TEXT_BUTTON,
  buildButtonTokens,
  getRipple,
} from '../styles/theme';

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
  ...props
}) {
  const theme = useColorScheme?.() ?? 'light';
  const { BUTTON_VARIANTS, TEXT_BUTTON } = buildButtonTokens(Colors?.[theme] || {});
  const variantStyle =
    BUTTON_VARIANTS[variant] ||
    BUTTON_VARIANTS.primary ||
    STATIC_BUTTON_VARIANTS[variant] ||
    STATIC_BUTTON_VARIANTS.primary;
  const labelStyle = [
    TEXT_BUTTON || STATIC_TEXT_BUTTON,
    // Texto escuro em botões "light" (fundo branco)
    variant === 'light' && { color: '#111827' },
    textStyle,
  ];
  const rippleColor = variant === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.15)';
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
      {loading ? (
        <ActivityIndicator color={variant === 'light' ? '#111827' : '#ffffff'} />
      ) : children ? (
        children
      ) : (
        <Text style={labelStyle} maxFontSizeMultiplier={1.2}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}
