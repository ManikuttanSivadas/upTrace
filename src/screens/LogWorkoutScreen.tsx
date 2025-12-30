import { View, Text, StyleSheet, Alert, Pressable, Image } from 'react-native';
import { useState, useEffect } from 'react';
import * as Crypto from 'expo-crypto';
import { useNavigation } from '@react-navigation/native';
import StepIndicator from '../components/StepIndicator';
import WorkoutDetailsStep from '../components/WorkoutDetailsStep';
import ExercisesStep from '../components/ExercisesStep';
import { Workout } from '../types/workout';
import { COLORS } from '../theme/colors';
import { saveWorkout as saveWorkoutToStorage } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';

export default function LogWorkoutScreen() {
  const today = new Date().toISOString().split('T')[0];
  const navigation = useNavigation();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [profilePicture, setProfilePicture] = useState('');
  const [userName, setUserName] = useState('');
  const [workout, setWorkout] = useState<Workout>({
    id: Crypto.randomUUID(),
    date: today,
    name: '',
    exercises: [],
  });

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

  const saveWorkout = async () => {
    // Validate that there are exercises with sets
    if (workout.exercises.length === 0) {
      Alert.alert(
        'No Exercises',
        'Please add at least one exercise with sets before saving your workout.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Validate that all exercises have at least one set
    const hasEmptyExercises = workout.exercises.some(
      (exercise) => exercise.sets.length === 0
    );

    if (hasEmptyExercises) {
      Alert.alert(
        'Incomplete Exercise',
        'All exercises must have at least one set with weight and reps.',
        [{ text: 'OK' }]
      );
      return;
    }

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
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Log Workout</Text>
        <Pressable 
          style={styles.avatarButton}
          onPress={() => navigation.navigate('Profile' as never)}
        >
          {profilePicture ? (
            <Image source={{ uri: profilePicture }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {userName.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
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
          onBack={() => setStep(1)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 60, backgroundColor: COLORS.background },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  header: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '600',
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
