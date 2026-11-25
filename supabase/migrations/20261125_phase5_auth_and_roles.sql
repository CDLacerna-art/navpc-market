-- ==============================================================================
-- NavPC Market — Phase 5: Authentication & Role-Based Access Migration
-- ==============================================================================
-- NOTICE:
-- This migration script must be executed directly in the Supabase SQL Editor
-- by a project owner or administrator. Do NOT run it via the Supabase CLI
-- migrate command against a production database without review.
--
-- It establishes the profiles table, Row Level Security policies, strict
-- institutional email domain validation, automatic profile provisioning
-- triggers, role elevation controls, and minimum-privilege EXECUTE grants.
--
-- SECURITY DEFINER SEARCH PATH HARDENING:
-- All SECURITY DEFINER functions explicitly declare:
--   SET search_path = ''
-- and fully qualify schema references (pg_catalog, public, auth) to prevent
-- search path hijacking. Note that standard SQL special expressions (such as
-- COALESCE, NULLIF, EXISTS) are syntactic constructs, not schema-qualified functions.
--
-- ROLE ELEVATION CONTEXT:
-- auth.uid() IS NULL indicates the absence of an authenticated user JWT in the
-- request context (such as direct administrative sessions in the Supabase SQL
-- Editor or direct server-side database connections). auth.uid() IS NULL does
-- NOT independently grant permissions; the PostgreSQL database role privileges
-- (e.g. postgres admin role) authorize the connection itself.
--
-- DOMAIN NOTE:
-- The allowed email domain is set to 'navotaspolytechniccollege.edu.ph'.
-- Before deploying to a live Supabase project, verify that this domain
-- matches the actual institutional email domain in use. It is currently
-- used only as the basis for an academic prototype and has not been
-- confirmed as the operational domain of Navotas Polytechnic College.
-- ==============================================================================


-- =============================================================================
-- SECTION 1 — Allowed-domain configuration helper
-- =============================================================================
-- Centralises the required institutional domain in one place.
-- Hardened with SET search_path = '' and explicit pg_catalog qualification.

CREATE OR REPLACE FUNCTION public.get_allowed_email_domain()
  RETURNS text
  LANGUAGE sql
  IMMUTABLE
  SECURITY DEFINER
  SET search_path = ''
AS $$
  SELECT 'navotaspolytechniccollege.edu.ph'::pg_catalog.text;
$$;

-- Restrict EXECUTE: only functions that call it internally need access.
REVOKE EXECUTE ON FUNCTION public.get_allowed_email_domain() FROM PUBLIC;


-- =============================================================================
-- SECTION 2 — Strict institutional email validation (BEFORE INSERT on auth.users)
-- =============================================================================
-- Uses character classes [^@[:space:]] and [.] to eliminate regex escaping
-- ambiguities across PostgreSQL client environments.
-- Pattern enforces:
--   1) At least one non-@ non-whitespace character before the @
--   2) Exactly one @ character
--   3) The exact allowed domain with literal dot matching via [.]
--   4) Case-insensitive evaluation via pg_catalog.lower(NEW.email)

CREATE OR REPLACE FUNCTION public.validate_institutional_email()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
AS $$
DECLARE
  allowed_domain pg_catalog.text := public.get_allowed_email_domain();
  domain_pattern pg_catalog.text;
BEGIN
  -- Safe regex pattern with character class for dot literal to avoid escape issues
  domain_pattern :=
    '^[^@[:space:]]+@'
    || pg_catalog.replace(allowed_domain, '.', '[.]')
    || '$';

  IF NEW.email IS NULL OR pg_catalog.lower(NEW.email) !~ domain_pattern THEN
    RAISE EXCEPTION
      'Registration rejected: email must match institutional domain @%. Malformed addresses (multiple @ signs, whitespace, or non-institutional domains) are not accepted.',
      allowed_domain;
  END IF;

  RETURN NEW;
END;
$$;

-- Revoke execute from PUBLIC; trigger invokes function via trigger mechanism
REVOKE EXECUTE ON FUNCTION public.validate_institutional_email() FROM PUBLIC;

DROP TRIGGER IF EXISTS tr_validate_institutional_email ON auth.users;
CREATE TRIGGER tr_validate_institutional_email
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_institutional_email();


-- =============================================================================
-- SECTION 3 — profiles table
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text        NOT NULL,
  email       text        NOT NULL,
  role        text        NOT NULL DEFAULT 'buyer'
                          CHECK (role IN ('buyer', 'seller', 'admin')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Index for role-based lookups used in RLS policies
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ---------------------------------------------------------------------------
-- Column-level privilege hardening
-- ---------------------------------------------------------------------------
-- Revoke all table-level privileges, then grant narrow column-level access.
-- RLS restricts which ROWS may be updated; column grants restrict which COLUMNS.
-- Ordinary authenticated users are granted UPDATE only on full_name.
-- Role updates cannot be made via standard API calls by authenticated users;
-- administrative role changes are performed via authorized administrative SQL
-- sessions, with the prevent_profile_role_update() trigger providing defense in depth.

REVOKE ALL ON public.profiles FROM PUBLIC;
REVOKE ALL ON public.profiles FROM authenticated;
REVOKE ALL ON public.profiles FROM anon;

-- authenticated users may SELECT rows permitted by RLS (own profile, or all if admin)
GRANT SELECT ON public.profiles TO authenticated;

-- authenticated users may only write to full_name (no direct column update on role)
GRANT UPDATE (full_name) ON public.profiles TO authenticated;

-- anon users have NO privileges on public.profiles (no email or profile exposure)


-- =============================================================================
-- SECTION 4 — Automatic profile provisioning (AFTER INSERT on auth.users)
-- =============================================================================
-- ALWAYS assigns role = 'buyer', strictly ignoring user_metadata role values.
-- COALESCE and NULLIF are SQL special expressions; pg_catalog.btrim is used for trimming.

CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(
        pg_catalog.btrim(NEW.raw_user_meta_data->>'full_name'),
        ''
      ),
      'Student Buyer'
    ),
    NEW.email,
    'buyer',   -- Hardcoded: ALWAYS 'buyer' regardless of signup metadata
    pg_catalog.now(),
    pg_catalog.now()
  );
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- =============================================================================
-- SECTION 5 — Role immutability guard (BEFORE UPDATE on public.profiles)
-- =============================================================================
-- Blocks any UPDATE that modifies the 'role' column unless:
--   1) Operating without an authenticated end-user JWT context (auth.uid() IS NULL),
--      such as direct queries run by authorized database administrators in the
--      Supabase SQL Editor (authorized by PostgreSQL connection credentials); OR
--   2) Called by an existing authenticated platform administrator (public.is_admin()).
--
-- End-user JWT sessions (buyers, sellers) have auth.uid() IS NOT NULL and
-- will be rejected with an exception if they attempt to change any role.

