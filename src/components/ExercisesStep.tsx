import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import * as Crypto from 'expo-crypto';
import { Exercise } from '../types/workout';
import { COLORS } from '../theme/colors';

export default function ExercisesStep({
  exercises,
  setExercises,
  onSave,
  onBack,
}: {
  exercises: Exercise[];
  setExercises: (v: Exercise[]) => void;
  onSave: () => void;
  onBack: () => void;
}) {
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [current, setCurrent] = useState<Exercise | null>(null);
  const [isNameSubmitted, setIsNameSubmitted] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [editingSetIndex, setEditingSetIndex] = useState<number | null>(null);

  const submitName = () => {
    if (!name.trim()) return;
    setIsNameSubmitted(true);
  };

  const addSet = () => {
    if (!name || !weight || !reps) return;
    const set = { weight: +weight, reps: +reps };

    if (editingSetIndex !== null) {
      // Update existing set
      if (!current) return;
      const updatedSets = [...current.sets];
      updatedSets[editingSetIndex] = set;
      setCurrent({ ...current, sets: updatedSets });
      setEditingSetIndex(null);
    } else {
      // Add new set
      setCurrent(
        current
          ? { ...current, sets: [...current.sets, set] }
          : { id: Crypto.randomUUID(), name, sets: [set] }
      );
    }

    setWeight('');
    setReps('');
  };

  const completeExercise = () => {
    if (!current) return;
    setExercises([...exercises, current]);
    setCurrent(null);
    setName('');
    setIsNameSubmitted(false);
    setEditingSetIndex(null);
  };

  const deleteExercise = (exerciseId: string) => {
    setExercises(exercises.filter((ex) => ex.id !== exerciseId));
  };

  const editExercise = (exercise: Exercise) => {
    // Remove from completed list
    setExercises(exercises.filter((ex) => ex.id !== exercise.id));
    // Set as current exercise for editing
    setCurrent(exercise);
    setName(exercise.name);
    setIsNameSubmitted(true);
    setEditingSetIndex(null);
  };

  const deleteSet = (setIndex: number) => {
    if (!current) return;
    const updatedSets = current.sets.filter((_, i) => i !== setIndex);
    if (updatedSets.length === 0) {
      // If no sets left, clear the current exercise
      setCurrent(null);
      setName('');
      setIsNameSubmitted(false);
      setEditingSetIndex(null);
    } else {
      setCurrent({ ...current, sets: updatedSets });
    }
  };

  const startEditSet = (setIndex: number) => {
    if (!current) return;
    const set = current.sets[setIndex];
    setWeight(set.weight.toString());
    setReps(set.reps.toString());
    setEditingSetIndex(setIndex);
  };

  const cancelEditSet = () => {
    setWeight('');
    setReps('');
    setEditingSetIndex(null);
  };

  const handleBack = () => {
    if (exercises.length > 0 || current) {
      Alert.alert(
        'Discard Changes?',
        'Going back will clear all unsaved exercises. Are you sure?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              setExercises([]);
              setCurrent(null);
              setName('');
              setWeight('');
              setReps('');
              setIsNameSubmitted(false);
              setEditingSetIndex(null);
              onBack();
            },
          },
        ]
      );
    } else {
      onBack();
    }
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
          editable={!isNameSubmitted}
        />
        
        {!isNameSubmitted && name.trim() && (
          <Pressable style={styles.fullButton} onPress={submitName}>
            <Text style={styles.buttonText}>Start Exercise</Text>
          </Pressable>
        )}

        {isNameSubmitted && (
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
            <View style={styles.buttonRow}>
              <Pressable style={styles.button} onPress={addSet}>
                <Text style={styles.buttonText}>
                  {editingSetIndex !== null ? 'Update Set' : 'Add Set'}
                </Text>
              </Pressable>
              {editingSetIndex !== null && (
                <Pressable style={styles.cancelButton} onPress={cancelEditSet}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </Pressable>
              )}
            </View>
          </>
        )}
      </View>

      {current && (
        <View style={styles.card}>
          <Text style={styles.currentExerciseTitle}>Current: {current.name}</Text>
          {current.sets.map((s, i) => (
            <View key={i} style={styles.setRow}>
              <Pressable 
                style={[styles.setTextContainer, editingSetIndex === i && styles.setTextContainerEditing]}
                onPress={() => startEditSet(i)}
              >
                <Text style={styles.setText}>
                  Set {i + 1} • {s.weight}kg × {s.reps}
                </Text>
                {editingSetIndex !== i && (
                  <Text style={styles.editHint}>Tap to edit</Text>
                )}
              </Pressable>
              <Pressable
                style={styles.deleteSetButton}
                onPress={() => deleteSet(i)}
              >
                <Text style={styles.deleteSetText}>×</Text>
              </Pressable>
            </View>
          ))}
          <Pressable style={styles.fullButton} onPress={completeExercise}>
            <Text style={styles.buttonText}>Complete Exercise</Text>
          </Pressable>
        </View>
      )}

      {exercises.length > 0 && (
        <View style={styles.completedSection}>
          <Text style={styles.completedTitle}>Completed Exercises</Text>
          {exercises.map((exercise, idx) => (
            <View key={exercise.id} style={styles.completedCard}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseName}>
                  {idx + 1}. {exercise.name}
                </Text>
                <View style={styles.actionButtons}>
                  <Pressable
                    style={styles.editButton}
                    onPress={() => editExercise(exercise)}
                  >
                    <Text style={styles.editButtonText}>Edit</Text>
                  </Pressable>
                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => deleteExercise(exercise.id)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </Pressable>
                </View>
              </View>
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

      <Pressable style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backButtonText}>Back to Details</Text>
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
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  setTextContainer: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceLight,
  },
  setTextContainerEditing: {
    backgroundColor: COLORS.primary + '20',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  setText: { 
    color: COLORS.textSecondary,
  },
  editHint: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
  },
  deleteSetButton: {
    backgroundColor: COLORS.danger,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteSetText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  fullButton: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: COLORS.textSecondary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
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
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseName: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  save: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  backButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonText: { 
    color: '#FFFFFF', 
    fontWeight: '600',
    fontSize: 16,
  },
});
