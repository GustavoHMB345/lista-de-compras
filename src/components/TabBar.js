import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { PlusIcon } from './Icons';

// Simple, solid TabBar (top or bottom). Props: active, onNavigate(screen), tint, position
export default function TabBar({
  active,
  onNavigate,
  onAddList,
  tint = 'light',
  position = 'bottom',
  hidden = false,
}) {
  const translateY = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(translateY, {
      toValue: hidden ? (position === 'top' ? -80 : 80) : 0,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [hidden, position, translateY]);

  // Note: To also color the Android system navigation bar, install expo-navigation-bar
  // and set the background/button style at app level or here.
  const fade = translateY.interpolate({
    inputRange: [-80, -60, 0, 60, 80],
    outputRange: [0, 0.2, 1, 0.2, 0],
    extrapolate: 'clamp',
  });
  // Subtle pulse for the center plus based on visibility
  const centerScale = translateY.interpolate({
    inputRange: [-80, 0, 80],
    outputRange: [1.03, 1.0, 1.03],
    extrapolate: 'clamp',
  });
  return (
    <SafeAreaView
      edges={position === 'top' ? ['top'] : ['bottom']}
      style={[
        styles.safe,
        position === 'bottom'
          ? (Platform.OS === 'web' ? styles.safeBottomWeb : styles.safeBottom)
          : null,
      ]}
      // Don't block scroll/touches outside the actual buttons
      pointerEvents={hidden ? 'none' : 'box-none'}
    >
      <Animated.View
        style={[
          styles.bar,
          position === 'top' ? styles.barTop : styles.barBottom,
          { transform: [{ translateY }], opacity: fade },
          hidden ? styles.barHidden : null,
        ]}
        pointerEvents={hidden ? 'none' : 'box-none'}
      >
  {/* Removed notch to keep center plus strictly circular */}
        <View style={styles.tabsRow}>
          {/* Order aligned with swipe flow: Profile → Lists → Family → Dashboard */}
          <IconTab
            active={active === 'PROFILE'}
            label="Perfil"
            onPress={() => onNavigate('PROFILE')}
            icon={(c) => <ProfileIcon color={c} />}
          />
          <IconTab
            active={active === 'LISTS'}
            label="Listas"
            onPress={() => onNavigate('LISTS')}
            icon={(c) => <ListsIcon color={c} />}
          />
          {typeof onAddList === 'function' ? (
            <Animated.View style={{ alignItems: 'center', justifyContent: 'center', transform: [{ scale: centerScale }] }}>
              <TouchableOpacity
                style={styles.fab}
                activeOpacity={0.9}
                onPress={onAddList}
                accessibilityRole="button"
                accessibilityLabel="Ação principal"
              >
                <LinearGradient
                  colors={["#4F46E5", "#2563EB"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
                />
                <PlusIcon color="#FFFFFF" size={20} />
              </TouchableOpacity>
            </Animated.View>
          ) : null}
          <IconTab
            active={active === 'FAMILY'}
            label="Famílias"
            onPress={() => onNavigate('FAMILY')}
            icon={(c) => <FamilyIcon color={c} />}
          />
          <IconTab
            active={active === 'DASHBOARD'}
            label="Dashboard"
            onPress={() => onNavigate('DASHBOARD')}
            icon={(c) => <HomeIcon color={c} />}
          />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

function IconTab({ active, label, icon, onPress }) {
  const color = active ? '#2563EB' : '#9CA3AF';
  return (
    <TouchableOpacity
      style={styles.iconTab}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="tab"
      accessibilityLabel={label}
    >
      {icon(color)}
      {active && <View style={styles.activeDot} />}
    </TouchableOpacity>
  );
}

const HomeIcon = ({ color = '#6B7280' }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 11.5L12 4l9 7.5"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M5 10.5V20a1 1 0 0 0 1 1h3.5a1 1 0 0 0 1-1v-4h2v4a1 1 0 0 0 1 1H18a1 1 0 0 0 1-1v-9.5"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
const ListsIcon = ({ color = '#6B7280' }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M6 6h13M6 12h13M6 18h13" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Circle cx={3} cy={6} r={1} fill={color} />
    <Circle cx={3} cy={12} r={1} fill={color} />
    <Circle cx={3} cy={18} r={1} fill={color} />
  </Svg>
);
const FamilyIcon = ({ color = '#6B7280' }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx={8} cy={8} r={3} stroke={color} strokeWidth={2} />
    <Circle cx={16} cy={8} r={3} stroke={color} strokeWidth={2} />
    <Path d="M2 20c0-3.3137 3.134-6 7-6s7 2.6863 7 6" stroke={color} strokeWidth={2} />
    <Path d="M14 20c0-2.2091 2.239-4 5-4s5 1.7909 5 4" stroke={color} strokeWidth={2} />
  </Svg>
);
const ProfileIcon = ({ color = '#6B7280' }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={2} />
    <Path d="M4 20c0-3.3137 3.582-6 8-6s8 2.6863 8 6" stroke={color} strokeWidth={2} />
  </Svg>
);

const styles = StyleSheet.create({
  safe: { backgroundColor: 'transparent' },
  safeBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 50, backgroundColor: '#FFFFFF' },
  safeBottomWeb: { position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, backgroundColor: '#FFFFFF' },
  bar: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#0B0B0B',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 6,
    elevation: 8,
    paddingVertical: 10,
  },
  barTop: {
    borderTopWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowOffset: { width: 0, height: 2 },
  },
  barBottom: {},
  barHidden: {
    borderTopWidth: 0,
    shadowOpacity: 0,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  iconTab: { paddingHorizontal: 16, paddingVertical: 6, alignItems: 'center' },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  activeDot: {
    marginTop: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
  },
});
