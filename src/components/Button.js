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
  ...props
}) {
  const variantStyle = BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.primary;
  return (
    <Pressable
      android_ripple={getRipple('rgba(255,255,255,0.15)')}
      style={({ pressed }) => [
        BUTTON_BASE,
        variantStyle,
        (pressed || loading) && { opacity: 0.96 },
        disabled && { opacity: 0.6 },
        style,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'light' ? '#111827' : '#ffffff'} />
      ) : children ? (
        children
      ) : (
        <Text style={[TEXT_BUTTON, textStyle]}>{title}</Text>
      )}
    </Pressable>
  );
}
