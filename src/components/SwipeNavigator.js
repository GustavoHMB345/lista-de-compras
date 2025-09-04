import React, { useMemo, useRef } from 'react';
import { Animated, Dimensions, PanResponder } from 'react-native';

// Detector de swipe horizontal com feedback animado, clamp nas bordas e debounce de navegação.
export default function SwipeNavigator({
  children,
  onSwipeLeft,
  onSwipeRight,
  threshold = 60,
  isFirst = false,
  isLast = false,
  parallax = true,
  reduceScale = 0.02, // reduz até 2%
  reduceOpacity = 0.04, // reduz até 4%
  progress, // Animated.Value opcional, normalizado -1..1
  edgeActivationWidth = 28, // px a partir das bordas
  velocityThreshold = 0.25, // velocidade mínima para aceitar swipe
  dragFactor = 0.35, // intensidade da tradução durante o arraste
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const width = Dimensions.get('window').width;
  const startXRef = useRef(0);
  const navigatingRef = useRef(false);

  const animateTo = (toValue, config = {}) =>
    new Promise((resolve) => {
      Animated.spring(translateX, {
        toValue,
        useNativeDriver: true,
        friction: 8,
        tension: 90,
        ...config,
      }).start(() => resolve());
    });

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponderCapture: (evt) => {
          const { locationX } = evt.nativeEvent;
          startXRef.current = locationX;
          return false; // não captura imediatamente
        },
        onMoveShouldSetPanResponder: (_, gesture) => {
          const { dx, dy } = gesture;
          const isEdge =
            startXRef.current <= edgeActivationWidth ||
            startXRef.current >= width - edgeActivationWidth;
          return isEdge && Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy);
        },
        onPanResponderMove: (_, gesture) => {
          let { dx } = gesture;
          // resistência nas extremidades
          if (dx > 0 && isFirst) dx *= 0.25;
          if (dx < 0 && isLast) dx *= 0.25;
          translateX.setValue(dx * dragFactor);
          if (progress) {
            const normalized = Math.max(-1, Math.min(1, dx / width));
            progress.setValue(normalized);
          }
        },
        onPanResponderRelease: async (_, gesture) => {
          const { dx, vx } = gesture;
          const fastEnough = Math.abs(vx) > velocityThreshold;
          const farEnoughLeft = dx < -threshold;
          const farEnoughRight = dx > threshold;
          const goLeft = (farEnoughLeft || (fastEnough && dx < 0)) && !isLast && !!onSwipeLeft;
          const goRight = (farEnoughRight || (fastEnough && dx > 0)) && !isFirst && !!onSwipeRight;

          if (goLeft && !navigatingRef.current) {
            navigatingRef.current = true;
            await animateTo(-width, { friction: 7, tension: 80 });
            onSwipeLeft && onSwipeLeft();
            translateX.setValue(0);
            progress && progress.setValue(0);
            setTimeout(() => (navigatingRef.current = false), 160);
            return;
          }

          if (goRight && !navigatingRef.current) {
            navigatingRef.current = true;
            await animateTo(width, { friction: 7, tension: 80 });
            onSwipeRight && onSwipeRight();
            translateX.setValue(0);
            progress && progress.setValue(0);
            setTimeout(() => (navigatingRef.current = false), 160);
            return;
          }

          // não navegou: volta ao lugar
          animateTo(0);
          progress &&
            Animated.spring(progress, {
              toValue: 0,
              useNativeDriver: true,
              friction: 7,
              tension: 80,
            }).start();
        },
        onPanResponderTerminate: () => {
          animateTo(0);
          progress &&
            Animated.spring(progress, {
              toValue: 0,
              useNativeDriver: true,
              friction: 7,
              tension: 80,
            }).start();
        },
      }),
    [edgeActivationWidth, width, isFirst, isLast, threshold, onSwipeLeft, onSwipeRight, velocityThreshold, dragFactor, progress]
  );

  // Parallax: escala e opacidade variam levemente conforme o arraste
  const scale = parallax
    ? translateX.interpolate({
        inputRange: [-width, 0, width],
        outputRange: [1 - reduceScale, 1, 1 - reduceScale],
        extrapolate: 'clamp',
      })
    : 1;

  const opacity = parallax
    ? translateX.interpolate({
        inputRange: [-width, 0, width],
        outputRange: [1 - reduceOpacity, 1, 1 - reduceOpacity],
        extrapolate: 'clamp',
      })
    : 1;

  return (
    <Animated.View style={{ flex: 1, opacity, transform: [{ translateX }, { scale }] }} {...responder.panHandlers}>
      {children}
    </Animated.View>
  );
}
