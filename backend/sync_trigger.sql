-- 1. Create a trigger function that runs on auth.users inserts
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    role,
    phone,
    status,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'patient'),
    COALESCE(new.phone, new.raw_user_meta_data->>'phone', ''),
    'active',
    new.created_at,
    new.created_at
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Bind the function to the auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- NOTE: If there are existing users in auth.users that are not in public.profiles,
-- you can run the following backfill command to populate them:
--
-- INSERT INTO public.profiles (id, full_name, email, role, phone, status, created_at, updated_at)
-- SELECT 
--   id,
--   COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1)),
--   email,
--   COALESCE(raw_user_meta_data->>'role', 'patient'),
--   COALESCE(phone, raw_user_meta_data->>'phone', ''),
--   'active',
--   created_at,
--   created_at
-- FROM auth.users
-- ON CONFLICT (id) DO NOTHING;
