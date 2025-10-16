import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
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
}) {
  const router = useRouter();

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

  return (
    <>
      <TabBar
        active={active}
        onNavigate={handleNavigate}
        onAddList={primaryActionPlacement === 'tabbar' ? onPrimaryAction : undefined}
        position="bottom"
      />
      <SwipeNavigator
        onSwipeLeft={rightTab ? () => handleNavigate(rightTab) : undefined}
        onSwipeRight={leftTab ? () => handleNavigate(leftTab) : undefined}
        allowSwipeLeft={!!rightTab}
        allowSwipeRight={!!leftTab}
        edgeFrom="any"
      >
        <Screen
          tabBarHeight={56}
          tabBarPosition="bottom"
          overlayTabBar
          overlayBottomSpacer={bottomSpacer}
          contentStyle={contentStyle}
          scroll={scroll}
        >
          {children}
        </Screen>
      </SwipeNavigator>
    </>
  );
}

const styles = StyleSheet.create({});
