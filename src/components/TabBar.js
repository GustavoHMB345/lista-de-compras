import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

// Simple, solid TabBar (top or bottom). Props: active, onNavigate(screen), tint, position
export default function TabBar({
  active,
  onNavigate,
  onAddList,
  tint = 'light',
  position = 'bottom',
}) {
  return (
    <SafeAreaView
      edges={position === 'top' ? ['top'] : ['bottom']}
      style={[styles.safe, position === 'bottom' ? styles.safeBottom : null]}
    >
      {/* Top fade to improve contrast when content is light under the bar */}
      {position === 'bottom' ? (
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.9)"]}
          style={styles.topFade}
        />
      ) : null}
      <View style={[styles.bar, position === 'top' ? styles.barTop : styles.barBottom]}>
        {/* Notch behind the floating action button */}
        {typeof onAddList === 'function' ? <View style={styles.fabNotch} /> : null}
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
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.fabPlus}>
                <View style={styles.plusBarV} />
                <View style={styles.plusBarH} />
              </View>
            </TouchableOpacity>
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
      </View>
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
  safeBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 50 },
  topFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 56, // approximate bar height; gradient sits just above the bar
    height: 20,
    zIndex: 49,
  },
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
  fabNotch: {
    position: 'absolute',
    top: -18,
    alignSelf: 'center',
    width: 70,
    height: 36,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    zIndex: 51,
  },
  barTop: {
    borderTopWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowOffset: { width: 0, height: 2 },
  },
  barBottom: {},
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  iconTab: { paddingHorizontal: 16, paddingVertical: 6, alignItems: 'center' },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginHorizontal: 6,
    elevation: 8,
    shadowColor: '#0B0B0B',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabPlus: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusBarV: { position: 'absolute', width: 4, height: 22, borderRadius: 2, backgroundColor: '#fff' },
  plusBarH: { position: 'absolute', height: 4, width: 22, borderRadius: 2, backgroundColor: '#fff' },
  activeDot: {
    marginTop: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
  },
});
