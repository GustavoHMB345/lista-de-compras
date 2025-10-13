import React from 'react';
import { Pressable, Text } from 'react-native';
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
  return (
    <Pressable
      onPress={onPress}
      android_ripple={getRipple('rgba(37,99,235,0.18)')}
      style={({ pressed }) => [
        CHIP_BASE || STATIC_CHIP_BASE,
        active && (CHIP_ACTIVE || STATIC_CHIP_ACTIVE),
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
          style={[{ fontSize: 12 }, active && (CHIP_TEXT_ACTIVE || STATIC_CHIP_TEXT_ACTIVE)]}
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
