import { useRouter } from 'expo-router';
import React, { useContext, useMemo, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { DataContext } from '../contexts/DataContext';
import { EVENTS, on } from '../navigation/EventBus';
import Screen from './Screen';
import SimpleAddListModal from './SimpleAddListModal';
import SwipeNavigator from './SwipeNavigator';
import TabBar from './TabBar';


export default function ScreensDefault({
  active,
  children,
  leftTab,
  rightTab,
  scroll = true,
  contentStyle,
  overlayBottomSpacer,
  scrollEndFromCardHeight,
  // Optional per-screen control: how far scroll can push under the overlaid TabBar
  scrollEndUnderlay,
  gradientBackground = false,
  onPrimaryAction,
  primaryActionPlacement = 'tabbar', // 'tabbar' | 'floating'
  forceHideTabBar = false,
}) {
  const router = useRouter();
  const { uiPrefs, shoppingLists, updateLists, currentUser } = useContext(DataContext) || {};
  const MAIN_TABS = useRef(new Set(['PROFILE', 'LISTS', 'FAMILY', 'DASHBOARD']));
  const [showAdd, setShowAdd] = useState(false);
  React.useEffect(() => {
    const off = on(EVENTS.OPEN_ADD_LIST_MODAL, () => setShowAdd(true));
    return off;
  }, []);

  const handleNavigate = (screen) => {
    switch (screen) {
      case 'DASHBOARD':
        router.replace('/dashboard');
        break;
      case 'LISTS':
        router.replace('/lists');
        break;
      case 'FAMILY':
        router.replace('/family');
        break;
      case 'PROFILE':
        router.replace('/profile');
        break;
      default:
        break;
    }
  };

  // Default spacer: with overlaid TabBar we keep the extra bottom spacer at 0 by default
  const bottomSpacer = useMemo(() => {
    if (typeof overlayBottomSpacer === 'number') return overlayBottomSpacer;
    return 0;
  }, [overlayBottomSpacer, active]);

  // Provide per-screen default underlay values when no dynamic card-height logic is provided
  // and no explicit scrollEndUnderlay is passed by the caller.
  const effectiveScrollEndUnderlay = useMemo(() => {
    if (typeof scrollEndUnderlay === 'number') return scrollEndUnderlay; // explicit override
    // If dynamic behavior is provided by the screen, don't force a default underlay.
    if (scrollEndFromCardHeight && typeof scrollEndFromCardHeight === 'object') return undefined;
    const defaults = {
      LISTS: 22,
      FAMILY: 30,
      DASHBOARD: 36,
      PROFILE: 24,
    };
    return defaults[active] ?? undefined;
  }, [scrollEndUnderlay, scrollEndFromCardHeight, active]);

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
            edgeFrom="any"
            verticalTolerance={8}
          >
            <Screen
              tabBarHeight={56}
              tabBarPosition={uiPrefs?.tabBarPosition === 'top' ? 'top' : 'bottom'}
              overlayTabBar
              overlayBottomSpacer={bottomSpacer}
              scrollEndUnderlay={effectiveScrollEndUnderlay}
              scrollEndFromCardHeight={scrollEndFromCardHeight}
              contentStyle={contentStyle}
              scroll={scroll}
            >
              {children}
            </Screen>
          </SwipeNavigator>
        );
      })()}
      {/* Global Add List modal for main tabs */}
      <SimpleAddListModal
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        onCreate={({ name, priority }) => {
          const newEntry = {
            id: `list_${Date.now()}`,
            name,
            priority: priority || 'medium',
            items: [],
            familyId: currentUser?.familyId,
            createdAt: new Date().toISOString(),
            status: 'active',
            members: currentUser ? [currentUser.id] : [],
          };
          const next = [...(shoppingLists || []), newEntry];
          updateLists?.(next);
          setShowAdd(false);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({});
