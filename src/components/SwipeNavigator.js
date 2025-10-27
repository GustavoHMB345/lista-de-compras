import { LinearGradient } from 'expo-linear-gradient';
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
  reduceScale = 0.03, // reduz até 3% (ligeiramente mais evidente)
  reduceOpacity = 0.06, // reduz até 6% para sensação de profundidade
  progress, // Animated.Value opcional, normalizado -1..1
  edgeActivationWidth, // px a partir das bordas (se não informado, calcula responsivo)
  velocityThreshold = 0.25, // velocidade mínima para aceitar swipe
  dragFactor = 0.45, // tradução um pouco maior para sensação de carrossel
  enabled = true,
  allowSwipeLeft = true,
  allowSwipeRight = true,
  edgeFrom = 'both', // 'both' | 'left' | 'right' | 'any'
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
  const wasCancelledRef = useRef(false);

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
        onStartShouldSetPanResponder: (evt) => {
          // Guarda o ponto inicial mesmo quando não capturamos no start
          const { locationX } = evt.nativeEvent;
          startXRef.current = locationX;
          return false;
        },
        onStartShouldSetPanResponderCapture: (evt) => {
          const { locationX } = evt.nativeEvent;
          startXRef.current = locationX;
          // Antecipar captura quando o toque começa na borda permitida
          const leftEdge = locationX <= effectiveEdge;
          const rightEdge = locationX >= winWidth - effectiveEdge;
          if (edgeFrom === 'any') return false;
          const allowFromLeft = leftEdge && allowSwipeRight;
          const allowFromRight = rightEdge && allowSwipeLeft;
          return allowFromLeft || allowFromRight;
        },
        onMoveShouldSetPanResponderCapture: (_, gesture) => {
          const { dx, dy, numberActiveTouches } = gesture;
          if (multiTouchCancel && numberActiveTouches > 1) return false;
          const leftEdge = startXRef.current <= effectiveEdge;
          const rightEdge = startXRef.current >= winWidth - effectiveEdge;
          const edgeOk =
            edgeFrom === 'any'
              ? true
              : edgeFrom === 'both'
                ? leftEdge || rightEdge
                : edgeFrom === 'left'
                  ? leftEdge
                  : rightEdge;
          const minDx = edgeFrom === 'any' ? 22 : 14;
          const horizontalIntent =
            Math.abs(dx) > minDx &&
            Math.abs(dx) > Math.abs(dy) * 1.15 &&
            Math.abs(dy) <= verticalTolerance;
          const dirOk = (dx < 0 && allowSwipeLeft) || (dx > 0 && allowSwipeRight);
          return edgeOk && horizontalIntent && dirOk;
        },
        onMoveShouldSetPanResponder: (_, gesture) => {
          const { dx, dy, numberActiveTouches } = gesture;
          if (multiTouchCancel && numberActiveTouches > 1) return false;
          const leftEdge = startXRef.current <= effectiveEdge;
          const rightEdge = startXRef.current >= winWidth - effectiveEdge;
          const edgeOk =
            edgeFrom === 'any'
              ? true
              : edgeFrom === 'both'
                ? leftEdge || rightEdge
                : edgeFrom === 'left'
                  ? leftEdge
                  : rightEdge;
          // Requer deslocamento horizontal suficiente, dentro da tolerância vertical.
          const minDx = edgeFrom === 'any' ? 22 : 14;
          const horizontalIntent =
            Math.abs(dx) > minDx &&
            Math.abs(dx) > Math.abs(dy) * 1.15 &&
            Math.abs(dy) <= verticalTolerance;
          const dirOk = (dx < 0 && allowSwipeLeft) || (dx > 0 && allowSwipeRight);
          return edgeOk && horizontalIntent && dirOk;
        },
        onPanResponderMove: (_, gesture) => {
          // Cancela em multi-toque para evitar saltos inesperados
          if (multiTouchCancel && gesture.numberActiveTouches > 1) {
            wasCancelledRef.current = true;
            translateX.stopAnimation();
            translateX.setValue(0);
            if (progress) progress.setValue(0);
            return;
          }
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
          if (wasCancelledRef.current) {
            wasCancelledRef.current = false;
            animateTo(0);
            progress &&
              Animated.spring(progress, {
                toValue: 0,
                useNativeDriver: true,
                friction: 7,
                tension: 80,
              }).start();
            onSwipeCancel && onSwipeCancel();
            return;
          }
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
            navigatingRef.current = true;
            // Navega imediatamente para reduzir a latência percebida.
            const dir = goLeft ? -1 : 1;
            try {
              // micro feedback visual (não bloqueia a navegação)
              Animated.timing(translateX, {
                toValue: dir * Math.min(24, winWidth * 0.05) * dragFactor,
                duration: 60,
                useNativeDriver: true,
              }).start();
            } catch {}
            if (goLeft) onSwipeLeft && onSwipeLeft();
            else onSwipeRight && onSwipeRight();
            // Caso não desmonte imediatamente (ambientes não-nativos), reseta rapidamente
            setTimeout(() => {
              try {
                translateX.setValue(0);
                progress && progress.setValue(0);
              } catch {}
              navigatingRef.current = false;
            }, 120);
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
          wasCancelledRef.current = false;
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

  // Sombra direcional nas bordas para realçar a sobreposição entre telas
  const shadowWidth = Math.max(12, Math.round(winWidth * 0.045));
  const leftShadowOpacity = translateX.interpolate({
    inputRange: [-1, 0, winWidth * 0.2],
    outputRange: [0, 0, 0.14],
    extrapolate: 'clamp',
  });
  const rightShadowOpacity = translateX.interpolate({
    inputRange: [-winWidth * 0.2, 0, 1],
    outputRange: [0.14, 0, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={{ flex: 1, minHeight: 0, opacity, transform: [{ translateX }, { scale }] }}
      {...(enabled ? responder.panHandlers : {})}
    >
      {/* Conteúdo da tela */}
      {children}
      {/* Sombras direcionais para dar sensação de profundidade/overlap como carrossel */}
      <Animated.View
        pointerEvents="none"
        style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: shadowWidth, opacity: leftShadowOpacity }}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.14)", "rgba(0,0,0,0)"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: shadowWidth, opacity: rightShadowOpacity }}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.14)"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </Animated.View>
  );
}
