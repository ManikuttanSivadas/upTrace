import AsyncStorage from '@react-native-async-storage/async-storage';
import { Workout } from '../types/workout';

const WORKOUTS_KEY = '@upTrace:workouts';

export const saveWorkout = async (workout: Workout): Promise<void> => {
  try {
    const workouts = await getWorkouts();
    const updatedWorkouts = [workout, ...workouts];
    await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(updatedWorkouts));
  } catch (error) {
    console.error('Error saving workout:', error);
    throw error;
  }
};

export const getWorkouts = async (): Promise<Workout[]> => {
  try {
    const data = await AsyncStorage.getItem(WORKOUTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading workouts:', error);
    return [];
  }
};

export const deleteWorkout = async (workoutId: string): Promise<void> => {
  try {
    const workouts = await getWorkouts();
    const updatedWorkouts = workouts.filter((w) => w.id !== workoutId);
    await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(updatedWorkouts));
  } catch (error) {
    console.error('Error deleting workout:', error);
    throw error;
  }
};

export const getWorkoutsByDate = async (date: string): Promise<Workout[]> => {
  try {
    const workouts = await getWorkouts();
    return workouts.filter((w) => w.date === date);
  } catch (error) {
    console.error('Error loading workouts by date:', error);
    return [];
  }
};

export const getMarkedDates = async (): Promise<Record<string, any>> => {
  try {
    const workouts = await getWorkouts();
    const marked: Record<string, any> = {};
    
    workouts.forEach((workout) => {
      if (!marked[workout.date]) {
        marked[workout.date] = {
          marked: true,
          dotColor: '#FF3B30',
        };
      }
    });
    
    return marked;
  } catch (error) {
    console.error('Error getting marked dates:', error);
    return {};
  }
};
