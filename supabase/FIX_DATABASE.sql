-- ============================================================
--  Z I R V A   D A T A B A S E   F I X
-- ============================================================
--  Run this in Supabase → SQL Editor to fix every ❌ from the audit.
--
--  Safe to re-run — every CREATE uses IF NOT EXISTS / OR REPLACE.
--  After running, re-run DATABASE_AUDIT.sql to confirm all green.
-- ============================================================

-- ───────────────────────────────────────────────
-- 1.  MISSING TABLE: contact_submissions
--     Used by the public contact form on /contact
-- ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  email       text NOT NULL,
  phone       text,
  message     text NOT NULL,
  source      text DEFAULT 'website',
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Defensive backfill (skipped if columns already exist)
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS name       text;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS email      text;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS phone      text;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS message    text;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS source     text DEFAULT 'website';
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone (including unauthenticated visitors) can insert a submission
DROP POLICY IF EXISTS "anyone_can_submit_contact" ON public.contact_submissions;
CREATE POLICY "anyone_can_submit_contact"
  ON public.contact_submissions FOR INSERT
  TO public
  WITH CHECK (true);

-- Only admins can read submissions
DROP POLICY IF EXISTS "admin_can_read_contact" ON public.contact_submissions;
CREATE POLICY "admin_can_read_contact"
  ON public.contact_submissions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- ───────────────────────────────────────────────
