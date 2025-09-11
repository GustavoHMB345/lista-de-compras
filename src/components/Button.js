import { Pressable, Text } from 'react-native';
import { BUTTON_BASE, BUTTON_VARIANTS, TEXT_BUTTON, getRipple } from '../styles/theme';

export default function Button({ variant = 'primary', title, style, textStyle, children, ...props }) {
  const variantStyle = BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.primary;
  return (
    <Pressable
      android_ripple={getRipple('rgba(255,255,255,0.15)')}
      style={({ pressed }) => [BUTTON_BASE, variantStyle, pressed && { opacity: 0.96 }, style]}
      {...props}
    >
      {children ? children : <Text style={[TEXT_BUTTON, textStyle]}>{title}</Text>}
    </Pressable>
  );
}
