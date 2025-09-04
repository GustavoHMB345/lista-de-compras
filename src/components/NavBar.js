import { LinearGradient } from 'expo-linear-gradient';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { PlusIcon } from './Icons';

const GradientIcon = ({ children, active }) => (
    <LinearGradient
        colors={active ? ['#6C7DFF', '#4F46E5'] : ['#7C7C8A', '#23232B']}
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
            <Path d="M3 11.5L12 4l9 7.5" stroke={active ? '#fff' : '#BDBDBD'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M5 10.5V20a1 1 0 001 1h3.5a1 1 0 001-1v-4h2v4a1 1 0 001 1H18a1 1 0 001-1v-9.5" stroke={active ? '#fff' : '#BDBDBD'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    </GradientIcon>
);
const FamilyIcon = ({ active }) => (
    <GradientIcon active={active}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Circle cx={8} cy={8} r={3} stroke={active ? '#fff' : '#BDBDBD'} strokeWidth={2} />
            <Circle cx={16} cy={8} r={3} stroke={active ? '#fff' : '#BDBDBD'} strokeWidth={2} />
            <Path d="M2 20c0-3.3137 3.134-6 7-6s7 2.6863 7 6" stroke={active ? '#fff' : '#BDBDBD'} strokeWidth={2} />
            <Path d="M14 20c0-2.2091 2.239-4 5-4s5 1.7909 5 4" stroke={active ? '#fff' : '#BDBDBD'} strokeWidth={2} />
        </Svg>
    </GradientIcon>
);
const ListIcon = ({ active }) => (
    <GradientIcon active={active}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path d="M6 6h13M6 12h13M6 18h13" stroke={active ? '#fff' : '#BDBDBD'} strokeWidth={2} strokeLinecap="round" />
            <Circle cx={3} cy={6} r={1} fill={active ? '#fff' : '#BDBDBD'} />
            <Circle cx={3} cy={12} r={1} fill={active ? '#fff' : '#BDBDBD'} />
            <Circle cx={3} cy={18} r={1} fill={active ? '#fff' : '#BDBDBD'} />
        </Svg>
    </GradientIcon>
);
const ProfileIcon = ({ active }) => (
    <GradientIcon active={active}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={8} r={4} stroke={active ? '#fff' : '#BDBDBD'} strokeWidth={2} />
            <Path d="M4 20c0-3.3137 3.582-6 8-6s8 2.6863 8 6" stroke={active ? '#fff' : '#BDBDBD'} strokeWidth={2} />
        </Svg>
    </GradientIcon>
);

export default function NavBar({ navigate, activeScreen, onAddList }) {
    return (
        <SafeAreaView edges={['bottom']} style={styles.navBarSafeAreaCustom}>
            <View style={styles.navBarContainerCustom}>
                <TouchableOpacity style={styles.navBarItemCustom} onPress={() => navigate('DASHBOARD')} activeOpacity={0.7}>
                    <HomeIcon active={activeScreen === 'DASHBOARD'} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navBarItemCustom} onPress={() => navigate('FAMILY')} activeOpacity={0.7}>
                    <FamilyIcon active={activeScreen === 'FAMILY'} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navBarCenterBtnCustom} onPress={onAddList} activeOpacity={0.85}>
                    <PlusIcon />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navBarItemCustom} onPress={() => navigate('LISTS')} activeOpacity={0.7}>
                    <ListIcon active={activeScreen === 'LISTS'} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navBarItemCustom} onPress={() => navigate('PROFILE')} activeOpacity={0.7}>
                    <ProfileIcon active={activeScreen === 'PROFILE'} />
                </TouchableOpacity>
            </View>
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
        marginHorizontal: 18,
        marginBottom: Platform.OS === 'ios' ? 18 : 12,
        paddingHorizontal: 18,
        paddingTop: 8,
        paddingBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
        elevation: 10,
    },
    navBarItemCustom: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
    },
    navBarCenterBtnCustom: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#6C7DFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#6C7DFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 12,
        alignSelf: 'center',
    },
    iconWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    iconActiveWrap: {
        shadowColor: '#6C7DFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 8,
        elevation: 8,
        backgroundColor: 'rgba(108,125,255,0.08)',
    },
});
