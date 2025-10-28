import React, { useRef } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
    Extrapolate,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

const TABS = [
  { key: 'profile' },
  { key: 'lists' },
  { key: 'family' },
  { key: 'dashboard' },
];

const SCREEN_WIDTH = Dimensions.get('window').width;

type MainTabsCarouselProps = {
  tabElements: React.ReactNode[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
};

export default function MainTabsCarousel({ tabElements, currentIndex, onIndexChange }: MainTabsCarouselProps) {
  const translateX = useSharedValue(-currentIndex * SCREEN_WIDTH);
  const gestureStartX = useRef(0);

  // Atualiza translateX quando currentIndex muda externamente
  React.useEffect(() => {
    translateX.value = -currentIndex * SCREEN_WIDTH;
  }, [currentIndex]);

  const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    if (event.nativeEvent.state === 2) { // BEGAN
      gestureStartX.current = translateX.value;
    }
    if (event.nativeEvent.state === 4) { // ACTIVE
      translateX.value = gestureStartX.current + event.nativeEvent.translationX;
    }
    if (event.nativeEvent.state === 5) { // END
      const rawIndex = -translateX.value / SCREEN_WIDTH;
      let newIndex = Math.round(rawIndex);
      if (newIndex < 0) newIndex = TABS.length - 1;
      if (newIndex >= TABS.length) newIndex = 0;
      translateX.value = withSpring(-newIndex * SCREEN_WIDTH);
      if (newIndex !== currentIndex) {
        runOnJS(onIndexChange)(newIndex);
      }
    }
  };

  // onHandlerStateChange removido, tudo tratado no onGestureEvent

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      activeOffsetX={[-20, 20]}
    >
      <Animated.View style={styles.carouselContainer}>
        {tabElements.map((Element, i) => {
          const animatedStyle = useAnimatedStyle(() => {
            const inputRange = [
              -SCREEN_WIDTH * (i + 1),
              -SCREEN_WIDTH * i,
              -SCREEN_WIDTH * (i - 1),
            ];
            const scale = interpolate(
              translateX.value,
              inputRange,
              [0.85, 1, 0.85],
              Extrapolate.CLAMP
            );
            const opacity = interpolate(
              translateX.value,
              inputRange,
              [0.5, 1, 0.5],
              Extrapolate.CLAMP
            );
            return {
              transform: [{ scale }, { translateX: i * SCREEN_WIDTH + translateX.value }],
              opacity,
            };
          });
          return (
            <Animated.View key={TABS[i].key} style={[styles.tab, animatedStyle]}>
              {Element}
            </Animated.View>
          );
        })}
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  carouselContainer: {
    flexDirection: 'row',
    width: SCREEN_WIDTH * TABS.length,
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  tab: {
    width: SCREEN_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
