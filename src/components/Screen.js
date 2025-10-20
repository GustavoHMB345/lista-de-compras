import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Screen({
  children,
  tabBarHeight = 0,
  tabBarPosition = 'top',
  contentStyle,
  scroll = true,
  overlayTabBar = false,
  overlayBottomSpacer = 0,
  onScroll,
}) {
  const insets = useSafeAreaInsets();
  const paddingTop = (tabBarPosition === 'top' ? tabBarHeight : 0) + insets.top + 8;
  // If overlayTabBar is true, do NOT add tabBarHeight to bottom padding so content can scroll under the bar
  // Add optional overlayBottomSpacer to keep important content visible near the bottom on small screens
  const paddingBottomExtra =
    (tabBarPosition === 'bottom' && !overlayTabBar ? tabBarHeight : 0) +
    Math.max(20, insets.bottom + 16) +
    (overlayTabBar ? overlayBottomSpacer : 0);
  const Content = scroll ? ScrollView : View;
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
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
                },
                contentStyle,
              ]
            : undefined
        }
        style={!scroll ? [{ paddingTop, paddingHorizontal: 16, flex: 1, paddingBottom: paddingBottomExtra }, contentStyle] : { flex: 1 }}
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
