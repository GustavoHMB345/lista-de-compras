

import { useRef, useState } from 'react';
import { Dimensions, FlatList, View } from 'react-native';
import NavBar from '../components/NavBar';
import DashboardScreen from '../screens/DashboardScreen';
import FamilyScreen from '../screens/FamilyScreen';
import ListsScreen from '../screens/ListsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const { width } = Dimensions.get('window');

const screens = [
  { key: 'DASHBOARD', component: DashboardScreen },
  { key: 'FAMILY', component: FamilyScreen },
  { key: 'LISTS', component: ListsScreen },
  { key: 'PROFILE', component: ProfileScreen },
];

export default function SwipeNavigator() {
  const flatListRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNavBar = (screenKey) => {
    const idx = screens.findIndex(s => s.key === screenKey);
    if (idx !== -1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index: idx, animated: true });
    }
  };

  const onMomentumScrollEnd = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(idx);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#23232B' }}>
      <FlatList
        ref={flatListRef}
        data={screens}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.key}
        renderItem={({ item }) => (
          <View style={{ flex: 1, width }}>
            <item.component />
          </View>
        )}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        initialScrollIndex={0}
        extraData={activeIndex}
      />
      <NavBar
        navigate={handleNavBar}
        activeScreen={screens[activeIndex].key}
        onAddList={() => {
          if (flatListRef.current) flatListRef.current.scrollToIndex({ index: 2, animated: true });
        }}
      />
    </View>
  );
}
