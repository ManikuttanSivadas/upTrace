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
    padding: 18,
    borderRadius: 18,
  },
  label: { color: COLORS.textSecondary, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    padding: 14,
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  text: { color: COLORS.textPrimary },
  button: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
});