-- 2.  MISSING TABLE: pt_slots (parent-teacher slots)
--     The DB has 'ptc_slots' but code queries 'pt_slots'.
--     If ptc_slots already has data, rename it; else create fresh.
-- ───────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ptc_slots')
     AND NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pt_slots')
  THEN
    -- Rename existing ptc_slots → pt_slots so code starts working without data loss
    ALTER TABLE public.ptc_slots RENAME TO pt_slots;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.pt_slots (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  teacher_id  uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  date        date NOT NULL,
  time        time NOT NULL,
  status      text DEFAULT 'open',          -- open | booked | cancelled
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Backfill columns if the table was renamed from ptc_slots and had a different shape
ALTER TABLE public.pt_slots ADD COLUMN IF NOT EXISTS school_id  uuid REFERENCES public.schools(id) ON DELETE CASCADE;
ALTER TABLE public.pt_slots ADD COLUMN IF NOT EXISTS teacher_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.pt_slots ADD COLUMN IF NOT EXISTS parent_id  uuid REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.pt_slots ADD COLUMN IF NOT EXISTS date       date;
ALTER TABLE public.pt_slots ADD COLUMN IF NOT EXISTS time       time;
ALTER TABLE public.pt_slots ADD COLUMN IF NOT EXISTS status     text DEFAULT 'open';
ALTER TABLE public.pt_slots ADD COLUMN IF NOT EXISTS notes      text;
ALTER TABLE public.pt_slots ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

ALTER TABLE public.pt_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "school_members_read_pt_slots" ON public.pt_slots;
CREATE POLICY "school_members_read_pt_slots"
  ON public.pt_slots FOR SELECT
  USING (school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "teacher_admin_write_pt_slots" ON public.pt_slots;
CREATE POLICY "teacher_admin_write_pt_slots"
  ON public.pt_slots FOR ALL
  USING (
    school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher','admin'))
  );

DROP POLICY IF EXISTS "parent_book_pt_slots" ON public.pt_slots;
CREATE POLICY "parent_book_pt_slots"
  ON public.pt_slots FOR UPDATE
  USING (
    school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid())
    AND status = 'open'
  );


-- ───────────────────────────────────────────────
-- 3.  MISSING TABLE: timetable
--     Code uses .from('timetable').select('subject_id')...
--     This is a school-wide weekly schedule master.
-- ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.timetable (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id    uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id     uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id   uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  teacher_id   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  day_of_week  smallint CHECK (day_of_week BETWEEN 0 AND 6),
  start_time   time,
  end_time     time,
  room         text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Defensive backfill
ALTER TABLE public.timetable ADD COLUMN IF NOT EXISTS school_id   uuid REFERENCES public.schools(id) ON DELETE CASCADE;
ALTER TABLE public.timetable ADD COLUMN IF NOT EXISTS class_id    uuid REFERENCES public.classes(id) ON DELETE CASCADE;
ALTER TABLE public.timetable ADD COLUMN IF NOT EXISTS subject_id  uuid REFERENCES public.subjects(id) ON DELETE SET NULL;
ALTER TABLE public.timetable ADD COLUMN IF NOT EXISTS teacher_id  uuid REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.timetable ADD COLUMN IF NOT EXISTS day_of_week smallint;
ALTER TABLE public.timetable ADD COLUMN IF NOT EXISTS start_time  time;
ALTER TABLE public.timetable ADD COLUMN IF NOT EXISTS end_time    time;
ALTER TABLE public.timetable ADD COLUMN IF NOT EXISTS room        text;
ALTER TABLE public.timetable ADD COLUMN IF NOT EXISTS created_at  timestamptz DEFAULT now();

ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "school_members_read_timetable" ON public.timetable;
CREATE POLICY "school_members_read_timetable"
  ON public.timetable FOR SELECT
  USING (school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "admin_write_timetable" ON public.timetable;
CREATE POLICY "admin_write_timetable"
  ON public.timetable FOR ALL
  USING (
    school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ───────────────────────────────────────────────
-- 4.  MISSING COLUMN: schools.blocked
--     Used by admin Schools page to disable a school.
-- ───────────────────────────────────────────────
ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS blocked boolean NOT NULL DEFAULT false;


-- ───────────────────────────────────────────────
-- 5.  CRITICAL: auth → profile auto-creation
--     Without this trigger, sign-ups don't create a profile row.
-- ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, language, avatar_color, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'language', 'az'),
    -- pick a pastel avatar color based on user id hash
    (ARRAY['#7c6ee0','#5db8a3','#e8a87c','#6b9dde','#a78bfa'])[1 + (abs(hashtext(NEW.id::text)) % 5)],
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ───────────────────────────────────────────────
-- 6.  STORAGE BUCKETS (avatars / attachments / portfolio)
--     Run as one statement so Supabase creates them all at once.
-- ───────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars',     'avatars',     true),
  ('attachments', 'attachments', false),
  ('portfolio',   'portfolio',   false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS — anyone signed in can upload to their own avatar / portfolio folder
DROP POLICY IF EXISTS "avatars_public_read"   ON storage.objects;
DROP POLICY IF EXISTS "avatars_self_upload"   ON storage.objects;
DROP POLICY IF EXISTS "avatars_self_update"   ON storage.objects;
DROP POLICY IF EXISTS "avatars_self_delete"   ON storage.objects;

CREATE POLICY "avatars_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_self_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_self_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_self_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "portfolio_self_all" ON storage.objects;
CREATE POLICY "portfolio_self_all"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'portfolio'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "attachments_authenticated" ON storage.objects;
CREATE POLICY "attachments_authenticated"
  ON storage.objects FOR ALL
  USING (bucket_id = 'attachments' AND auth.role() = 'authenticated');


-- ───────────────────────────────────────────────
-- 7.  OPTIONAL: convert profiles.role from text → enum
--     Currently text (no constraint). This adds DB-level safety.
--     Uncomment if you want to enforce allowed values at the DB level.
-- ───────────────────────────────────────────────
-- DO $$
-- BEGIN
--   IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
--     CREATE TYPE user_role AS ENUM ('student','teacher','parent','admin','class_rep');
--   END IF;
-- END $$;
-- ALTER TABLE public.profiles ALTER COLUMN role TYPE user_role USING role::user_role;


-- ============================================================
--  All fixes applied. Re-run DATABASE_AUDIT.sql to verify.
-- ============================================================
