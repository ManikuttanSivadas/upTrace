export type SetEntry = {
  weight: number;
  reps: number;
};

export type Exercise = {
  id: string;
  name: string;
  sets: SetEntry[];
};

export type Workout = {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  exercises: Exercise[];
};
