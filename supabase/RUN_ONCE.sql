-- ============================================================
-- RUN_ONCE.sql  — paste entire file into Supabase SQL Editor
-- Fixes every schema issue the app needs to work correctly.
-- Safe to run multiple times (all statements are idempotent).
-- ============================================================


-- ════════════════════════════════════════════════════════════
-- 1.  SUBMISSIONS TABLE — add missing columns
-- ════════════════════════════════════════════════════════════

ALTER TABLE submissions ADD COLUMN IF NOT EXISTS file_url     text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS graded_at    timestamptz;


-- ════════════════════════════════════════════════════════════
-- 2.  STORAGE — submissions bucket + upload policies
-- ════════════════════════════════════════════════════════════

-- Create bucket (public = anyone can read via URL)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'submissions',
  'submissions',
  true,
  52428800,   -- 50 MB limit
  null        -- allow all file types
)
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 52428800;

-- Allow authenticated users to UPLOAD
DROP POLICY IF EXISTS "auth users upload submissions" ON storage.objects;
CREATE POLICY "auth users upload submissions"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'submissions' AND auth.role() = 'authenticated');

-- Allow authenticated users to UPDATE/replace their own files
DROP POLICY IF EXISTS "auth users update submissions" ON storage.objects;
CREATE POLICY "auth users update submissions"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'submissions' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to DELETE their own files
DROP POLICY IF EXISTS "auth users delete submissions" ON storage.objects;
CREATE POLICY "auth users delete submissions"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'submissions' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public SELECT (for viewing/downloading links)
DROP POLICY IF EXISTS "public read submissions bucket" ON storage.objects;
CREATE POLICY "public read submissions bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'submissions');


-- ════════════════════════════════════════════════════════════
-- 3.  PROFILES — add missing columns
-- ════════════════════════════════════════════════════════════

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS class_id    uuid REFERENCES classes ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS parent_email text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_color text;


-- ════════════════════════════════════════════════════════════
-- 4.  GRADES — make columns optional that UI treats as optional
-- ════════════════════════════════════════════════════════════

ALTER TABLE grades ALTER COLUMN assessment_title DROP NOT NULL;
ALTER TABLE grades ALTER COLUMN teacher_id       DROP NOT NULL;
ALTER TABLE grades ADD COLUMN IF NOT EXISTS assessment_id uuid REFERENCES assessments ON DELETE CASCADE;


-- ════════════════════════════════════════════════════════════
-- 5.  ASSESSMENTS TABLE (used by teacher Gradebook)
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS assessments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id    uuid REFERENCES classes   ON DELETE CASCADE NOT NULL,
  subject_id  uuid REFERENCES subjects  ON DELETE CASCADE NOT NULL,
  teacher_id  uuid REFERENCES profiles  ON DELETE CASCADE NOT NULL,
  title       text NOT NULL,
  type        text DEFAULT 'test' CHECK (type IN ('test','homework','project','exam','classwork')),
  date        date DEFAULT current_date,
  max_score   numeric DEFAULT 10,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teachers manage own assessments" ON assessments;
CREATE POLICY "teachers manage own assessments" ON assessments FOR ALL
  USING    (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

DROP POLICY IF EXISTS "students read class assessments" ON assessments;
CREATE POLICY "students read class assessments" ON assessments FOR SELECT USING (
  EXISTS (SELECT 1 FROM class_members cm WHERE cm.student_id = auth.uid() AND cm.class_id = assessments.class_id)
);

DROP POLICY IF EXISTS "admin manages assessments" ON assessments;
CREATE POLICY "admin manages assessments" ON assessments FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);


-- ════════════════════════════════════════════════════════════
-- 6.  NOTIFICATIONS — extra columns
-- ════════════════════════════════════════════════════════════

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS profile_id    uuid REFERENCES profiles ON DELETE CASCADE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS school_id     uuid REFERENCES schools  ON DELETE CASCADE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS reference_id  uuid;
ALTER TABLE notifications ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users read own notifications" ON notifications;
CREATE POLICY "users read own notifications" ON notifications FOR SELECT USING (
  user_id = auth.uid() OR profile_id = auth.uid()
);

