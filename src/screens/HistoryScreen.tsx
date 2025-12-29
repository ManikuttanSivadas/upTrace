import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useEffect ,useCallback} from 'react';
import { Calendar } from 'react-native-calendars';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../theme/colors';
import { getWorkouts, getMarkedDates, getWorkoutsByDate } from '../utils/storage';
import { Workout } from '../types/workout';

export default function HistoryScreen() {
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [workoutsForDate, setWorkoutsForDate] = useState<Workout[]>([]);

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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Workout History</Text>

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
                <Text style={styles.workoutName}>{workout.name || 'Unnamed Workout'}</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: COLORS.background },
  header: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
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
  workoutName: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
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
});
