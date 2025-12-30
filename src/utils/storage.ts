import { supabase } from '../config/supabase';
import { Workout } from '../types/workout';

export const saveWorkout = async (workout: Workout): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Insert workout
    const { data: workoutData, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        id: workout.id,
        user_id: user.id,
        name: workout.name,
        date: workout.date,
      })
      .select()
      .single();

    if (workoutError) throw workoutError;

    // Insert exercises and sets
    for (let i = 0; i < workout.exercises.length; i++) {
      const exercise = workout.exercises[i];
      
      const { data: exerciseData, error: exerciseError } = await supabase
        .from('exercises')
        .insert({
          id: exercise.id,
          workout_id: workout.id,
          name: exercise.name,
          order_index: i,
        })
        .select()
        .single();

      if (exerciseError) throw exerciseError;

      // Insert sets for this exercise
      const setsToInsert = exercise.sets.map((set, setIndex) => ({
        exercise_id: exercise.id,
        weight: set.weight,
        reps: set.reps,
        order_index: setIndex,
      }));

      const { error: setsError } = await supabase
        .from('sets')
        .insert(setsToInsert);

      if (setsError) throw setsError;
    }
  } catch (error) {
    console.error('Error saving workout:', error);
    throw error;
  }
};

export const getWorkouts = async (): Promise<Workout[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Get workouts with exercises and sets
    const { data: workouts, error: workoutsError } = await supabase
      .from('workouts')
      .select(`
        *,
        exercises (
          *,
          sets (*)
        )
      `)
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (workoutsError) throw workoutsError;

    // Transform database structure to app structure
    return (workouts || []).map((workout: any) => ({
      id: workout.id,
      name: workout.name,
      date: workout.date,
      exercises: (workout.exercises || [])
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((exercise: any) => ({
          id: exercise.id,
          name: exercise.name,
          sets: (exercise.sets || [])
            .sort((a: any, b: any) => a.order_index - b.order_index)
            .map((set: any) => ({
              weight: set.weight,
              reps: set.reps,
            })),
        })),
    }));
  } catch (error) {
    console.error('Error loading workouts:', error);
    return [];
  }
};

export const deleteWorkout = async (workoutId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', workoutId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting workout:', error);
    throw error;
  }
};

export const updateWorkout = async (updatedWorkout: Workout): Promise<void> => {
  try {
    // Update workout details
    const { error: workoutError } = await supabase
      .from('workouts')
      .update({
        name: updatedWorkout.name,
        date: updatedWorkout.date,
      })
      .eq('id', updatedWorkout.id);

    if (workoutError) throw workoutError;

    // Delete all existing exercises and sets (cascading delete will handle sets)
    const { error: deleteError } = await supabase
      .from('exercises')
      .delete()
      .eq('workout_id', updatedWorkout.id);

    if (deleteError) throw deleteError;

    // Re-insert exercises and sets
    for (let i = 0; i < updatedWorkout.exercises.length; i++) {
      const exercise = updatedWorkout.exercises[i];
      
      const { data: exerciseData, error: exerciseError } = await supabase
        .from('exercises')
        .insert({
          id: exercise.id,
          workout_id: updatedWorkout.id,
          name: exercise.name,
          order_index: i,
        })
        .select()
        .single();

      if (exerciseError) throw exerciseError;

      // Insert sets for this exercise
      const setsToInsert = exercise.sets.map((set, setIndex) => ({
        exercise_id: exercise.id,
        weight: set.weight,
        reps: set.reps,
        order_index: setIndex,
      }));

      const { error: setsError } = await supabase
        .from('sets')
        .insert(setsToInsert);

      if (setsError) throw setsError;
    }
  } catch (error) {
    console.error('Error updating workout:', error);
    throw error;
  }
};

export const getWorkoutsByDate = async (date: string): Promise<Workout[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: workouts, error: workoutsError } = await supabase
      .from('workouts')
      .select(`
        *,
        exercises (
          *,
          sets (*)
        )
      `)
      .eq('user_id', user.id)
      .eq('date', date)
      .order('created_at', { ascending: false });

    if (workoutsError) throw workoutsError;

    // Transform database structure to app structure
    return (workouts || []).map((workout: any) => ({
      id: workout.id,
      name: workout.name,
      date: workout.date,
      exercises: (workout.exercises || [])
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((exercise: any) => ({
          id: exercise.id,
          name: exercise.name,
          sets: (exercise.sets || [])
            .sort((a: any, b: any) => a.order_index - b.order_index)
            .map((set: any) => ({
              weight: set.weight,
              reps: set.reps,
            })),
        })),
    }));
  } catch (error) {
    console.error('Error loading workouts by date:', error);
    return [];
  }
};

export const getMarkedDates = async (): Promise<Record<string, any>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {};

    const { data: workouts, error } = await supabase
      .from('workouts')
      .select('date')
      .eq('user_id', user.id);

    if (error) throw error;

    const marked: Record<string, any> = {};
    (workouts || []).forEach((workout: any) => {
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
