-- Fix the profiles update policy to allow upsert operations
-- Drop the existing update policy
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;

-- Create a new update policy that works with upsert
CREATE POLICY "Users can update own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ensure insert policy exists and is correct
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;

CREATE POLICY "Users can insert their own profile." ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