DROP POLICY IF EXISTS "anyone insert notifications" ON notifications;
CREATE POLICY "anyone insert notifications" ON notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "users update own notifications" ON notifications;
CREATE POLICY "users update own notifications" ON notifications FOR UPDATE USING (
  user_id = auth.uid() OR profile_id = auth.uid()
);


-- ════════════════════════════════════════════════════════════
-- 7.  SUBMISSIONS — RLS policies
-- ════════════════════════════════════════════════════════════

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "submissions_student_all" ON submissions;
CREATE POLICY "submissions_student_all" ON submissions FOR ALL
  USING    (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "submissions_teacher_select" ON submissions;
CREATE POLICY "submissions_teacher_select" ON submissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM assignments a WHERE a.id = submissions.assignment_id AND a.teacher_id = auth.uid())
);

DROP POLICY IF EXISTS "submissions_teacher_update" ON submissions;
CREATE POLICY "submissions_teacher_update" ON submissions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM assignments a WHERE a.id = submissions.assignment_id AND a.teacher_id = auth.uid())
);


-- ════════════════════════════════════════════════════════════
-- 8.  ASSIGNMENTS — parent read policy
-- ════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "parents read child assignments" ON assignments;
CREATE POLICY "parents read child assignments" ON assignments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM parent_children pc
    JOIN class_members cm ON cm.student_id = pc.child_id
    WHERE pc.parent_id = auth.uid() AND cm.class_id = assignments.class_id
  )
);


-- ════════════════════════════════════════════════════════════
-- 9.  PROFILES — RLS (clean + re-create)
-- ════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "profiles_select"           ON profiles;
DROP POLICY IF EXISTS "profiles_insert"           ON profiles;
DROP POLICY IF EXISTS "profiles_update_own"       ON profiles;
DROP POLICY IF EXISTS "profiles_update_admin"     ON profiles;
DROP POLICY IF EXISTS "profiles_delete_admin"     ON profiles;
DROP POLICY IF EXISTS "read own profile"          ON profiles;
DROP POLICY IF EXISTS "read same school"          ON profiles;
DROP POLICY IF EXISTS "update own profile"        ON profiles;
DROP POLICY IF EXISTS "insert own profile"        ON profiles;
DROP POLICY IF EXISTS "admin updates school profiles" ON profiles;
DROP POLICY IF EXISTS "admin deletes school profiles" ON profiles;
DROP POLICY IF EXISTS "admin manages school profiles" ON profiles;

CREATE POLICY "read own profile"  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "read same school"  ON profiles FOR SELECT USING (school_id = get_my_school_id());
CREATE POLICY "update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "admin updates school profiles" ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = profiles.school_id)
);
CREATE POLICY "admin deletes school profiles" ON profiles FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = profiles.school_id)
);


-- ════════════════════════════════════════════════════════════
-- 10. CLASS_MEMBERS, TEACHER_CLASSES, SCHOOLS — RLS
-- ════════════════════════════════════════════════════════════

ALTER TABLE class_members   ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_classes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin manages class_members" ON class_members;
CREATE POLICY "admin manages class_members" ON class_members FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

DROP POLICY IF EXISTS "teachers read class_members" ON class_members;
CREATE POLICY "teachers read class_members" ON class_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM teacher_classes tc WHERE tc.teacher_id = auth.uid() AND tc.class_id = class_members.class_id)
);

DROP POLICY IF EXISTS "students read own class_members" ON class_members;
CREATE POLICY "students read own class_members" ON class_members FOR SELECT
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "school members read teacher_classes" ON teacher_classes;
CREATE POLICY "school members read teacher_classes" ON teacher_classes FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "admin manages teacher_classes" ON teacher_classes;
CREATE POLICY "admin manages teacher_classes" ON teacher_classes FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

DROP POLICY IF EXISTS "anyone can read schools" ON schools;
CREATE POLICY "anyone can read schools" ON schools FOR SELECT USING (true);


-- ════════════════════════════════════════════════════════════
-- 11. GRADES + ATTENDANCE — RLS
-- ════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "teachers manage own grades" ON grades;
CREATE POLICY "teachers manage own grades" ON grades FOR ALL
  USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());

