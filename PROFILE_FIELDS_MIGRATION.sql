-- Add additional profile fields
ALTER TABLE profiles
ADD COLUMN gender TEXT,
ADD COLUMN mobile_number TEXT,
ADD COLUMN date_of_birth DATE,
ADD COLUMN profile_picture_url TEXT;

-- Update the trigger function to handle new fields
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
