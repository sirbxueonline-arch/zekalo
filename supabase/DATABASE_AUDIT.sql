-- ============================================================
--  Z I R V A   D A T A B A S E   A U D I T   ( single query )
-- ============================================================
--  How to use:
--    1. Open Supabase → SQL Editor
--    2. Paste this entire file
--    3. Click Run
--    4. Scroll the result table — every check is one row
--
--  Read-only — does NOT modify your database.
--
--  Status column legend:
--    ✅ OK         → already there, nothing to do
--    ❌ MISSING    → run the matching CREATE statement (FULL_SETUP.sql / MISSING_TABLES.sql)
--    ⚠️ ATTENTION → enable RLS / fix mismatch
--    ℹ️  info     → optional, only required if app uses it
-- ============================================================

WITH
-- ───── 1. expected tables ─────
expected_tables(name) AS (
  VALUES
    ('schools'), ('profiles'), ('subjects'), ('classes'),
    ('class_members'), ('teacher_classes'), ('parent_children'),
    ('timetable_slots'), ('timetable'),
    ('assessments'), ('grades'), ('attendance'),
    ('assignments'), ('submissions'),
    ('messages'), ('notifications'),
    ('ministry_reports'), ('zeka_conversations'),
    ('ib_extended_essays'), ('announcements'),
    ('events'), ('exams'), ('exam_results'),
    ('discipline_records'), ('substitutions'),
    ('homework_items'), ('conversations'), ('conversation_messages'),
    ('cas_entries'), ('unit_plans'), ('portfolio_items'),
    ('room_bookings'), ('pt_slots'), ('surveys'),
    ('leave_requests'), ('library_books'), ('library_checkouts'),
    ('admissions'), ('college_applications'),
    ('contact_submissions')
),
table_check AS (
  SELECT '1. TABLE'::text AS category,
         e.name AS name,
         CASE WHEN t.tablename IS NOT NULL THEN '✅ OK' ELSE '❌ MISSING' END AS status,
         CASE WHEN t.tablename IS NOT NULL THEN '' ELSE 'create from FULL_SETUP.sql' END AS detail
  FROM   expected_tables e
  LEFT JOIN pg_tables t ON t.schemaname = 'public' AND t.tablename = e.name
),

-- ───── 2. critical columns ─────
expected_cols(tbl, col) AS (
  VALUES
    ('profiles','id'), ('profiles','full_name'), ('profiles','email'),
    ('profiles','role'), ('profiles','school_id'), ('profiles','avatar_color'),
    ('profiles','language'),

    ('schools','id'), ('schools','name'), ('schools','district'),
    ('schools','edition'), ('schools','default_language'), ('schools','blocked'),

    ('classes','id'), ('classes','school_id'), ('classes','name'),
    ('class_members','student_id'), ('class_members','class_id'),
    ('teacher_classes','teacher_id'), ('teacher_classes','class_id'),
    ('parent_children','parent_id'), ('parent_children','child_id'),

    ('subjects','id'), ('subjects','name'), ('subjects','school_id'),

    ('grades','student_id'), ('grades','class_id'), ('grades','score'), ('grades','teacher_id'),
    ('attendance','student_id'), ('attendance','date'), ('attendance','status'),

    ('assignments','class_id'), ('assignments','title'), ('assignments','due_date'),
    ('submissions','assignment_id'), ('submissions','student_id'),

    ('exams','class_id'), ('exams','exam_date'),
    ('exam_results','exam_id'), ('exam_results','student_id'), ('exam_results','score'),

    ('messages','sender_id'), ('messages','recipient_id'), ('messages','content'),
    ('notifications','user_id'), ('notifications','title'), ('notifications','read'),

    ('timetable_slots','class_id'), ('timetable_slots','day_of_week'), ('timetable_slots','start_time'),
    ('zeka_conversations','user_id')
),
column_check AS (
  SELECT '2. COLUMN'::text AS category,
         ec.tbl ||'.'|| ec.col AS name,
         CASE WHEN c.column_name IS NOT NULL THEN '✅ OK' ELSE '❌ MISSING' END AS status,
         COALESCE(c.data_type, '') AS detail
  FROM   expected_cols ec
  LEFT JOIN information_schema.columns c
         ON c.table_schema = 'public'
        AND c.table_name   = ec.tbl
        AND c.column_name  = ec.col
),

-- ───── 3. RLS ─────
rls_check AS (
  SELECT '3. RLS'::text AS category,
         tablename AS name,
         CASE WHEN rowsecurity THEN '✅ RLS ON' ELSE '⚠️ RLS OFF' END AS status,
         (SELECT count(*)::text FROM pg_policies p
            WHERE p.schemaname = t.schemaname AND p.tablename = t.tablename) || ' policies' AS detail
  FROM   pg_tables t
  WHERE  schemaname = 'public'
),

-- ───── 4. auth trigger ─────
trigger_check AS (
  SELECT '4. AUTH'::text AS category,
         'on_auth_user_created' AS name,
         CASE WHEN EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created')
              THEN '✅ OK' ELSE '❌ MISSING' END AS status,
         'auto-creates profile on signup' AS detail
),

