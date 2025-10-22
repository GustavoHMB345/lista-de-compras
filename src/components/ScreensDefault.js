import { useRouter } from 'expo-router';
import React, { useContext, useMemo, useRef, useState } from 'react';
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
  forceHideTabBar = false,
}) {
  const router = useRouter();
  const { uiPrefs, shoppingLists, updateLists, currentUser } = useContext(DataContext) || {};
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

  // Hide-on-scroll removed: TabBar no longer reacts to scroll.

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
        hidden={forceHideTabBar}
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
            edgeFrom="both"
            verticalTolerance={8}
          >
            <Screen
              tabBarHeight={56}
              tabBarPosition={uiPrefs?.tabBarPosition === 'top' ? 'top' : 'bottom'}
              overlayTabBar
              overlayBottomSpacer={bottomSpacer}
              contentStyle={contentStyle}
              scroll={scroll}
            >
              {children}
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
