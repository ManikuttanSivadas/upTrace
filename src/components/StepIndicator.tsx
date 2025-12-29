import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

export default function StepIndicator({ step }: { step: number }) {
  return (
    <View style={styles.container}>
      {[1, 2].map((num) => (
        <View key={num} style={styles.step}>
          <View style={[styles.circle, step === num && styles.active]}>
            <Text style={styles.text}>{num}</Text>
          </View>
          {num === 1 && <View style={styles.line} />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', marginBottom: 20 },
  step: { flexDirection: 'row', alignItems: 'center' },
  circle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: { backgroundColor: COLORS.primary },
  line: { width: 40, height: 2, backgroundColor: COLORS.border },
  text: { color: COLORS.textPrimary, fontWeight: '600' },
});