CREATE OR REPLACE FUNCTION public.prevent_profile_role_update()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Clarification on auth.uid() IS NULL:
    -- In the Supabase SQL Editor or direct psql connections, queries run in a database
    -- administration context where no end-user JWT is present (auth.uid() IS NULL).
    -- auth.uid() IS NULL does NOT grant authority on its own; the caller's database
    -- role privileges authorize the operation. When an end-user sends an API request,
    -- auth.uid() is populated, and non-admins are rejected here.
    IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
      RAISE EXCEPTION 'Unauthorized: role changes are restricted to administrators.';
    END IF;
  END IF;

  NEW.updated_at := pg_catalog.now();
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.prevent_profile_role_update() FROM PUBLIC;

DROP TRIGGER IF EXISTS tr_prevent_profile_role_update ON public.profiles;
CREATE TRIGGER tr_prevent_profile_role_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_role_update();


-- =============================================================================
-- SECTION 6 — is_admin() security-definer helper
-- =============================================================================
-- Evaluates whether the calling JWT session belongs to a profile with role = 'admin'.
-- Hardened with SET search_path = '' and fully qualified object references.

CREATE OR REPLACE FUNCTION public.is_admin()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.is_admin() TO authenticated;


-- =============================================================================
-- SECTION 7 — Row Level Security (RLS) on public.profiles
-- =============================================================================
-- Access Matrix:
--   anon           → Zero access (no public exposure of institutional emails)
--   authenticated  → SELECT own profile row; SELECT all profile rows if admin
--                    UPDATE own profile (full_name only via column grant; role cannot be updated via API)
--                    UPDATE any profile (full_name only for admins via RLS; role updates require direct SQL session)

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy A: Authenticated user can read their own profile row
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Policy B: Admin can read all profile rows
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Policy C: Authenticated user can update their own profile row
DROP POLICY IF EXISTS "Users can update own profile non-role" ON public.profiles;
CREATE POLICY "Users can update own profile non-role"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING  (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Policy D: Admin can update any profile row
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

-- Policy E (REMOVED): "Public can view seller profiles"
-- Guaranteed removed to protect institutional email addresses from anonymous enumeration.
-- Phase 6 will introduce a dedicated seller_stores table for public merchant info.
DROP POLICY IF EXISTS "Public can view seller profiles" ON public.profiles;


-- =============================================================================
-- SECTION 8 — SQL REGEX & VALIDATION TEST SUITE (Verification Query Block)
-- =============================================================================
-- The following test queries can be run in the Supabase SQL Editor to verify
-- regex evaluation behavior against simulated inputs.
-- NOTE: These are standalone test expressions; do not claim live Supabase
-- registration has been tested until performed manually by a human administrator.
--
-- TEST 1: Valid institutional email
-- SELECT ('juan.delacruz@navotaspolytechniccollege.edu.ph' ~* ('^[^@[:space:]]+@' || replace('navotaspolytechniccollege.edu.ph', '.', '[.]') || '$')) AS test_valid_passed;
-- Expected: true
--
-- TEST 2: Personal Gmail address
-- SELECT ('juan.delacruz@gmail.com' ~* ('^[^@[:space:]]+@' || replace('navotaspolytechniccollege.edu.ph', '.', '[.]') || '$')) AS test_gmail_rejected;
-- Expected: false
--
-- TEST 3: Multiple '@' characters (malformed)
-- SELECT ('juan@delacruz@navotaspolytechniccollege.edu.ph' ~* ('^[^@[:space:]]+@' || replace('navotaspolytechniccollege.edu.ph', '.', '[.]') || '$')) AS test_multiple_at_rejected;
-- Expected: false
--
-- TEST 4: Whitespace in email address
-- SELECT ('juan delacruz@navotaspolytechniccollege.edu.ph' ~* ('^[^@[:space:]]+@' || replace('navotaspolytechniccollege.edu.ph', '.', '[.]') || '$')) AS test_whitespace_rejected;
-- Expected: false
--
-- TEST 5: NULL email expression behavior
-- Note: This test verifies SQL NULL expression evaluation only. It does not execute
-- the database trigger or prove live registration rejection (which is handled by
-- the explicit 'IF NEW.email IS NULL' guard in validate_institutional_email()).
-- SELECT (NULL ~* ('^[^@[:space:]]+@' || replace('navotaspolytechniccollege.edu.ph', '.', '[.]') || '$')) IS NULL AS test_null_expression_behavior;
-- Expected: true (in SQL, regex matching against NULL evaluates to NULL)
-- ==============================================================================
