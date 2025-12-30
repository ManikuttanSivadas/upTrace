# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or login
3. Click "New Project"
4. Fill in:
   - Project name: `upTrace`
   - Database password: (save this securely)
   - Region: Choose closest to your users
5. Wait for project to initialize (~2 minutes)

## 2. Get API Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (under Project API keys)
3. Open `src/config/supabase.ts` in this project
4. Replace:
   ```typescript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```
   with your actual values

## 3. Create Database Tables

In your Supabase dashboard, go to **SQL Editor** and run this SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workouts table
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exercises table
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sets table
CREATE TABLE sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  weight NUMERIC NOT NULL,
  reps INTEGER NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE sets ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Workouts policies
CREATE POLICY "Users can view own workouts"
  ON workouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts"
  ON workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts"
  ON workouts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts"
  ON workouts FOR DELETE
  USING (auth.uid() = user_id);

-- Exercises policies
CREATE POLICY "Users can view own exercises"
  ON exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own exercises"
  ON exercises FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own exercises"
  ON exercises FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own exercises"
  ON exercises FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

-- Sets policies
CREATE POLICY "Users can view own sets"
  ON sets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM exercises
      JOIN workouts ON workouts.id = exercises.workout_id
      WHERE exercises.id = sets.exercise_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own sets"
  ON sets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exercises
      JOIN workouts ON workouts.id = exercises.workout_id
      WHERE exercises.id = sets.exercise_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own sets"
  ON sets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM exercises
      JOIN workouts ON workouts.id = exercises.workout_id
      WHERE exercises.id = sets.exercise_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own sets"
  ON sets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM exercises
      JOIN workouts ON workouts.id = exercises.workout_id
      WHERE exercises.id = sets.exercise_id
      AND workouts.user_id = auth.uid()
    )
  );

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User')
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX workouts_user_id_idx ON workouts(user_id);
CREATE INDEX workouts_date_idx ON workouts(date);
CREATE INDEX exercises_workout_id_idx ON exercises(workout_id);
CREATE INDEX sets_exercise_id_idx ON sets(exercise_id);
```

## 4. Test the Connection

After setting up your credentials in `src/config/supabase.ts`:
1. Restart the Expo development server
2. Try signing up a new user
3. Check the **Authentication** > **Users** section in Supabase dashboard
4. Check the **Table Editor** to see if the profile was created

## Database Schema

```
auth.users (Supabase managed)
  └── profiles (user details)

workouts
  ├── user_id → auth.users.id
  └── exercises
      └── sets
```

## Security

- **Row Level Security (RLS)** is enabled on all tables
- Users can only access their own data
- Policies enforce user_id = auth.uid() checks
- All operations are scoped to authenticated user

## Next Steps

After completing this setup, the app will:
- ✅ Store user auth in Supabase
- ✅ Sync workouts across devices
- ✅ Persist data in cloud
- ✅ Support real-time updates (future enhancement)
