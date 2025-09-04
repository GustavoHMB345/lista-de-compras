import React, { useMemo } from 'react';
import { PanResponder, View } from 'react-native';

// Simple horizontal swipe detector. Wrap your screen content with this component
// and pass handlers for left/right swipes to navigate between routes.
export default function SwipeNavigator({ children, onSwipeLeft, onSwipeRight, threshold = 60 }) {
  const responder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => {
          const { dx, dy } = gesture;
          // Only capture when it's a horizontal intent and exceeds a small threshold
          return Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy);
        },
        onPanResponderRelease: (_, gesture) => {
          const { dx, vx } = gesture;
          if (dx < -threshold && Math.abs(vx) > 0.05) {
            onSwipeLeft && onSwipeLeft();
          } else if (dx > threshold && Math.abs(vx) > 0.05) {
            onSwipeRight && onSwipeRight();
          }
        },
      }),
    [onSwipeLeft, onSwipeRight, threshold]
  );

  return (
    <View style={{ flex: 1 }} {...responder.panHandlers}>
      {children}
    </View>
  );
}
