import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import TabBar from '../components/TabBar';

export default function PriceHistoryScreen() {
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

	return (
		<Screen tabBarPosition="bottom" tabBarHeight={56} overlayTabBar overlayBottomSpacer={24}>
			<TabBar active={undefined} onNavigate={handleNavigate} position="bottom" />
			<View style={styles.center}>
				<Text style={styles.text}>Histórico de preços – em construção</Text>
			</View>
		</Screen>
	);
}

const styles = StyleSheet.create({
	center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
	text: { color: '#374151' },
});