DROP POLICY IF EXISTS "students read own grades" ON grades;
CREATE POLICY "students read own grades" ON grades FOR SELECT
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "admin manages school grades" ON grades;
CREATE POLICY "admin manages school grades" ON grades FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles p JOIN classes c ON c.school_id = p.school_id
    WHERE p.id = auth.uid() AND p.role = 'admin' AND c.id = grades.class_id
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p JOIN classes c ON c.school_id = p.school_id
    WHERE p.id = auth.uid() AND p.role = 'admin' AND c.id = grades.class_id
  )
);

DROP POLICY IF EXISTS "teachers manage own attendance" ON attendance;
CREATE POLICY "teachers manage own attendance" ON attendance FOR ALL
  USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());

DROP POLICY IF EXISTS "students read own attendance" ON attendance;
CREATE POLICY "students read own attendance" ON attendance FOR SELECT
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "admin manages school attendance" ON attendance;
CREATE POLICY "admin manages school attendance" ON attendance FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles p JOIN classes c ON c.school_id = p.school_id
    WHERE p.id = auth.uid() AND p.role = 'admin' AND c.id = attendance.class_id
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p JOIN classes c ON c.school_id = p.school_id
    WHERE p.id = auth.uid() AND p.role = 'admin' AND c.id = attendance.class_id
  )
);


-- ════════════════════════════════════════════════════════════
-- 12. MESSAGES
-- ════════════════════════════════════════════════════════════

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users manage own messages" ON messages;
CREATE POLICY "users manage own messages" ON messages FOR ALL USING (
  sender_id = auth.uid() OR recipient_id = auth.uid()
) WITH CHECK (sender_id = auth.uid());


-- ════════════════════════════════════════════════════════════
-- 13. ANNOUNCEMENTS + CLASSES + SUBJECTS — RLS
-- ════════════════════════════════════════════════════════════

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin manages announcements" ON announcements;
CREATE POLICY "admin manages announcements" ON announcements FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = announcements.school_id)
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = announcements.school_id)
);

DROP POLICY IF EXISTS "users read own school announcements" ON announcements;
CREATE POLICY "users read own school announcements" ON announcements FOR SELECT USING (
  school_id = get_my_school_id()
);

DROP POLICY IF EXISTS "admin manages classes" ON classes;
CREATE POLICY "admin manages classes" ON classes FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = classes.school_id)
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = classes.school_id)
);

DROP POLICY IF EXISTS "users read own school classes" ON classes;
CREATE POLICY "users read own school classes" ON classes FOR SELECT USING (
  school_id = get_my_school_id()
);

DROP POLICY IF EXISTS "admin manages subjects" ON subjects;
CREATE POLICY "admin manages subjects" ON subjects FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = subjects.school_id)
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = subjects.school_id)
);

DROP POLICY IF EXISTS "users read own school subjects" ON subjects;
CREATE POLICY "users read own school subjects" ON subjects FOR SELECT USING (
  school_id = get_my_school_id()
);


-- ════════════════════════════════════════════════════════════
-- 14. ANNOUNCEMENTS — allow 'class:uuid' audience format
-- ════════════════════════════════════════════════════════════

ALTER TABLE announcements DROP CONSTRAINT IF EXISTS announcements_audience_check;
ALTER TABLE announcements ADD CONSTRAINT announcements_audience_check
  CHECK (audience IN ('all_parents','all_teachers','all_students','class') OR audience LIKE 'class:%');


-- ════════════════════════════════════════════════════════════
-- 15. MISC FIXES
-- ════════════════════════════════════════════════════════════

-- homework_items: subject optional
ALTER TABLE homework_items ALTER COLUMN subject DROP NOT NULL;

-- ib_extended_essays: submitted_date + expanded status
ALTER TABLE ib_extended_essays ADD COLUMN IF NOT EXISTS submitted_date date;
ALTER TABLE ib_extended_essays DROP CONSTRAINT IF EXISTS ib_extended_essays_status_check;
ALTER TABLE ib_extended_essays ADD CONSTRAINT ib_extended_essays_status_check
  CHECK (status IN ('draft','not_started','in_progress','submitted','graded'));

-- classes: optional teacher_id + subject columns
ALTER TABLE classes ADD COLUMN IF NOT EXISTS teacher_id uuid REFERENCES profiles ON DELETE SET NULL;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS subject    text;


-- ════════════════════════════════════════════════════════════
-- DONE — all schema fixes applied
-- ════════════════════════════════════════════════════════════
