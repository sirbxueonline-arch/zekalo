-- ============================================================
--  Z I R V A   D A T A B A S E   R E S E T
-- ============================================================
--  Wipes all data but keeps every table, column, RLS policy,
--  trigger, function, and storage bucket intact.
--
--  After running:
--    - all profiles, classes, grades, messages etc. → gone
--    - all auth.users → gone (so all logins are deleted)
--    - all storage objects (uploaded files) → gone
--    - schema, policies, buckets themselves → preserved
--
--  ⚠️  THIS IS DESTRUCTIVE — there is no undo.
--      Take a Supabase backup first if you want safety.
--
--  Run in Supabase → SQL Editor.
-- ============================================================

BEGIN;

-- ───────────────────────────────────────────────
-- 1.  Wipe every public table (CASCADE handles FKs,
--     RESTART IDENTITY resets any sequences)
-- ───────────────────────────────────────────────
TRUNCATE TABLE
  public.contact_submissions,
  public.admissions,
  public.college_applications,
  public.cas_entries,
  public.ib_extended_essays,
  public.discipline_records,
  public.library_checkouts,
  public.library_books,
  public.leave_requests,
  public.surveys,
  public.room_bookings,
  public.pt_slots,
  public.events,
  public.exam_results,
  public.exams,
  public.substitutions,
  public.timetable,
  public.timetable_slots,
  public.unit_plans,
  public.homework_items,
  public.submissions,
  public.assignments,
  public.attendance,
  public.grades,
  public.assessments,
  public.conversation_messages,
  public.conversations,
  public.zeka_conversations,
  public.announcements,
  public.notifications,
  public.messages,
  public.ministry_reports,
  public.portfolio_items,
  public.parent_children,
  public.teacher_classes,
  public.class_members,
  public.classes,
  public.subjects,
  public.profiles,
  public.schools
RESTART IDENTITY CASCADE;

-- ───────────────────────────────────────────────
-- 2.  Wipe all auth users
--     This deletes every login. The on_auth_user_created
--     trigger will fire on the next signup to create a
--     fresh profile row.
-- ───────────────────────────────────────────────
DELETE FROM auth.users WHERE true;

-- ───────────────────────────────────────────────
-- 3.  Verify counts (should all be 0)
-- ───────────────────────────────────────────────
DO $$
DECLARE
  v_users        bigint;
  v_profiles     bigint;
  v_schools      bigint;
  v_classes      bigint;
  v_grades       bigint;
BEGIN
  SELECT count(*) INTO v_users    FROM auth.users;
  SELECT count(*) INTO v_profiles FROM public.profiles;
  SELECT count(*) INTO v_schools  FROM public.schools;
  SELECT count(*) INTO v_classes  FROM public.classes;
  SELECT count(*) INTO v_grades   FROM public.grades;

  RAISE NOTICE 'auth.users  = %', v_users;
  RAISE NOTICE 'profiles    = %', v_profiles;
  RAISE NOTICE 'schools     = %', v_schools;
  RAISE NOTICE 'classes     = %', v_classes;
  RAISE NOTICE 'grades      = %', v_grades;
END $$;

COMMIT;

-- ============================================================
--  Database tables: empty.  Auth users: gone.
--  First new signup will trigger handle_new_user() and create
--  a fresh profile row automatically.
--
--  Storage files (uploaded avatars, attachments, portfolio):
--    On Supabase Cloud you do NOT own the storage tables, so
--    SQL cannot delete from them. Use the dashboard:
--
--      Supabase → Storage → open each bucket (avatars /
--      attachments / portfolio) → select all → Delete.
--
--    For most resets you can skip this — once auth.users is
--    empty, nobody can access those files anyway and they
--    don't affect app behaviour.
-- ============================================================
