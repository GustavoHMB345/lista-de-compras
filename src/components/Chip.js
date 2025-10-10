import React from 'react';
import { Pressable, Text } from 'react-native';
import { CHIP_ACTIVE, CHIP_BASE, CHIP_TEXT, CHIP_TEXT_ACTIVE, getRipple } from '../styles/theme';

export default function Chip({
  label,
  emoji,
  active,
  onPress,
  style,
  textStyle,
  children,
  ...rest
}) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={getRipple('rgba(37,99,235,0.18)')}
      style={({ pressed }) => [
        CHIP_BASE,
        active && CHIP_ACTIVE,
        pressed && { opacity: 0.9 },
        style,
      ]}
      {...rest}
    >
      {emoji ? <Text style={[{ fontSize: 12 }, active && CHIP_TEXT_ACTIVE]}>{emoji}</Text> : null}
      {children ? (
        children
      ) : (
        <Text style={[CHIP_TEXT, active && CHIP_TEXT_ACTIVE, textStyle]}>{label}</Text>
      )}
    </Pressable>
  );
}
