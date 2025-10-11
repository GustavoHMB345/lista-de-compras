import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  edgeActivationWidth, // px a partir das bordas (se não informado, calcula responsivo)
  velocityThreshold = 0.25, // velocidade mínima para aceitar swipe
  dragFactor = 0.35, // intensidade da tradução durante o arraste
  enabled = true,
  allowSwipeLeft = true,
  allowSwipeRight = true,
  edgeFrom = 'both', // 'both' | 'left' | 'right'
  verticalTolerance = 18, // delta vertical máximo para considerar gesto horizontal
  multiTouchCancel = true, // cancela se mais de um toque estiver ativo
  onSwipeStart, // callback ao começar um swipe válido
  onSwipeProgress, // callback contínuo com valor normalizado (-1..1)
  onSwipeCancel, // callback quando gesto é cancelado/terminado sem navegação
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [winWidth, setWinWidth] = useState(Dimensions.get('window').width);
  const startXRef = useRef(0);
  const navigatingRef = useRef(false);

  // Atualiza largura em mudanças de orientação/dimensão
  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => {
      setWinWidth(window.width);
    });
    return () => {
      // RN >= 0.65 retorna objeto com remove(); em plataformas antigas pode retornar função
      if (typeof sub?.remove === 'function') sub.remove();
    };
  }, []);

  // Largura da borda adaptativa (~4% da largura, clamp 16-40) se não informado por prop
  const effectiveEdge =
    typeof edgeActivationWidth === 'number' && !Number.isNaN(edgeActivationWidth)
      ? edgeActivationWidth
      : Math.round(Math.min(40, Math.max(16, winWidth * 0.04)));

  const animateTo = useCallback(
    (toValue, config = {}) =>
      new Promise((resolve) => {
        Animated.spring(translateX, {
          toValue,
          useNativeDriver: true,
          friction: 8,
          tension: 90,
          ...config,
        }).start(() => resolve());
      }),
    [translateX],
  );

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponderCapture: (evt) => {
          const { locationX } = evt.nativeEvent;
          startXRef.current = locationX;
          return false; // não captura imediatamente
        },
        onMoveShouldSetPanResponder: (_, gesture) => {
          const { dx, dy, numberActiveTouches } = gesture;
          if (multiTouchCancel && numberActiveTouches > 1) return false;
          const leftEdge = startXRef.current <= effectiveEdge;
          const rightEdge = startXRef.current >= winWidth - effectiveEdge;
          const edgeOk =
            edgeFrom === 'both'
              ? leftEdge || rightEdge
              : edgeFrom === 'left'
                ? leftEdge
                : rightEdge;
          // Requer deslocamento horizontal suficiente, dentro da tolerância vertical.
          const horizontalIntent =
            Math.abs(dx) > 14 &&
            Math.abs(dx) > Math.abs(dy) * 1.15 &&
            Math.abs(dy) <= verticalTolerance;
          const dirOk = (dx < 0 && allowSwipeLeft) || (dx > 0 && allowSwipeRight);
          return edgeOk && horizontalIntent && dirOk;
        },
        onPanResponderMove: (_, gesture) => {
          let { dx } = gesture;
          // bloqueia direção não permitida
          if (dx < 0 && !allowSwipeLeft) dx = 0;
          if (dx > 0 && !allowSwipeRight) dx = 0;
          // resistência nas extremidades
          if (dx > 0 && isFirst) dx *= 0.25;
          if (dx < 0 && isLast) dx *= 0.25;
          translateX.setValue(dx * dragFactor);
          if (progress) {
            const normalized = Math.max(-1, Math.min(1, dx / winWidth));
            progress.setValue(normalized);
            onSwipeProgress && onSwipeProgress(normalized);
          }
        },
        onPanResponderRelease: async (_, gesture) => {
          const { dx, vx } = gesture;
          const fastEnough = Math.abs(vx) > velocityThreshold;
          const farEnoughLeft = dx < -threshold;
          const farEnoughRight = dx > threshold;
          const goLeft =
            (farEnoughLeft || (fastEnough && dx < 0)) && !isLast && !!onSwipeLeft && allowSwipeLeft;
          const goRight =
            (farEnoughRight || (fastEnough && dx > 0)) &&
            !isFirst &&
            !!onSwipeRight &&
            allowSwipeRight;

          if (!navigatingRef.current && (goLeft || goRight)) {
            onSwipeStart && onSwipeStart();
          }

          if (goLeft && !navigatingRef.current) {
            navigatingRef.current = true;
            await animateTo(-winWidth, { friction: 7, tension: 80 });
            onSwipeLeft && onSwipeLeft();
            translateX.setValue(0);
            progress && progress.setValue(0);
            setTimeout(() => (navigatingRef.current = false), 160);
            return;
          }

          if (goRight && !navigatingRef.current) {
            navigatingRef.current = true;
            await animateTo(winWidth, { friction: 7, tension: 80 });
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
          onSwipeCancel && onSwipeCancel();
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
          onSwipeCancel && onSwipeCancel();
        },
      }),
    [
      effectiveEdge,
      winWidth,
      isFirst,
      isLast,
      threshold,
      onSwipeLeft,
      onSwipeRight,
      velocityThreshold,
      dragFactor,
      progress,
      allowSwipeLeft,
      allowSwipeRight,
      edgeFrom,
      animateTo,
      translateX,
      verticalTolerance,
      multiTouchCancel,
      onSwipeCancel,
      onSwipeProgress,
      onSwipeStart,
    ],
  );

  // Parallax: escala e opacidade variam levemente conforme o arraste
  const scale = parallax
    ? translateX.interpolate({
        inputRange: [-winWidth, 0, winWidth],
        outputRange: [1 - reduceScale, 1, 1 - reduceScale],
        extrapolate: 'clamp',
      })
    : 1;

  const opacity = parallax
    ? translateX.interpolate({
        inputRange: [-winWidth, 0, winWidth],
        outputRange: [1 - reduceOpacity, 1, 1 - reduceOpacity],
        extrapolate: 'clamp',
      })
    : 1;

  return (
    <Animated.View
      style={{ flex: 1, opacity, transform: [{ translateX }, { scale }] }}
      {...(enabled ? responder.panHandlers : {})}
    >
      {children}
    </Animated.View>
  );
}
