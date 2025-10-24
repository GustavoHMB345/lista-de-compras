import { KeyboardAvoidingView, Platform, ScrollView, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Screen({
  children,
  tabBarHeight = 0,
  tabBarPosition = 'top',
  contentStyle,
  scroll = true,
  overlayTabBar = false,
  overlayBottomSpacer = 0,
  // Optional: per-screen control to increase the scroll end underlay when TabBar is overlaid
  scrollEndUnderlay,
  // Optional: derive underlay from an estimated card height
  scrollEndFromCardHeight,
  onScroll,
}) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  // Reduce extra top padding slightly for tighter layout
  const paddingTop = (tabBarPosition === 'top' ? tabBarHeight : 0) + insets.top + 4;
  // If overlayTabBar is true, do NOT add tabBarHeight to bottom padding so content can scroll under the bar
  // Add optional overlayBottomSpacer to keep important content visible near the bottom on small screens
  // Reduce bottom padding to tighten scroll end without risking content under TabBar
  // Increase adaptive underlay slightly so o scroll avance um pouco mais sob a TabBar
  let overlayUnderlay = 0;
  if (overlayTabBar) {
    if (typeof scrollEndUnderlay === 'number') {
      overlayUnderlay = scrollEndUnderlay;
    } else if (
      scrollEndFromCardHeight && typeof scrollEndFromCardHeight.cardHeight === 'number'
    ) {
      const h = Math.max(0, scrollEndFromCardHeight.cardHeight);
      const factor = typeof scrollEndFromCardHeight.factor === 'number'
        ? scrollEndFromCardHeight.factor
        : 0.4;
      const gap = typeof scrollEndFromCardHeight.gap === 'number'
        ? scrollEndFromCardHeight.gap
        : 8;
      const min = typeof scrollEndFromCardHeight.min === 'number'
        ? scrollEndFromCardHeight.min
        : 12;
      const max = typeof scrollEndFromCardHeight.max === 'number'
        ? scrollEndFromCardHeight.max
        : Math.max(28, Math.floor(tabBarHeight * 1.2));
      const raw = Math.round(h * factor) + gap;
      overlayUnderlay = Math.max(min, Math.min(max, raw));
    } else {
      overlayUnderlay = Math.max(18, Math.floor(tabBarHeight * 0.8));
    }
  }
  const paddingBottomExtra =
    (tabBarPosition === 'bottom' && !overlayTabBar ? tabBarHeight : 0) +
    Math.max(10, insets.bottom + 8) +
    overlayUnderlay +
    (overlayTabBar ? overlayBottomSpacer : 0);
  // Ensure content at least fills the viewport to allow full scroll sweep
  const minContentHeight = Math.max(
    0,
    height - paddingTop - (tabBarPosition === 'bottom' && !overlayTabBar ? tabBarHeight : 0) - insets.bottom,
  );
  const Content = scroll ? ScrollView : View;
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, minHeight: 0 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={tabBarHeight}
    >
      <Content
        contentContainerStyle={
          scroll
            ? [
                {
                  paddingTop,
                  paddingHorizontal: 16,
                  // ensure content clears bottom safe area and bottom tab bar
                  paddingBottom: paddingBottomExtra,
                  minHeight: minContentHeight,
                },
                contentStyle,
              ]
            : undefined
        }
        style={!scroll ? [{ paddingTop, paddingHorizontal: 16, flex: 1, minHeight: 0, paddingBottom: paddingBottomExtra }, contentStyle] : { flex: 1, minHeight: 0 }}
        onScroll={scroll ? onScroll : undefined}
        scrollEventThrottle={scroll ? 16 : undefined}
        automaticallyAdjustKeyboardInsets
        keyboardDismissMode={scroll ? 'on-drag' : undefined}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </Content>
    </KeyboardAvoidingView>
  );
}
