-- ============================================
-- SECURITY FIXES FOR AUTHENTICATION SYSTEM
-- ============================================

-- 1. FIX: Restrict profile visibility to authenticated users only
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;

-- Create a more restrictive policy
-- Option A: Only authenticated users can view profiles
CREATE POLICY "Authenticated users can view profiles." ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Option B: Users can only view their own profile (most restrictive)
-- Uncomment this if you want maximum privacy
-- CREATE POLICY "Users can view own profile." ON profiles
--   FOR SELECT USING (auth.uid() = id);

-- 2. FIX: Ensure UPDATE policy has WITH CHECK clause (if not already fixed)
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;

CREATE POLICY "Users can update own profile." ON profiles
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. SECURITY: Add constraint to prevent role escalation
-- Users should not be able to change their own role to 'admin'
-- This requires a separate admin function, but we can add a check

-- Create a function to validate role changes
CREATE OR REPLACE FUNCTION check_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If role is being changed and user is not a superuser
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    -- Only allow if the user making the change is an admin
    IF (SELECT role FROM profiles WHERE id = auth.uid()) != 'admin' THEN
      RAISE EXCEPTION 'Only administrators can change user roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach the trigger
DROP TRIGGER IF EXISTS validate_role_change ON profiles;
CREATE TRIGGER validate_role_change
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_role_change();

-- 4. SECURITY: Add password policy in Supabase Auth
-- Note: This must be configured in Supabase Dashboard under Authentication > Policies
-- Recommended settings:
-- - Minimum password length: 8 characters
-- - Require uppercase: Yes
-- - Require lowercase: Yes  
-- - Require numbers: Yes
-- - Require special characters: Optional

-- 5. SECURITY: Enable email confirmation
-- Note: Configure in Supabase Dashboard under Authentication > Settings
-- - Enable email confirmations
-- - Set redirect URL for email confirmation

-- 6. OPTIONAL: Add rate limiting table for additional protection
CREATE TABLE IF NOT EXISTS login_attempts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  attempted_at timestamp with time zone DEFAULT now(),
  success boolean DEFAULT false
);

-- Enable RLS on login_attempts
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- Only allow inserts (for logging)
CREATE POLICY "Anyone can log attempts" ON login_attempts
  FOR INSERT WITH CHECK (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_time 
  ON login_attempts(email, attempted_at DESC);

-- Function to check rate limiting (optional - implement in app logic)
CREATE OR REPLACE FUNCTION check_rate_limit(user_email text)
RETURNS boolean AS $$
DECLARE
  attempt_count integer;
BEGIN
  -- Count failed attempts in last 15 minutes
  SELECT COUNT(*) INTO attempt_count
  FROM login_attempts
  WHERE email = user_email
    AND attempted_at > now() - interval '15 minutes'
    AND success = false;
  
  -- Return true if under limit (5 attempts)
  RETURN attempt_count < 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
