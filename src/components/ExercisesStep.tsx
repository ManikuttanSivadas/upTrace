import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useState } from 'react';
import * as Crypto from 'expo-crypto';
import { Exercise } from '../types/workout';
import { COLORS } from '../theme/colors';

export default function ExercisesStep({
  exercises,
  setExercises,
  onSave,
}: {
  exercises: Exercise[];
  setExercises: (v: Exercise[]) => void;
  onSave: () => void;
}) {
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [current, setCurrent] = useState<Exercise | null>(null);

  const addSet = () => {
    if (!name || !weight || !reps) return;
    const set = { weight: +weight, reps: +reps };

    setCurrent(
      current
        ? { ...current, sets: [...current.sets, set] }
        : { id: Crypto.randomUUID(), name, sets: [set] }
    );

    setWeight('');
    setReps('');
  };

  const completeExercise = () => {
    if (!current) return;
    setExercises([...exercises, current]);
    setCurrent(null);
    setName('');
  };

  return (
    <View>
      <View style={styles.card}>
        <TextInput
          placeholder="Exercise name"
          placeholderTextColor={COLORS.textSecondary}
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        
        {name.trim() && (
          <>
            <TextInput
              placeholder="Weight (kg)"
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
              style={styles.input}
            />
            <TextInput
              placeholder="Reps"
              keyboardType="numeric"
              value={reps}
              onChangeText={setReps}
              style={styles.input}
            />
            <Pressable style={styles.button} onPress={addSet}>
              <Text style={styles.buttonText}>Add Set</Text>
            </Pressable>
          </>
        )}
      </View>

      {current && (
        <View style={styles.card}>
          <Text style={styles.currentExerciseTitle}>Current: {current.name}</Text>
          {current.sets.map((s, i) => (
            <Text key={i} style={styles.setText}>
              Set {i + 1} • {s.weight}kg × {s.reps}
            </Text>
          ))}
          <Pressable style={styles.button} onPress={completeExercise}>
            <Text style={styles.buttonText}>Complete Exercise</Text>
          </Pressable>
        </View>
      )}

      {exercises.length > 0 && (
        <View style={styles.completedSection}>
          <Text style={styles.completedTitle}>Completed Exercises</Text>
          {exercises.map((exercise, idx) => (
            <View key={exercise.id} style={styles.completedCard}>
              <Text style={styles.exerciseName}>
                {idx + 1}. {exercise.name}
              </Text>
              {exercise.sets.map((s, i) => (
                <Text key={i} style={styles.setText}>
                  Set {i + 1} • {s.weight}kg × {s.reps}
                </Text>
              ))}
            </View>
          ))}
        </View>
      )}

      <Pressable style={styles.save} onPress={onSave}>
        <Text style={styles.buttonText}>Save Workout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
  },
  input: {
    backgroundColor: COLORS.surfaceLight,
    padding: 14,
    borderRadius: 12,
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  currentExerciseTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  setText: { color: COLORS.textSecondary, marginBottom: 6 },
  button: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  completedSection: {
    marginBottom: 16,
  },
  completedTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  completedCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  exerciseName: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  save: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
});