-- ───── 5. expected RPC functions ─────
expected_fns(fn) AS (VALUES ('handle_new_user'), ('is_admin'), ('current_school_id')),
fn_check AS (
  SELECT '5. FUNCTION'::text AS category,
         e.fn AS name,
         CASE WHEN p.proname IS NOT NULL THEN '✅ OK' ELSE 'ℹ️  not found' END AS status,
         'optional unless app uses it' AS detail
  FROM   expected_fns e
  LEFT JOIN pg_proc p ON p.proname = e.fn
),

-- ───── 6. profile/auth sync ─────
sync_check AS (
  SELECT '6. SYNC'::text AS category,
         'profiles ↔ auth.users' AS name,
         CASE
           WHEN (SELECT count(*) FROM auth.users) = (SELECT count(*) FROM public.profiles)
             THEN '✅ OK'
           ELSE '⚠️ MISMATCH'
         END AS status,
         'auth=' || (SELECT count(*) FROM auth.users) ||
         '  profiles=' || (SELECT count(*) FROM public.profiles) AS detail
),

-- ───── 7. role enum / column type ─────
role_check AS (
  SELECT '7. ROLES'::text AS category,
         'profiles.role' AS name,
         CASE WHEN data_type IS NULL THEN '❌ COLUMN MISSING'
              WHEN data_type = 'USER-DEFINED' THEN '✅ enum'
              WHEN data_type = 'text' THEN 'ℹ️  text (no constraint)'
              ELSE 'ℹ️  ' || data_type END AS status,
         COALESCE(
           (SELECT string_agg(enumlabel, ', ' ORDER BY enumsortorder)
              FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
              WHERE t.typname = udt_name),
           '— must accept: student, teacher, parent, admin, class_rep') AS detail
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role'
),

-- ───── 8. storage buckets ─────
expected_buckets(name) AS (VALUES ('avatars'), ('attachments'), ('portfolio')),
bucket_check AS (
  SELECT '8. STORAGE'::text AS category,
         eb.name AS name,
         CASE WHEN b.id IS NOT NULL THEN '✅ OK' ELSE '❌ MISSING' END AS status,
         CASE WHEN b.id IS NOT NULL THEN
                CASE WHEN b.public THEN 'public' ELSE 'private' END
              ELSE 'create in Storage UI' END AS detail
  FROM   expected_buckets eb
  LEFT JOIN storage.buckets b ON b.name = eb.name
),

-- ───── 9. row counts ─────
row_count_check AS (
  SELECT '9. DATA'::text AS category, 'schools' AS name, '✅ ' || count(*)::text AS status, 'rows' AS detail FROM public.schools
  UNION ALL
  SELECT '9. DATA', 'profiles', '✅ ' || count(*)::text, 'rows' FROM public.profiles
  UNION ALL
  SELECT '9. DATA', 'classes',  '✅ ' || count(*)::text, 'rows' FROM public.classes
  UNION ALL
  SELECT '9. DATA', 'subjects', '✅ ' || count(*)::text, 'rows' FROM public.subjects
  UNION ALL
  SELECT '9. DATA', 'grades',   CASE WHEN count(*) > 0 THEN '✅ ' ELSE 'ℹ️  ' END || count(*)::text, 'rows' FROM public.grades
  UNION ALL
  SELECT '9. DATA', 'attendance', CASE WHEN count(*) > 0 THEN '✅ ' ELSE 'ℹ️  ' END || count(*)::text, 'rows' FROM public.attendance
  UNION ALL
  SELECT '9. DATA', 'assignments', CASE WHEN count(*) > 0 THEN '✅ ' ELSE 'ℹ️  ' END || count(*)::text, 'rows' FROM public.assignments
  UNION ALL
  SELECT '9. DATA', 'messages',  CASE WHEN count(*) > 0 THEN '✅ ' ELSE 'ℹ️  ' END || count(*)::text, 'rows' FROM public.messages
)

-- ───── final unified result ─────
SELECT category, name, status, detail
FROM (
  SELECT * FROM table_check
  UNION ALL SELECT * FROM column_check
  UNION ALL SELECT * FROM rls_check
  UNION ALL SELECT * FROM trigger_check
  UNION ALL SELECT * FROM fn_check
  UNION ALL SELECT * FROM sync_check
  UNION ALL SELECT * FROM role_check
  UNION ALL SELECT * FROM bucket_check
  UNION ALL SELECT * FROM row_count_check
) AS audit_rows
ORDER BY
  category,
  CASE WHEN status LIKE '❌%' THEN 0
       WHEN status LIKE '⚠️%' THEN 1
       ELSE 2 END,
  name;

-- ============================================================
--  After running:
--    Look for any rows with ❌ MISSING or ⚠️ — these are the
--    only ones that need action. Send the failed rows back to
--    me and I'll generate the fix SQL.
-- ============================================================
