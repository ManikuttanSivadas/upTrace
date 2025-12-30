import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { COLORS } from '../theme/colors';

type Props = {
  workoutName: string;
  workoutDate: string;
  setWorkoutName: (v: string) => void;
  setWorkoutDate: (v: string) => void;
  onNext: () => void;
};

export default function WorkoutDetailsStep({
  workoutName,
  workoutDate,
  setWorkoutName,
  setWorkoutDate,
  onNext,
}: Props) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Workout Date</Text>

      <Pressable style={styles.input} onPress={() => setShowPicker(true)}>
        <Text style={styles.text}>
          {new Date(workoutDate).toDateString()}
        </Text>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={new Date(workoutDate)}
          mode="date"
          maximumDate={new Date()}
          onChange={(_, d) => {
            setShowPicker(false);
            if (d) setWorkoutDate(d.toISOString().split('T')[0]);
          }}
        />
      )}

      <Text style={styles.label}>Workout Name</Text>

      <TextInput
        value={workoutName}
        onChangeText={setWorkoutName}
        placeholder="Push Day, Pull Day..."
        placeholderTextColor={COLORS.textSecondary}
        style={styles.input}
      />

      <Pressable
        style={[styles.button, !workoutName && { opacity: 0.4 }]}
        onPress={onNext}
        disabled={!workoutName}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    padding: 35,
    paddingHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    width: '100%',
  },
  label: {
    color: COLORS.textSecondary,
    marginBottom: 10,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 14,
    padding: 18,
    color: COLORS.textPrimary,
    marginBottom: 24,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  text: {
    color: COLORS.textPrimary,
    fontSize: 16,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
