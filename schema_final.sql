-- FINAL CONSOLIDATED SCHEMA for Focus Buddy & Empire
-- Generated on 2026-02-13
-- This file represents the complete state of the Supabase database.

-- ==========================================
-- 1. EXTENSIONS & BASICS
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 2. TABLES & COLUMNS
-- ==========================================

-- FAMILIES
CREATE TABLE IF NOT EXISTS public.families (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    subscription_tier text CHECK (subscription_tier IN ('free', 'premium')) DEFAULT 'free',
    invite_code text, -- Added via patch
    status text DEFAULT 'active', -- Added via patch
    freeze_ends_at timestamptz, -- Added via patch
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- PROFILES (Extended)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY, -- Removed FK to auth.users during audit to allow virtual children
    role text CHECK (role IN ('parent', 'child')) NOT NULL,
    display_name text,
    avatar_url text,
    pin_hash text,
    coins integer DEFAULT 0, -- Added via patch
    streak_shields integer DEFAULT 0 CHECK (streak_shields <= 2), -- Added via patch
    last_shield_purchase timestamptz, -- Added via patch
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- FAMILY MEMBERS (The core relationship table)
CREATE TABLE IF NOT EXISTS public.family_members (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    family_id uuid REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
    auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable for virtual children
    role text CHECK (role IN ('parent', 'child')) NOT NULL,
    name text NOT NULL,
    pin text, -- Plaintext PIN for MVP (should be hashed in production)
    is_frozen boolean DEFAULT FALSE, -- Added via patch
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TASKS (Missions)
CREATE TABLE IF NOT EXISTS public.tasks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    family_id uuid REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
    assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    title text NOT NULL,
    description text,
    reward_coins integer DEFAULT 10,
    status text DEFAULT 'pending', -- pending, completed, approved, rejected
    created_at timestamptz DEFAULT now(),
    completed_at timestamptz
);

-- PETS
CREATE TABLE IF NOT EXISTS public.pets (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id uuid REFERENCES public.family_members(id) ON DELETE CASCADE NOT NULL UNIQUE, -- Unique constraint added
    name text NOT NULL DEFAULT 'Mika',
    species text NOT NULL DEFAULT 'cat',
    status text CHECK (status IN ('active', 'resting', 'frozen', 'sick')) DEFAULT 'active',
    level integer DEFAULT 1,
    xp integer DEFAULT 0,
    mood text DEFAULT 'neutral',
    last_interaction timestamptz DEFAULT now(),
    config jsonb DEFAULT '{}'::jsonb,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- OWNED BACKGROUNDS (Store)
CREATE TABLE IF NOT EXISTS public.owned_backgrounds (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    background_name text NOT NULL,
    is_active boolean DEFAULT FALSE,
    purchased_at timestamptz DEFAULT NOW(),
    UNIQUE(user_id, background_name)
);

-- STUDY LOGS (Bitácora)
CREATE TABLE IF NOT EXISTS public.study_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    subject text NOT NULL,
    notes text,
    duration_minutes integer,
    evidence_url text,
    created_at timestamptz DEFAULT now()
);

-- DISTRACTIONS
CREATE TABLE IF NOT EXISTS public.distractions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    session_id uuid,
    detected_at timestamptz DEFAULT now(),
    duration_seconds integer
);

-- USER PRESENCE
CREATE TABLE IF NOT EXISTS public.user_presence (
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    last_seen_at timestamptz DEFAULT now(),
    current_activity text,
    current_pet_mood text
);

