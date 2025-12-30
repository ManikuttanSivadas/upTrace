import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Pressable, Alert } from 'react-native';
import { useState, useEffect ,useCallback} from 'react';
import { Calendar } from 'react-native-calendars';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../theme/colors';
import { getWorkouts, getMarkedDates, getWorkoutsByDate, updateWorkout, deleteWorkout } from '../utils/storage';
import { Workout, Exercise, SetEntry } from '../types/workout';
import { useAuth } from '../contexts/AuthContext';

export default function HistoryScreen() {
  const { logout, user } = useAuth();
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [workoutsForDate, setWorkoutsForDate] = useState<Workout[]>([]);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const loadMarkedDates = async () => {
    const marked = await getMarkedDates();
    setMarkedDates(marked);
  };

  const loadWorkoutsForDate = async (date: string) => {
    const workouts = await getWorkoutsByDate(date);
    setWorkoutsForDate(workouts);
    setSelectedDate(date);
  };

  useFocusEffect(
    useCallback(() => {
      loadMarkedDates();
      if (selectedDate) {
        loadWorkoutsForDate(selectedDate);
      }
    }, [selectedDate])
  );

  const handleDayPress = (day: any) => {
    loadWorkoutsForDate(day.dateString);
  };

  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkout(JSON.parse(JSON.stringify(workout))); // Deep copy
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingWorkout) return;
    
    // Validate that no sets have empty or 0 values
    const hasInvalidSets = editingWorkout.exercises.some((exercise) =>
      exercise.sets.some((set) => 
        (set.weight === 0 || !set.weight) && 
        (set.reps === 0 || !set.reps)
      )
    );

    if (hasInvalidSets) {
      Alert.alert(
        'Invalid Data',
        'Please ensure all sets have weight and reps greater than 0, or delete the empty sets.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Validate that exercises have names
    const hasEmptyExerciseName = editingWorkout.exercises.some(
      (exercise) => !exercise.name || exercise.name.trim() === ''
    );

    if (hasEmptyExerciseName) {
      Alert.alert(
        'Missing Exercise Name',
        'Please provide a name for all exercises.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    try {
      await updateWorkout(editingWorkout);
      setEditModalVisible(false);
      setEditingWorkout(null);
      loadMarkedDates();
      if (selectedDate) {
        loadWorkoutsForDate(selectedDate);
      }
      Alert.alert('Success', 'Workout updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update workout');
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWorkout(workoutId);
              loadMarkedDates();
              if (selectedDate) {
                loadWorkoutsForDate(selectedDate);
              }
              Alert.alert('Success', 'Workout deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete workout');
            }
          },
        },
      ]
    );
  };

  const updateExerciseName = (exerciseId: string, newName: string) => {
    if (!editingWorkout) return;
    setEditingWorkout({
      ...editingWorkout,
      exercises: editingWorkout.exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, name: newName } : ex
      ),
    });
  };

  const updateSet = (exerciseId: string, setIndex: number, field: 'weight' | 'reps', value: string) => {
    if (!editingWorkout) return;
    setEditingWorkout({
      ...editingWorkout,
      exercises: editingWorkout.exercises.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((set, idx) =>
                idx === setIndex ? { ...set, [field]: parseFloat(value) || 0 } : set
              ),
            }
          : ex
      ),
    });
  };

  const deleteExercise = (exerciseId: string) => {
    if (!editingWorkout) return;
    
    const exercise = editingWorkout.exercises.find((ex) => ex.id === exerciseId);
    const exerciseName = exercise?.name || 'this exercise';
    
    Alert.alert(
      'Delete Exercise',
      `Are you sure you want to delete ${exerciseName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setEditingWorkout({
              ...editingWorkout,
              exercises: editingWorkout.exercises.filter((ex) => ex.id !== exerciseId),
            });
          },
        },
      ]
    );
  };

  const deleteSet = (exerciseId: string, setIndex: number) => {
    if (!editingWorkout) return;
    setEditingWorkout({
      ...editingWorkout,
      exercises: editingWorkout.exercises.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, sets: ex.sets.filter((_, idx) => idx !== setIndex) }
          : ex
      ).filter((ex) => ex.sets.length > 0), // Remove exercise if no sets left
    });
  };

  const addSetToExercise = (exerciseId: string) => {
    if (!editingWorkout) return;
    const newSet: SetEntry = { weight: '' as any, reps: '' as any };
    setEditingWorkout({
      ...editingWorkout,
      exercises: editingWorkout.exercises.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, sets: [...ex.sets, newSet] }
          : ex
      ),
    });
  };

  const addNewExercise = () => {
    if (!editingWorkout) return;
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: '',
      sets: [{ weight: '' as any, reps: '' as any }],
    };
    setEditingWorkout({
      ...editingWorkout,
      exercises: [...editingWorkout.exercises, newExercise],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Workout History</Text>
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </Pressable>
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.userText}>Welcome, {user?.name}!</Text>
      </View>

      <Calendar
        theme={{
          calendarBackground: COLORS.background,
          dayTextColor: COLORS.textPrimary,
          monthTextColor: COLORS.textPrimary,
          arrowColor: COLORS.primary,
          todayTextColor: COLORS.primary,
          selectedDayBackgroundColor: COLORS.primary,
          selectedDayTextColor: '#FFFFFF',
        }}
        markedDates={{
          ...markedDates,
          ...(selectedDate && {
            [selectedDate]: {
              ...markedDates[selectedDate],
              selected: true,
              selectedColor: COLORS.primary,
            },
          }),
        }}
        onDayPress={handleDayPress}
      />

      {selectedDate && (
        <ScrollView style={styles.workoutsContainer}>
          <Text style={styles.dateHeader}>
            Workouts on {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>

          {workoutsForDate.length === 0 ? (
            <Text style={styles.emptyText}>No workouts logged for this date</Text>
          ) : (
            workoutsForDate.map((workout) => (
              <View key={workout.id} style={styles.workoutCard}>
                <View style={styles.workoutHeader}>
                  <Text style={styles.workoutName}>{workout.name || 'Unnamed Workout'}</Text>
                  <View style={styles.workoutActions}>
                    <Pressable
                      style={styles.editWorkoutButton}
                      onPress={() => handleEditWorkout(workout)}
                    >
                      <Text style={styles.editWorkoutButtonText}>Edit</Text>
                    </Pressable>
                    <Pressable
                      style={styles.deleteWorkoutButton}
                      onPress={() => handleDeleteWorkout(workout.id)}
                    >
                      <Text style={styles.deleteWorkoutButtonText}>Delete</Text>
                    </Pressable>
                  </View>
                </View>
                <View style={styles.exercisesContainer}>
                  {workout.exercises.map((exercise) => (
                    <View key={exercise.id} style={styles.exerciseItem}>
                      <Text style={styles.exerciseName}>{exercise.name}</Text>
                      <View style={styles.setsContainer}>
                        {exercise.sets.map((set, index) => (
                          <Text key={index} style={styles.setText}>
                            Set {index + 1}: {set.weight}kg × {set.reps} reps
                          </Text>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <Modal
        visible={editModalVisible}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Workout</Text>
            <Pressable onPress={() => setEditModalVisible(false)}>
              <Text style={styles.modalClose}>×</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            {editingWorkout && (
              <>
                <Text style={styles.modalLabel}>Workout Name</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editingWorkout.name}
                  onChangeText={(text) => setEditingWorkout({ ...editingWorkout, name: text })}
                  placeholder="Workout name"
                  placeholderTextColor={COLORS.textSecondary}
                />

                <Text style={styles.modalSectionTitle}>Exercises</Text>
                {editingWorkout.exercises.map((exercise, exIdx) => (
                  <View key={exercise.id} style={styles.modalExerciseCard}>
                    <View style={styles.modalExerciseHeader}>
                      <TextInput
                        style={styles.modalExerciseNameInput}
                        value={exercise.name}
                        onChangeText={(text) => updateExerciseName(exercise.id, text)}
                        placeholder="Exercise name"
                        placeholderTextColor={COLORS.textSecondary}
                      />
                      <Pressable
                        style={styles.modalDeleteButton}
                        onPress={() => deleteExercise(exercise.id)}
                      >
                        <Text style={styles.modalDeleteButtonText}>Delete</Text>
                      </Pressable>
                    </View>

                    {exercise.sets.map((set, setIdx) => (
                      <View key={setIdx} style={styles.modalSetRow}>
                        <Text style={styles.modalSetLabel}>Set {setIdx + 1}</Text>
                        <TextInput
                          style={styles.modalSetInput}
                          value={set.weight === 0 ? '' : set.weight.toString()}
                          onChangeText={(text) => updateSet(exercise.id, setIdx, 'weight', text)}
                          keyboardType="numeric"
                          placeholder="Weight"
                          placeholderTextColor={COLORS.textSecondary}
                        />
                        <Text style={styles.modalSetText}>kg ×</Text>
                        <TextInput
                          style={styles.modalSetInput}
                          value={set.reps === 0 ? '' : set.reps.toString()}
                          onChangeText={(text) => updateSet(exercise.id, setIdx, 'reps', text)}
                          keyboardType="numeric"
                          placeholder="Reps"
                          placeholderTextColor={COLORS.textSecondary}
                        />
                        <Text style={styles.modalSetText}>reps</Text>
                        <Pressable
                          style={styles.modalDeleteSetButton}
                          onPress={() => deleteSet(exercise.id, setIdx)}
                        >
                          <Text style={styles.modalDeleteSetText}>×</Text>
                        </Pressable>
                      </View>
                    ))}
                    
                    <Pressable
                      style={styles.modalAddSetButton}
                      onPress={() => addSetToExercise(exercise.id)}
                    >
                      <Text style={styles.modalAddSetButtonText}>+ Add Set</Text>
                    </Pressable>
                  </View>
                ))}

                <Pressable style={styles.modalAddExerciseButton} onPress={addNewExercise}>
                  <Text style={styles.modalAddExerciseButtonText}>+ Add Exercise</Text>
                </Pressable>
              </>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable style={styles.modalCancelButton} onPress={() => setEditModalVisible(false)}>
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.modalSaveButton} onPress={handleSaveEdit}>
              <Text style={styles.modalSaveButtonText}>Save Changes</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: COLORS.background },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  header: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  userInfo: {
    marginBottom: 16,
  },
  userText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  workoutsContainer: {
    marginTop: 20,
    flex: 1,
  },
  dateHeader: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
  workoutCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editWorkoutButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editWorkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteWorkoutButton: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deleteWorkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  workoutName: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  exercisesContainer: {
    gap: 12,
  },
  exerciseItem: {
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  exerciseName: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
  },
  setsContainer: {
    gap: 4,
  },
  setText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '600',
  },
  modalClose: {
    color: COLORS.textPrimary,
    fontSize: 32,
    fontWeight: '300',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalLabel: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: COLORS.surface,
    color: COLORS.textPrimary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  modalSectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 12,
  },
  modalExerciseCard: {
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  modalExerciseHeader: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  modalExerciseNameInput: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    color: COLORS.textPrimary,
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  modalDeleteButton: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  modalDeleteButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modalSetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  modalSetLabel: {
    color: COLORS.textPrimary,
    fontSize: 14,
    width: 50,
  },
  modalSetInput: {
    backgroundColor: COLORS.surfaceLight,
    color: COLORS.textPrimary,
    padding: 8,
    borderRadius: 6,
    fontSize: 14,
    width: 60,
    textAlign: 'center',
  },
  modalSetText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  modalDeleteSetButton: {
    backgroundColor: COLORS.danger,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDeleteSetText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalAddSetButton: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  modalAddSetButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalAddExerciseButton: {
    backgroundColor: COLORS.success,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  modalAddExerciseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalSaveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
