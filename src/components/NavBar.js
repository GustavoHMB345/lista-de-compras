import { LinearGradient } from 'expo-linear-gradient';
import { Animated, Dimensions, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

const { width: __w } = Dimensions.get('window');
const isTablet = __w >= 720;
const ICON_SIZE = isTablet ? 40 : 36;

// Neutral gray gradients for icons
const GRAY_ACTIVE = ['#A3A3A3', '#737373']; // neutral-400 -> neutral-500
const GRAY_INACTIVE = ['#525252', '#262626']; // neutral-600 -> neutral-800

const GradientIcon = ({ children, active }) => (
  <LinearGradient
    colors={active ? GRAY_ACTIVE : GRAY_INACTIVE}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={[styles.iconWrap, active && styles.iconActiveWrap]}
  >
    {children}
  </LinearGradient>
);

const HomeIcon = ({ active }) => (
  <GradientIcon active={active}>
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 11.5L12 4l9 7.5"
        stroke={'#fff'}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5 10.5V20a1 1 0 001 1h3.5a1 1 0 001-1v-4h2v4a1 1 0 001 1H18a1 1 0 001-1v-9.5"
        stroke={'#fff'}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </GradientIcon>
);
const FamilyIcon = ({ active }) => (
  <GradientIcon active={active}>
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx={8} cy={8} r={3} stroke={'#fff'} strokeWidth={2} />
      <Circle cx={16} cy={8} r={3} stroke={'#fff'} strokeWidth={2} />
      <Path d="M2 20c0-3.3137 3.134-6 7-6s7 2.6863 7 6" stroke={'#fff'} strokeWidth={2} />
      <Path d="M14 20c0-2.2091 2.239-4 5-4s5 1.7909 5 4" stroke={'#fff'} strokeWidth={2} />
    </Svg>
  </GradientIcon>
);
const ListIcon = ({ active }) => (
  <GradientIcon active={active}>
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M6 6h13M6 12h13M6 18h13" stroke={'#fff'} strokeWidth={2} strokeLinecap="round" />
      <Circle cx={3} cy={6} r={1} fill={'#fff'} />
      <Circle cx={3} cy={12} r={1} fill={'#fff'} />
      <Circle cx={3} cy={18} r={1} fill={'#fff'} />
    </Svg>
  </GradientIcon>
);
const ProfileIcon = ({ active }) => (
  <GradientIcon active={active}>
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={4} stroke={'#fff'} strokeWidth={2} />
      <Path d="M4 20c0-3.3137 3.582-6 8-6s8 2.6863 8 6" stroke={'#fff'} strokeWidth={2} />
    </Svg>
  </GradientIcon>
);

export default function NavBar({ navigate, activeScreen, onAddList, progress }) {
  const animatedOpacity = progress
    ? progress.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [0.95, 1, 0.95],
        extrapolate: 'clamp',
      })
    : 1;
  const animatedScale = progress
    ? progress.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [0.98, 1, 0.98],
        extrapolate: 'clamp',
      })
    : 1;
  return (
    <SafeAreaView edges={['bottom']} style={styles.navBarSafeAreaCustom}>
      <Animated.View
        style={[
          styles.navBarContainerCustom,
          { opacity: animatedOpacity, transform: [{ scale: animatedScale }] },
        ]}
      >
        {/* Left side: Family (1), Lists (2) */}
        <TouchableOpacity
          accessibilityLabel="Família"
          testID="tab-family"
          style={styles.navBarItemCustom}
          onPress={() => navigate('FAMILY')}
          activeOpacity={0.7}
        >
          <FamilyIcon active={activeScreen === 'FAMILY'} />
          {activeScreen === 'FAMILY' && <View style={styles.activeDot} />}
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityLabel="Listas"
          testID="tab-lists"
          style={styles.navBarItemCustom}
          onPress={() => navigate('LISTS')}
          activeOpacity={0.7}
        >
          <ListIcon active={activeScreen === 'LISTS'} />
          {activeScreen === 'LISTS' && <View style={styles.activeDot} />}
        </TouchableOpacity>
        {/* Right side: Dashboard (3), Profile (4) */}
        <TouchableOpacity
          accessibilityLabel="Dashboard"
          testID="tab-dashboard"
          style={styles.navBarItemCustom}
          onPress={() => navigate('DASHBOARD')}
          activeOpacity={0.7}
        >
          <HomeIcon active={activeScreen === 'DASHBOARD'} />
          {activeScreen === 'DASHBOARD' && <View style={styles.activeDot} />}
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityLabel="Perfil"
          testID="tab-profile"
          style={styles.navBarItemCustom}
          onPress={() => navigate('PROFILE')}
          activeOpacity={0.7}
        >
          <ProfileIcon active={activeScreen === 'PROFILE'} />
          {activeScreen === 'PROFILE' && <View style={styles.activeDot} />}
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  navBarSafeAreaCustom: {
    backgroundColor: 'transparent',
  },
  navBarContainerCustom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#23232B',
    borderRadius: 28,
    marginHorizontal: isTablet ? 28 : 18,
    marginBottom: Platform.OS === 'ios' ? 18 : 12,
    paddingHorizontal: isTablet ? 22 : 18,
    paddingTop: isTablet ? 10 : 8,
    paddingBottom: isTablet ? 10 : 8,
  shadowColor: '#0B0B0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 10,
  },
  navBarItemCustom: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: isTablet ? 64 : 56,
    position: 'relative',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
  },
  iconActiveWrap: {
    shadowColor: '#9CA3AF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 8,
    backgroundColor: 'rgba(156,163,175,0.08)',
  },
  activeDot: {
    position: 'absolute',
    bottom: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    opacity: 0.9,
  },
});
