import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export default function PageDots({ total = 4, index = 0, style, elevated = true, fadeOnChange = true }) {
  const scales = useMemo(
    () => Array.from({ length: total }, (_, i) => new Animated.Value(i === index ? 1 : 0)),
    [total]
  );
  const containerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    scales.forEach((v, i) => {
      Animated.spring(v, {
        toValue: i === index ? 1 : 0,
        useNativeDriver: true,
        friction: 7,
        tension: 120,
      }).start();
    });
    if (fadeOnChange) {
      Animated.sequence([
        Animated.timing(containerOpacity, { toValue: 0.8, duration: 90, useNativeDriver: true }),
        Animated.timing(containerOpacity, { toValue: 1, duration: 120, useNativeDriver: true }),
      ]).start();
    }
  }, [index, scales]);

  return (
    <Animated.View
      style={[
        elevated ? styles.wrapElevated : null,
        { opacity: containerOpacity },
        style,
      ]}
      pointerEvents="none"
    >
      <View style={styles.container}>
        {Array.from({ length: total }).map((_, i) => {
          const scale = scales[i].interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.2] });
          const opacity = scales[i].interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
          const bg = i === index ? '#3B82F6' : '#D1D5DB';
          return (
            <Animated.View
              key={i}
              style={[styles.dot, { backgroundColor: bg, opacity, transform: [{ scale }] }]}
            />
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapElevated: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
    alignSelf: 'center',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
