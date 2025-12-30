import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

export default function StepIndicator({ step }: { step: number }) {
  const steps = [
    { num: 1, label: 'Details' },
    { num: 2, label: 'Exercises' },
  ];

  return (
    <View style={styles.container}>
      {steps.map((s, idx) => (
        <View key={s.num} style={styles.stepWrapper}>
          <View style={styles.stepContent}>
            <View style={[styles.circle, step >= s.num && styles.active, step === s.num && styles.current]}>
              {step > s.num ? (
                <Text style={styles.checkmark}>✓</Text>
              ) : (
                <Text style={[styles.text, step >= s.num && styles.activeText]}>{s.num}</Text>
              )}
            </View>
            <Text style={[styles.label, step >= s.num && styles.activeLabel]}>{s.label}</Text>
          </View>
          {idx === 0 && (
            <View style={styles.lineContainer}>
              <View style={[styles.line, step > 1 && styles.activeLine]} />
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 30,
    marginTop: 0,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepContent: {
    alignItems: 'center',
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  active: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  current: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  text: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '700',
  },
  activeText: {
    color: '#FFFFFF',
  },
  checkmark: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activeLabel: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  lineContainer: {
    paddingHorizontal: 0,
    paddingBottom: 26,
    width: 80,
  },
  line: {
    height: 3,
    backgroundColor: COLORS.border,
    width: 80,
    borderRadius: 2,
  },
  activeLine: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
});
