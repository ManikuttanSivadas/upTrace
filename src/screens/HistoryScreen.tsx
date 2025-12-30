import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Pressable, Alert, Image } from 'react-native';
import { useState, useEffect ,useCallback} from 'react';
import { Calendar } from 'react-native-calendars';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { COLORS } from '../theme/colors';
import { getWorkouts, getMarkedDates, getWorkoutsByDate, updateWorkout, deleteWorkout } from '../utils/storage';
import { Workout, Exercise, SetEntry } from '../types/workout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';

export default function HistoryScreen() {
  const { logout, user } = useAuth();
  const navigation = useNavigation();
  const [profilePicture, setProfilePicture] = useState('');
  const [userName, setUserName] = useState('');
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [workoutsForDate, setWorkoutsForDate] = useState<Workout[]>([]);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('profile_picture_url, name')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfilePicture(data.profile_picture_url || '');
        setUserName(data.name || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadMarkedDates = async () => {
    const marked = await getMarkedDates();
    setMarkedDates(marked);
  };

  const loadWorkoutsForDate = async (date: string) => {
    const workouts = await getWorkoutsByDate(date);
    setWorkoutsForDate(workouts);
    setSelectedDate(date);
    setExpandedWorkoutId(null); // Collapse all when switching dates
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
      {/* Header with avatar */}
      <View style={styles.headerSection}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>History</Text>
            <Text style={styles.userName}>Hello, {userName || user?.name}!</Text>
          </View>
          <Pressable onPress={() => navigation.navigate('EditProfile' as never)}>
            {profilePicture ? (
              <Image source={{ uri: profilePicture }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {userName?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.calendarContainer}>
          <Calendar
            theme={{
              calendarBackground: COLORS.surface,
              dayTextColor: COLORS.textPrimary,
              monthTextColor: COLORS.textPrimary,
              textMonthFontWeight: '600',
              textMonthFontSize: 18,
              arrowColor: COLORS.primary,
              todayTextColor: COLORS.primary,
              selectedDayBackgroundColor: COLORS.primary,
              selectedDayTextColor: '#FFFFFF',
              textDayFontSize: 15,
              textDisabledColor: COLORS.textSecondary,
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
            style={styles.calendar}
          />
        </View>

        {selectedDate && (
          <View style={styles.workoutsSection}>
            <Text style={styles.dateHeader}>
              {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>

            {workoutsForDate.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No workouts logged</Text>
                <Text style={styles.emptySubtext}>Start logging your workouts to see them here</Text>
              </View>
            ) : (
              workoutsForDate.map((workout) => {
                const isExpanded = expandedWorkoutId === workout.id;
                return (
                  <View key={workout.id} style={styles.workoutCard}>
                    <Pressable 
                      style={styles.workoutHeader}
                      onPress={() => setExpandedWorkoutId(isExpanded ? null : workout.id)}
                    >
                      <View style={styles.workoutHeaderLeft}>
                        <Text style={styles.workoutName}>{workout.name || 'Unnamed Workout'}</Text>
                        <Text style={styles.workoutSummary}>
                          {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
                        </Text>
                      </View>
                      <View style={styles.workoutHeaderRight}>
                        <View style={styles.workoutActions}>
                          <Pressable
                            style={styles.editWorkoutButton}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleEditWorkout(workout);
                            }}
                          >
                            <Text style={styles.editWorkoutButtonText}>✎</Text>
                          </Pressable>
                          <Pressable
                            style={styles.deleteWorkoutButton}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleDeleteWorkout(workout.id);
                            }}
                          >
                            <Text style={styles.deleteWorkoutButtonText}>×</Text>
                          </Pressable>
                        </View>
                        <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
                      </View>
                    </Pressable>
                    
                    {isExpanded && (
                      <>
                        <View style={styles.exercisesContainer}>
                          {workout.exercises.map((exercise) => (
                            <View key={exercise.id} style={styles.exerciseItem}>
                              <Text style={styles.exerciseName}>{exercise.name}</Text>
                              <View style={styles.setsContainer}>
                                {exercise.sets.map((set, idx) => (
                                  <Text key={idx} style={styles.setText}>
                                    Set {idx + 1}: {set.weight} kg × {set.reps} reps
                                  </Text>
                                ))}
                              </View>
                            </View>
                          ))}
                        </View>
                      </>
                    )}
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>

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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerSection: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: COLORS.background,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  calendarContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  calendar: {
    borderRadius: 16,
  },
  workoutsSection: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  dateHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: COLORS.surface,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  workoutCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  workoutHeaderLeft: {
    flex: 1,
  },
  workoutHeaderRight: {
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  workoutSummary: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  expandIcon: {
    fontSize: 16,
    color: COLORS.primary,
  },
  workoutActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editWorkoutButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editWorkoutButtonText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '400',
  },
  deleteWorkoutButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteWorkoutButtonText: {
    color: COLORS.danger,
    fontSize: 24,
    fontWeight: '300',
  },
  workoutName: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  exercisesContainer: {
    gap: 16,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  exerciseItem: {
    paddingLeft: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  exerciseName: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
  },
  setsContainer: {
    gap: 6,
  },
  setText: {
    color: COLORS.textSecondary,
    fontSize: 15,
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
    backgroundColor: COLORS.background,
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
    backgroundColor: COLORS.background,
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
