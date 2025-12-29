import { View, Text } from 'react-native';
import { COLORS } from '../theme/colors';

export default function TimerScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: COLORS.textPrimary }}>
        Timer coming soon ⏱️
      </Text>
    </View>
  );
}
