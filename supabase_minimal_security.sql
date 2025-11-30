-- ============================================
-- MINIMAL SECURITY FIXES FOR DEVELOPMENT
-- Execute these now, they won't break anything
-- ============================================

-- 1. FIX: Restrict profile visibility to authenticated users only
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;

CREATE POLICY "Authenticated users can view profiles." ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- 2. FIX: Ensure UPDATE policy has WITH CHECK clause
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;

CREATE POLICY "Users can update own profile." ON profiles
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- That's it! These 2 fixes are safe and important.
-- The other fixes in supabase_security_fixes.sql can wait until production.
