import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Screen({ children, tabBarHeight = 0, contentStyle, scroll = true }) {
  const insets = useSafeAreaInsets();
  const paddingTop = (tabBarHeight || 0) + insets.top + 8;
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
                  // ensure content clears bottom safe area
                  paddingBottom: Math.max(20, insets.bottom + 16),
                },
                contentStyle,
              ]
            : undefined
        }
        style={
          !scroll ? [{ paddingTop, paddingHorizontal: 16, flex: 1 }, contentStyle] : { flex: 1 }
        }
        automaticallyAdjustKeyboardInsets
        keyboardDismissMode={scroll ? 'on-drag' : undefined}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </Content>
    </KeyboardAvoidingView>
  );
}