-- FAMILY CHEERS (Messages)
CREATE TABLE IF NOT EXISTS public.family_cheers (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    from_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    to_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    message text NOT NULL,
    read boolean DEFAULT FALSE,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 3. FUNCTIONS & RPCs
-- ==========================================

-- Helper: Get My Family IDs (Security Definer to avoid recursion)
CREATE OR REPLACE FUNCTION public.get_my_family_ids()
RETURNS SETOF uuid LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT family_id FROM family_members WHERE auth_user_id = auth.uid();
$$;

-- Helper: Is Parent in Family (Security Definer)
CREATE OR REPLACE FUNCTION public.is_parent_in_family(_family_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM family_members 
    WHERE family_id = _family_id AND auth_user_id = auth.uid() AND role = 'parent'
  );
$$;

-- RPC: Award Coins Safely
CREATE OR REPLACE FUNCTION award_coins(p_user_id UUID, p_amount INT, p_pin TEXT DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_auth_user UUID;
  v_family_id UUID;
  v_target_family_id UUID;
  v_target_pin TEXT;
  v_is_authorized BOOLEAN := FALSE;
BEGIN
  IF p_amount <= 0 THEN RAISE EXCEPTION 'Amount must be positive'; END IF;
  SELECT family_id, pin INTO v_target_family_id, v_target_pin FROM family_members WHERE id = p_user_id;
  IF v_target_family_id IS NULL THEN RAISE EXCEPTION 'User not found'; END IF;

  v_auth_user := auth.uid();
  IF v_auth_user IS NOT NULL THEN
      IF v_auth_user = p_user_id THEN v_is_authorized := TRUE;
      ELSE
          SELECT family_id INTO v_family_id FROM family_members WHERE auth_user_id = v_auth_user LIMIT 1;
          IF v_family_id = v_target_family_id THEN v_is_authorized := TRUE; END IF;
      END IF;
  END IF;

  IF NOT v_is_authorized AND p_pin IS NOT NULL THEN
      IF v_target_pin = p_pin THEN v_is_authorized := TRUE; END IF;
  END IF;

  IF NOT v_is_authorized THEN RAISE EXCEPTION 'Access Denied'; END IF;

  UPDATE profiles SET coins = coins + p_amount WHERE id = p_user_id;
END;
$$;

-- Trigger: Create Pet for New Child
CREATE OR REPLACE FUNCTION create_pet_for_new_child() RETURNS trigger AS $$
BEGIN
  IF new.role = 'child' THEN
    INSERT INTO public.pets (owner_id, name) VALUES (new.id, new.name || '''s Pet') ON CONFLICT (owner_id) DO NOTHING;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_create_pet ON public.family_members;
CREATE TRIGGER tr_create_pet AFTER INSERT ON public.family_members FOR EACH ROW EXECUTE FUNCTION create_pet_for_new_child();

-- ==========================================
-- 4. ROW LEVEL SECURITY (POLICIES)
-- ==========================================

-- Enable RLS everywhere
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE owned_backgrounds ENABLE ROW LEVEL SECURITY;

-- FAMILIES & MEMBERS ("Nuclear" Fixed Policies)
-- Allow authenticated insert for families
CREATE POLICY "Enable insert for authenticated users only" ON "public"."families" AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (true);
-- Read families I belong to
CREATE POLICY "Enable read access for family members" ON "public"."families" AS PERMISSIVE FOR SELECT TO authenticated USING (id IN (SELECT public.get_my_family_ids()));

-- Members Read
CREATE POLICY "Enable read access for family members" ON "public"."family_members" AS PERMISSIVE FOR SELECT TO authenticated USING (family_id IN (SELECT public.get_my_family_ids()) OR auth_user_id = auth.uid());
-- Members Insert Self
CREATE POLICY "Enable insert for self" ON "public"."family_members" AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (auth_user_id = auth.uid());
-- Members Insert Others (Parents only)
CREATE POLICY "Enable insert for parents" ON "public"."family_members" AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (public.is_parent_in_family(family_id));
-- Members Update/Delete (Parents only)
CREATE POLICY "Enable update for parents" ON "public"."family_members" AS PERMISSIVE FOR UPDATE TO authenticated USING (public.is_parent_in_family(family_id));

-- PROFILES
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert/update own profile" ON profiles FOR ALL USING (auth.uid() = id OR id IN (SELECT id FROM family_members WHERE auth_user_id = auth.uid()));

-- PETS
CREATE POLICY "Ver mascotas de mi familia" ON pets FOR SELECT USING (true); -- Simplified for MVP
CREATE POLICY "Modificar mascotas" ON pets FOR ALL USING (true);

-- TASKS
CREATE POLICY "Users can view family tasks" ON tasks FOR SELECT USING (auth.uid() IN (SELECT auth_user_id FROM family_members WHERE family_id = tasks.family_id));
CREATE POLICY "Parents can create tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() IN (SELECT auth_user_id FROM family_members WHERE family_id = tasks.family_id AND role = 'parent'));
CREATE POLICY "Users can update tasks" ON tasks FOR UPDATE USING (auth.uid() IN (SELECT auth_user_id FROM family_members WHERE family_id = tasks.family_id));

-- STORE
CREATE POLICY "Users can view own backgrounds" ON owned_backgrounds FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own backgrounds" ON owned_backgrounds FOR ALL USING (auth.uid() = user_id);

-- EVIDENCE (Storage)
-- Allow public uploads/reads for evidence bucket (covers children on shared devices)
INSERT INTO storage.buckets (id, name, public) VALUES ('evidence', 'evidence', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public users can upload evidence" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'evidence');
CREATE POLICY "Anyone can view evidence" ON storage.objects FOR SELECT TO public USING (bucket_id = 'evidence');

-- ==========================================
-- 5. REALTIME PUBLICATION
-- ==========================================
ALTER PUBLICATION supabase_realtime ADD TABLE tasks, distractions, user_presence, study_logs, family_cheers, family_members, families, profiles;
