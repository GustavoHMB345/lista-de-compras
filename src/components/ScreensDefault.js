import { useRouter } from 'expo-router';
import React, { createContext, useMemo, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import Screen from './Screen';
import SwipeNavigator from './SwipeNavigator';
import TabBar from './TabBar';

// Default shell for app screens: bottom overlaid TabBar + fluid swipe navigation (edgeFrom="any").
// Props:
// - active: 'PROFILE' | 'LISTS' | 'FAMILY' | 'DASHBOARD'
// - children: content of the screen
// - leftTab: tab id when swiping RIGHT (navigate to the left screen)
// - rightTab: tab id when swiping LEFT (navigate to the right screen)
// - scroll, contentStyle: forwarded to Screen
// - overlayBottomSpacer: extra bottom space for overlaid TabBar (optional)
// - gradientBackground: boolean to enable simple bg gradient (optional)
// - onPrimaryAction: optional callback for the TabBar primary action (e.g., add item/list)
export const TabBarVisibilityContext = createContext({ reportScrollY: (_y) => {} });

export default function ScreensDefault({
  active,
  children,
  leftTab,
  rightTab,
  scroll = true,
  contentStyle,
  overlayBottomSpacer,
  gradientBackground = false,
  onPrimaryAction,
  primaryActionPlacement = 'tabbar', // 'tabbar' | 'floating'
  hideTabBarOnScroll = false,
  forceHideTabBar = false,
}) {
  const router = useRouter();
  const lastOffsetY = useRef(0);
  const [tabHidden, setTabHidden] = useState(false);
  const MAIN_TABS = useRef(new Set(['PROFILE', 'LISTS', 'FAMILY', 'DASHBOARD']));

  const handleNavigate = (screen) => {
    switch (screen) {
      case 'DASHBOARD':
        router.push('/dashboard');
        break;
      case 'LISTS':
        router.push('/lists');
        break;
      case 'FAMILY':
        router.push('/family');
        break;
      case 'PROFILE':
        router.push('/profile');
        break;
      default:
        break;
    }
  };

  // Provide a sensible default spacer per screen when not provided
  const bottomSpacer = useMemo(() => {
    if (typeof overlayBottomSpacer === 'number') return overlayBottomSpacer;
    if (active === 'DASHBOARD') return 16;
    if (active === 'FAMILY') return 32;
    return 24;
  }, [overlayBottomSpacer, active]);

  const handleScroll = hideTabBarOnScroll
    ? (e) => {
        const y = e?.nativeEvent?.contentOffset?.y || 0;
        const dy = y - (lastOffsetY.current || 0);
        lastOffsetY.current = y;
        const threshold = 8;
        if (dy > threshold && !tabHidden) setTabHidden(true);
        else if (dy < -threshold && tabHidden) setTabHidden(false);
      }
    : undefined;

  // Context API for children with their own scroll (e.g., FlatList) to report scrollY
  const reportScrollY = hideTabBarOnScroll
    ? (y) => {
        const currentY = typeof y === 'number' ? y : 0;
        const dy = currentY - (lastOffsetY.current || 0);
        lastOffsetY.current = currentY;
        const threshold = 8;
        if (dy > threshold && !tabHidden) setTabHidden(true);
        else if (dy < -threshold && tabHidden) setTabHidden(false);
      }
    : () => {};

  return (
    <>
      <TabBar
        active={active}
        onNavigate={handleNavigate}
        onAddList={primaryActionPlacement === 'tabbar' ? onPrimaryAction : undefined}
        position="bottom"
        hidden={forceHideTabBar || (hideTabBarOnScroll && tabHidden)}
      />
      {(() => {
        const canSwipe = MAIN_TABS.current.has(active) && !forceHideTabBar;
        return (
          <SwipeNavigator
            onSwipeLeft={canSwipe && rightTab ? () => handleNavigate(rightTab) : undefined}
            onSwipeRight={canSwipe && leftTab ? () => handleNavigate(leftTab) : undefined}
            allowSwipeLeft={canSwipe && !!rightTab}
            allowSwipeRight={canSwipe && !!leftTab}
            edgeFrom="any"
          >
            <Screen
              tabBarHeight={56}
              tabBarPosition="bottom"
              overlayTabBar
              overlayBottomSpacer={bottomSpacer}
              contentStyle={contentStyle}
              scroll={scroll}
              onScroll={handleScroll}
            >
              <TabBarVisibilityContext.Provider value={{ reportScrollY }}>
                {children}
              </TabBarVisibilityContext.Provider>
            </Screen>
          </SwipeNavigator>
        );
      })()}
    </>
  );
}

const styles = StyleSheet.create({});
