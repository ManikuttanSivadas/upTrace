import { View, Text, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import * as Crypto from 'expo-crypto';
import { useNavigation } from '@react-navigation/native';
import StepIndicator from '../components/StepIndicator';
import WorkoutDetailsStep from '../components/WorkoutDetailsStep';
import ExercisesStep from '../components/ExercisesStep';
import { Workout } from '../types/workout';
import { COLORS } from '../theme/colors';
import { saveWorkout as saveWorkoutToStorage } from '../utils/storage';

export default function LogWorkoutScreen() {
  const today = new Date().toISOString().split('T')[0];
  const navigation = useNavigation();

  const [step, setStep] = useState(1);
  const [workout, setWorkout] = useState<Workout>({
    id: Crypto.randomUUID(),
    date: today,
    name: '',
    exercises: [],
  });

  const saveWorkout = async () => {
    try {
      await saveWorkoutToStorage(workout);
      
      // Reset the form
      setStep(1);
      setWorkout({
        id: Crypto.randomUUID(),
        date: today,
        name: '',
        exercises: [],
      });

      // Show success message and navigate to History
      Alert.alert(
        'Workout Saved!',
        'Your workout has been saved successfully.',
        [
          {
            text: 'View History',
            onPress: () => navigation.navigate('History' as never),
          },
          {
            text: 'Log Another',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save workout. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Log Workout</Text>
      <StepIndicator step={step} />

      {step === 1 && (
        <WorkoutDetailsStep
          workoutName={workout.name}
          workoutDate={workout.date}
          setWorkoutName={(v) => setWorkout({ ...workout, name: v })}
          setWorkoutDate={(v) => setWorkout({ ...workout, date: v })}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <ExercisesStep
          exercises={workout.exercises}
          setExercises={(v) => setWorkout({ ...workout, exercises: v })}
          onSave={saveWorkout}
        />
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
});
