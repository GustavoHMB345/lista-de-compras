import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as Haptics from 'expo-haptics';
import { Stack, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../src/setup/layoutAnimation';

import React, { useContext } from 'react';
import { Platform, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MainTabsCarousel from '../components/MainTabsCarousel';
import ErrorBoundary from '../src/components/ErrorBoundary';
import { ThemeProvider as AppThemeProvider, useTheme } from '../src/components/theme';
import { DataContext, DataProvider } from '../src/contexts/DataContext';
import DashboardScreen from '../src/screens/DashboardScreen';
import FamilyScreen from '../src/screens/FamilyScreen';
import ListsScreen from '../src/screens/ListsScreen';
import ProfileScreen from '../src/screens/ProfileScreen';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const router = useRouter();
  const pathname = usePathname();
  const { uiPrefs } = useContext(DataContext) || {};
  const insets = useSafeAreaInsets();

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
                {/* Carrossel animado das abas principais */}
                {(() => {
                  const tabsOrder = ['/profile', '/lists', '/family', '/dashboard'];
                  const isOnMainTab = tabsOrder.includes(pathname || '');
                  if (!isOnMainTab) return null;
                  const currentIndex = Math.max(0, tabsOrder.indexOf(pathname || ''));
                  const navigateTo = (idx: number) => {
                    const target = tabsOrder[idx];
                    if (target && target !== pathname) {
                      try { void Haptics.selectionAsync(); } catch {}
                      router.replace(target as any);
                    }
                  };
                  // Renderiza cada tela principal como elemento do carrossel
                  const tabElements = [
                    <ProfileScreen key="profile" />,
                    <ListsScreen key="lists" />,
                    <FamilyScreen key="family" />,
                    <DashboardScreen key="dashboard" />,
                  ];
                  return (
                    <MainTabsCarousel
                      tabElements={tabElements}
                      currentIndex={currentIndex}
                      onIndexChange={navigateTo}
                    />
                  );
                })()}
                {/* Wrap content to register native gestures for simultaneous recognition */}
                <GestureDetector gesture={Gesture.Native()}>
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
                </GestureDetector>
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
