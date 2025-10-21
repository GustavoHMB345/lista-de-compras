import { useRouter } from 'expo-router';
import React, { createContext, useContext, useMemo, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { DataContext } from '../contexts/DataContext';
import AddListModal from './AddListModal';
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
export const TabBarVisibilityContext = createContext({ reportScrollY: (_y) => {}, tabHidden: false });

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
  const { uiPrefs, shoppingLists, updateLists, currentUser } = useContext(DataContext) || {};
  const lastOffsetY = useRef(0);
  const [tabHidden, setTabHidden] = useState(false);
  const MAIN_TABS = useRef(new Set(['PROFILE', 'LISTS', 'FAMILY', 'DASHBOARD']));
  const [showAdd, setShowAdd] = useState(false);

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
    const base = active === 'DASHBOARD' ? 16 : active === 'FAMILY' ? 32 : 24;
    return base;
  }, [overlayBottomSpacer, active]);

  const effectiveHideOnScroll = !!hideTabBarOnScroll;

  const handleScroll = effectiveHideOnScroll
    ? (e) => {
        const y = e?.nativeEvent?.contentOffset?.y || 0;
        const dy = y - (lastOffsetY.current || 0);
        lastOffsetY.current = y;
        const threshold = 8;
        const topReveal = 10;
        if (y <= topReveal && tabHidden) {
          setTabHidden(false);
          return;
        }
        if (dy > threshold && !tabHidden) setTabHidden(true);
        else if (dy < -threshold && tabHidden) setTabHidden(false);
      }
    : undefined;

  // Context API for children with their own scroll (e.g., FlatList) to report scrollY
  const reportScrollY = effectiveHideOnScroll
    ? (y) => {
        const currentY = typeof y === 'number' ? y : 0;
        const dy = currentY - (lastOffsetY.current || 0);
        lastOffsetY.current = currentY;
        const threshold = 8;
        const topReveal = 10;
        if (currentY <= topReveal && tabHidden) {
          setTabHidden(false);
          return;
        }
        if (dy > threshold && !tabHidden) setTabHidden(true);
        else if (dy < -threshold && tabHidden) setTabHidden(false);
      }
    : () => {};

  return (
    <>
      {(() => {
        const wantCenterPlus = MAIN_TABS.current.has(active);
        const addAction = wantCenterPlus
          ? (primaryActionPlacement === 'tabbar'
              ? (onPrimaryAction || (() => setShowAdd(true)))
              : undefined)
          : undefined;
        return (
      <TabBar
        active={active}
        onNavigate={handleNavigate}
          onAddList={addAction}
        position={uiPrefs?.tabBarPosition === 'top' ? 'top' : 'bottom'}
        hidden={forceHideTabBar || (effectiveHideOnScroll && tabHidden)}
      />
        );
      })()}
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
              tabBarPosition={uiPrefs?.tabBarPosition === 'top' ? 'top' : 'bottom'}
              overlayTabBar
              overlayBottomSpacer={bottomSpacer}
              contentStyle={contentStyle}
              scroll={scroll}
              onScroll={handleScroll}
            >
              <TabBarVisibilityContext.Provider value={{ reportScrollY, tabHidden }}>
                {children}
              </TabBarVisibilityContext.Provider>
            </Screen>
          </SwipeNavigator>
        );
      })()}
      {/* Global Add List modal for main tabs */}
      <AddListModal
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        onCreate={(newList) => {
          const next = [
            ...(shoppingLists || []),
            {
              ...newList,
              id: `list_${Date.now()}`,
              familyId: currentUser?.familyId,
              createdAt: new Date().toISOString(),
              status: 'active',
              members: currentUser ? [currentUser.id] : [],
            },
          ];
          updateLists?.(next);
          setShowAdd(false);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({});
