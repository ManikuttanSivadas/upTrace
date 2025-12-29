import 'react-native-gesture-handler';

import { View, StatusBar } from 'react-native';
import BottomTabs from './src/navigation/BottomTabs';
import { COLORS } from './src/theme/colors';

export default function App() {
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar barStyle="light-content" />
      <BottomTabs />
    </View>
  );
}
