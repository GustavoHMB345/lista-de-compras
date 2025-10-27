import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import TabBar from '../components/TabBar';
import { useTheme } from '../components/theme';

export default function PriceHistoryScreen() {
	const router = useRouter();
	const { tokens: t } = useTheme();
  const [measuredH, setMeasuredH] = useState(null);
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

	return (
		<Screen
		  tabBarPosition="bottom"
		  tabBarHeight={56}
		  overlayTabBar
		  overlayBottomSpacer={24}
		  scrollEndFromCardHeight={
		    measuredH
		      ? { cardHeight: measuredH, factor: 0.35, gap: 10, min: 16, max: 36 }
		      : { cardHeight: 160, factor: 0.35, gap: 10, min: 16, max: 36 }
		  }
		>
			<TabBar active={undefined} onNavigate={handleNavigate} position="bottom" />
			<View
			  style={styles.center}
			  onLayout={!measuredH ? (e) => setMeasuredH(Math.round(e.nativeEvent.layout.height)) : undefined}
			>
				<Text style={[styles.text, { color: t.text }]}>Histórico de preços – em construção</Text>
			</View>
		</Screen>
	);
}

const styles = StyleSheet.create({
	center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
	text: { color: '#374151' },
});
