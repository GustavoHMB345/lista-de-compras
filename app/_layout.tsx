import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../src/setup/layoutAnimation';

import { Dimensions, Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import PagerView from 'react-native-pager-view';
import ErrorBoundary from '../src/components/ErrorBoundary';
import { ThemeProvider as AppThemeProvider, useTheme } from '../src/components/theme';
import { DataProvider } from '../src/contexts/DataContext';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const router = useRouter();
  const pathname = usePathname();

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <GestureHandlerRootView
      style={{ flex: 1, ...(Platform.OS === 'web' ? { minHeight: '100vh' } : {}) } as any}
    >
      <AppThemeProvider initialOverride="light">
        <ThemedNav>
          <DataProvider>
            <ErrorBoundary>
              <View style={{ flex: 1 }}>
                {/* Global swipe overlay for main tabs using PagerView, transparent and non-visual. */}
                {(() => {
                  const tabsOrder = ['/profile', '/lists', '/family', '/dashboard'];
                  const isOnMainTab = tabsOrder.includes(pathname || '');
                  if (!isOnMainTab) return null;
                  const currentIndex = Math.max(0, tabsOrder.indexOf(pathname || ''));
                  const { width, height } = Dimensions.get('window');
                  return (
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="box-none">
                      <PagerView
                        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                        initialPage={currentIndex < 0 ? 0 : currentIndex}
                        scrollEnabled
                        overScrollMode="never"
                        orientation="horizontal"
                        onPageSelected={(e) => {
                          const idx = e.nativeEvent.position;
                          const target = tabsOrder[idx];
                          if (target && target !== pathname) router.replace(target as any);
                        }}
                      >
                        {tabsOrder.map((_, i) => (
                          <View key={String(i)} style={{ width, height }} />
                        ))}
                      </PagerView>
                    </View>
                  );
                })()}
                <Stack
                screenOptions={{
                  gestureEnabled: true,
                  fullScreenGestureEnabled: true,
                  // Remove fade flash by aligning backgrounds; keep no extra nav animation
                  animation: 'none',
                }}
              >
                <Stack.Screen name="splash" options={{ headerShown: false }} />
                <Stack.Screen name="welcome" options={{ headerShown: false }} />
                <Stack.Screen name="sign-in" options={{ headerShown: false }} />
                <Stack.Screen name="sign-up" options={{ headerShown: false }} />
                <Stack.Screen name="auth" options={{ headerShown: false }} />
                <Stack.Screen name="dashboard" options={{ headerShown: false }} />
                <Stack.Screen name="lists" options={{ headerShown: false }} />
                <Stack.Screen name="family" options={{ headerShown: false }} />
                <Stack.Screen name="profile" options={{ headerShown: false }} />
                <Stack.Screen name="list-detail" options={{ headerShown: false }} />
                <Stack.Screen name="join-family" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
                </Stack>
              </View>
            </ErrorBoundary>
            <StatusBar style="auto" />
          </DataProvider>
        </ThemedNav>
      </AppThemeProvider>
    </GestureHandlerRootView>
  );
}

function ThemedNav({ children }: { children: React.ReactNode }) {
  const { tokens: t, scheme } = useTheme();
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    dark: scheme === 'dark',
    colors: {
      ...base.colors,
      primary: t.primary,
      background: t.background,
      card: t.card,
      text: t.text,
      border: t.border,
      notification: t.primary,
    },
  } as any;
  return <NavThemeProvider value={navTheme}>{children}</NavThemeProvider>;
}
