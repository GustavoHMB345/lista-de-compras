import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
// Importações atualizadas do gesture-handler
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    clamp,
    Easing,
    Extrapolate,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;

type MainTabsCarouselProps = {
    tabElements: React.ReactNode[];
    currentIndex: number;
    onIndexChange: (index: number) => void;
};

export default function MainTabsCarousel({
    tabElements,
    currentIndex,
    onIndexChange,
}: MainTabsCarouselProps) {
    const numTabs = tabElements.length;
    const translateX = useSharedValue(-currentIndex * SCREEN_WIDTH);
    const gestureContext = useSharedValue({ startX: 0 });

    const MIN_SWIPE_DISTANCE = SCREEN_WIDTH * 0.20;
    const ACTIVE_OFFSET_X: [number, number] = [-25, 25];
    const FAIL_OFFSET_Y: [number, number] = [-15, 15];
    const ANIMATION_DURATION = 100;
    const ANIMATION_EASING = Easing.out(Easing.quad);

    React.useEffect(() => {
        translateX.value = withTiming(-currentIndex * SCREEN_WIDTH, {
            duration: ANIMATION_DURATION,
            easing: ANIMATION_EASING,
        });
    }, [currentIndex, translateX]);

    const panGesture = Gesture.Pan()
        .activeOffsetX(ACTIVE_OFFSET_X)
        .failOffsetY(FAIL_OFFSET_Y)
        .onBegin(() => {
            'worklet';
            gestureContext.value.startX = translateX.value;
        })
        .onUpdate((event) => {
            'worklet';
            const newTranslateX = gestureContext.value.startX + event.translationX;
            const minTranslateX = -(numTabs - 1) * SCREEN_WIDTH;
            const maxTranslateX = 0;
            translateX.value = clamp(newTranslateX, minTranslateX, maxTranslateX);
        })
        .onEnd((event) => {
            'worklet';
            const dragDistance = event.translationX;
            let newIndex = currentIndex;

            if (dragDistance < -MIN_SWIPE_DISTANCE && currentIndex < numTabs - 1) {
                newIndex = currentIndex + 1;
            } else if (dragDistance > MIN_SWIPE_DISTANCE && currentIndex > 0) {
                newIndex = currentIndex - 1;
            }

            translateX.value = withTiming(-newIndex * SCREEN_WIDTH, {
                duration: ANIMATION_DURATION,
                easing: ANIMATION_EASING,
            });

            if (newIndex !== currentIndex) {
                runOnJS(onIndexChange)(newIndex);
            }
        });

    const carouselAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    return (
        <GestureDetector gesture={panGesture}>
            <Animated.View
                style={[
                    styles.carouselContainer,
                    { width: SCREEN_WIDTH * numTabs },
                    carouselAnimatedStyle,
                ]}
            >
                {tabElements.map((Element, i) => {
                    const tabAnimatedStyle = useAnimatedStyle(() => {
                        const inputRange = [
                            -SCREEN_WIDTH * (i + 1),
                            -SCREEN_WIDTH * i,
                            -SCREEN_WIDTH * (i - 1),
                        ];

                        // --- Efeitos de Animação Ajustados ---
                        const scale = interpolate(
                            translateX.value,
                            inputRange,
                            [0.8, 1, 0.8], // Mais escala nas telas inativas
                            Extrapolate.CLAMP
                        );
                        const opacity = interpolate(
                            translateX.value,
                            inputRange,
                            [0.5, 1, 0.5], // Mais transparência nas telas inativas
                            Extrapolate.CLAMP
                        );

                        return {
                            transform: [{ scale }],
                            opacity,
                        };
                    });

                    return (
                        <Animated.View
                            key={i}
                            style={[styles.tab, tabAnimatedStyle]}
                        >
                            {Element}
                        </Animated.View>
                    );
                })}
            </Animated.View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    carouselContainer: {
        flexDirection: 'row',
        height: '100%',
    },
    tab: {
        width: SCREEN_WIDTH,
        height: '100%',
    },
});