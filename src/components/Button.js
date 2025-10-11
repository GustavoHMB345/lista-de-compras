import { ActivityIndicator, Pressable, Text } from 'react-native';
import { BUTTON_BASE, BUTTON_VARIANTS, TEXT_BUTTON, getRipple } from '../styles/theme';

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
  const variantStyle = BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.primary;
  const labelStyle = [
    TEXT_BUTTON,
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
        <Text style={labelStyle}>{title}</Text>
      )}
    </Pressable>
  );
}
