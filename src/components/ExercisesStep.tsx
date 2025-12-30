import { View, Text, TextInput, Pressable, StyleSheet, Alert, ScrollView } from 'react-native';
import { useState, useRef } from 'react';
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
  const scrollViewRef = useRef<ScrollView>(null);

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
    
    // Scroll to top after completing exercise
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
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
    
    // Auto scroll to top to show the exercise inputs
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
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
    
    // Auto scroll to top to show the edit inputs
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
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
    <ScrollView 
      ref={scrollViewRef}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
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
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
              style={styles.input}
            />
            <TextInput
              placeholder="Reps"
              keyboardType="numeric"
              placeholderTextColor={COLORS.textSecondary}
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
                    <Text style={styles.editButtonText}>✎</Text>
                  </Pressable>
                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => deleteExercise(exercise.id)}
                  >
                    <Text style={styles.deleteButtonText}>×</Text>
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

      {(isNameSubmitted || exercises.length > 0) && (
        <Pressable style={styles.save} onPress={onSave}>
          <Text style={styles.buttonText}>Save Workout</Text>
        </Pressable>
      )}

      <Pressable style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backButtonText}>Back to Details</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    backgroundColor: COLORS.surfaceLight,
    padding: 16,
    borderRadius: 14,
    color: COLORS.textPrimary,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  currentExerciseTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  setTextContainer: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  setTextContainerEditing: {
    backgroundColor: COLORS.primary + '15',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  setText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  editHint: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 4,
  },
  deleteSetButton: {
    backgroundColor: COLORS.danger,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  deleteSetText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  fullButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  cancelButton: {
    backgroundColor: COLORS.textSecondary,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    flex: 1,
  },
  completedSection: {
    marginBottom: 16,
  },
  completedTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  completedCard: {
    backgroundColor: COLORS.surface,
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseName: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '400',
  },
  deleteButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: COLORS.danger,
    fontSize: 24,
    fontWeight: '300',
  },
  save: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  backButton: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginTop: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.5,
  },
});
