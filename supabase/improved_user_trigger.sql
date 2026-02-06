-- Improved handle_new_user function with better error handling
-- Run this in Supabase SQL Editor to replace the existing function

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create user profile if email is available
  IF NEW.email IS NOT NULL AND NEW.email != '' THEN
    INSERT INTO public.users (id, email, name, credits, plan)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'User'),
      0,  -- Free users get 0 credits
      'free'  -- Free plan
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  RETURN NEW;
EXCEPTION 
  WHEN OTHERS THEN
    -- Log the error but don't prevent user creation in auth.users
    RAISE LOG 'Failed to create user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();