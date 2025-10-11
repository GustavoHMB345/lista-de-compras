import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

// Top subtle tab bar (dashboard-style). Props: active, onNavigate(screen)
export default function TabBar({ active, onNavigate, onAddList }) {
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.wrapper}>
        <BlurView
          intensity={30}
          tint={Platform.OS === 'ios' ? 'light' : 'default'}
          style={styles.blur}
        >
          <View style={styles.topWrap}>
            <View style={styles.tabsRow}>
              <IconTab
                active={active === 'FAMILY'}
                label="Famílias"
                onPress={() => onNavigate('FAMILY')}
                icon={(c) => <FamilyIcon color={c} />}
              />
              <IconTab
                active={active === 'LISTS'}
                label="Listas"
                onPress={() => onNavigate('LISTS')}
                icon={(c) => <ListsIcon color={c} />}
              />
              <IconTab
                active={active === 'DASHBOARD'}
                label="Dashboard"
                onPress={() => onNavigate('DASHBOARD')}
                icon={(c) => <HomeIcon color={c} />}
              />
              <IconTab
                active={active === 'PROFILE'}
                label="Perfil"
                onPress={() => onNavigate('PROFILE')}
                icon={(c) => <ProfileIcon color={c} />}
              />
            </View>
          </View>
          <View style={styles.divider} />
        </BlurView>
      </View>
    </SafeAreaView>
  );
}

function IconTab({ active, label, icon, onPress }) {
  const color = active ? '#1E3A8A' : '#6B7280';
  return (
    <TouchableOpacity
      style={styles.iconTab}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="tab"
      accessibilityLabel={label}
    >
      {icon(color)}
      {active && <View style={styles.activeBar} />}
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
  wrapper: { width: '100%' },
  blur: { width: '100%' },
  topWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 10,
  },
  tabsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  iconTab: { paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center' },
  activeBar: {
    position: 'absolute',
    bottom: -2,
    height: 3,
    left: 8,
    right: 8,
    borderRadius: 2,
    backgroundColor: '#2563EB',
  },
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.07)', marginTop: 4 },
});
