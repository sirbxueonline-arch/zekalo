-- ============================================================
-- SCHEMA FIXES — run once in Supabase SQL Editor
-- Adds all columns/tables the app code expects but don't exist
-- ============================================================

-- ─── profiles: add class_id + parent_email ───────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS class_id uuid references classes on delete set null;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS parent_email text;

-- ─── classes: add teacher_id + subject ───────────────────────
ALTER TABLE classes ADD COLUMN IF NOT EXISTS teacher_id uuid references profiles on delete set null;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS subject text;

-- ─── assessments table (used by teacher Gradebook) ───────────
CREATE TABLE IF NOT EXISTS assessments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references classes on delete cascade not null,
  subject_id uuid references subjects on delete cascade not null,
  teacher_id uuid references profiles on delete cascade not null,
  title text not null,
  type text default 'test' check (type in ('test', 'homework', 'project', 'exam', 'classwork')),
  date date default current_date,
  max_score numeric default 10,
  created_at timestamptz default now()
);

-- ─── grades: add assessment_id, make assessment_title optional
ALTER TABLE grades ALTER COLUMN assessment_title DROP NOT NULL;
ALTER TABLE grades ALTER COLUMN teacher_id DROP NOT NULL;
ALTER TABLE grades ADD COLUMN IF NOT EXISTS assessment_id uuid references assessments on delete cascade;

-- ─── notifications: add profile_id + extra columns code uses ─
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS profile_id uuid references profiles on delete cascade;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS school_id uuid references schools on delete cascade;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS reference_id uuid;
ALTER TABLE notifications ALTER COLUMN user_id DROP NOT NULL;

-- ─── announcements: allow 'class:uuid' audience format ────────
ALTER TABLE announcements DROP CONSTRAINT IF EXISTS announcements_audience_check;
ALTER TABLE announcements ADD CONSTRAINT announcements_audience_check
  CHECK (audience IN ('all_parents', 'all_teachers', 'all_students', 'class') OR audience LIKE 'class:%');

-- ─── ib_extended_essays: add submitted_date + fix status ──────
ALTER TABLE ib_extended_essays ADD COLUMN IF NOT EXISTS submitted_date date;
ALTER TABLE ib_extended_essays DROP CONSTRAINT IF EXISTS ib_extended_essays_status_check;
ALTER TABLE ib_extended_essays ADD CONSTRAINT ib_extended_essays_status_check
  CHECK (status IN ('draft', 'not_started', 'in_progress', 'submitted', 'graded'));

-- ─── RLS for new assessments table ───────────────────────────
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin manages assessments" ON assessments;
CREATE POLICY "admin manages assessments" ON assessments FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

DROP POLICY IF EXISTS "teachers manage own assessments" ON assessments;
CREATE POLICY "teachers manage own assessments" ON assessments FOR ALL
  USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());

DROP POLICY IF EXISTS "students read class assessments" ON assessments;
CREATE POLICY "students read class assessments" ON assessments FOR SELECT USING (
  EXISTS (SELECT 1 FROM class_members cm WHERE cm.student_id = auth.uid() AND cm.class_id = assessments.class_id)
);

-- ─── RLS for notifications ────────────────────────────────────
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

-- ─── RLS for announcements ────────────────────────────────────
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

-- ─── CLASSES ────────────────────────────────────────────────
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

-- ─── SUBJECTS ───────────────────────────────────────────────
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

-- ─── TEACHER_CLASSES ────────────────────────────────────────
ALTER TABLE teacher_classes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "school members read teacher_classes" ON teacher_classes;
CREATE POLICY "school members read teacher_classes" ON teacher_classes FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "admin manages teacher_classes" ON teacher_classes;
CREATE POLICY "admin manages teacher_classes" ON teacher_classes FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- ─── PROFILES ───────────────────────────────────────────────
DROP POLICY IF EXISTS "users read own profile" ON profiles;
DROP POLICY IF EXISTS "users read same school" ON profiles;
DROP POLICY IF EXISTS "users update own profile" ON profiles;
DROP POLICY IF EXISTS "users insert own profile" ON profiles;
DROP POLICY IF EXISTS "read own profile" ON profiles;
DROP POLICY IF EXISTS "read same school profiles" ON profiles;
DROP POLICY IF EXISTS "read same school" ON profiles;
DROP POLICY IF EXISTS "update own profile" ON profiles;
DROP POLICY IF EXISTS "insert own profile" ON profiles;
DROP POLICY IF EXISTS "admin updates school profiles" ON profiles;
DROP POLICY IF EXISTS "admin deletes school profiles" ON profiles;
DROP POLICY IF EXISTS "admin manages school profiles" ON profiles;

CREATE POLICY "read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "read same school" ON profiles FOR SELECT USING (school_id = get_my_school_id());
CREATE POLICY "update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "admin updates school profiles" ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = profiles.school_id)
);
CREATE POLICY "admin deletes school profiles" ON profiles FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = profiles.school_id)
);

-- ─── GRADES ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "admin reads school grades" ON grades;
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

DROP POLICY IF EXISTS "teachers manage own grades" ON grades;
CREATE POLICY "teachers manage own grades" ON grades FOR ALL
  USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());

DROP POLICY IF EXISTS "students read own grades" ON grades;
CREATE POLICY "students read own grades" ON grades FOR SELECT USING (student_id = auth.uid());

-- ─── CLASS_MEMBERS ──────────────────────────────────────────
ALTER TABLE class_members ENABLE ROW LEVEL SECURITY;

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
CREATE POLICY "students read own class_members" ON class_members FOR SELECT USING (student_id = auth.uid());

-- ─── MESSAGES ───────────────────────────────────────────────
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users manage own messages" ON messages;
CREATE POLICY "users manage own messages" ON messages FOR ALL USING (
  sender_id = auth.uid() OR recipient_id = auth.uid()
) WITH CHECK (sender_id = auth.uid());

-- ─── SCHOOLS (public read for signup) ───────────────────────
DROP POLICY IF EXISTS "anyone can read schools" ON schools;
CREATE POLICY "anyone can read schools" ON schools FOR SELECT USING (true);

-- ─── IB_EXTENDED_ESSAYS ─────────────────────────────────────
DROP POLICY IF EXISTS "admin manages ib_extended_essays" ON ib_extended_essays;
CREATE POLICY "admin manages ib_extended_essays" ON ib_extended_essays FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = ib_extended_essays.school_id)
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = ib_extended_essays.school_id)
);

DROP POLICY IF EXISTS "teachers read ib_extended_essays" ON ib_extended_essays;
CREATE POLICY "teachers read ib_extended_essays" ON ib_extended_essays FOR SELECT USING (
  supervisor_id = auth.uid()
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'teacher' AND p.school_id = ib_extended_essays.school_id)
);

DROP POLICY IF EXISTS "students read own ib_extended_essays" ON ib_extended_essays;
CREATE POLICY "students read own ib_extended_essays" ON ib_extended_essays FOR SELECT USING (student_id = auth.uid());

-- ─── ATTENDANCE ─────────────────────────────────────────────
DROP POLICY IF EXISTS "admin reads school attendance" ON attendance;
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

DROP POLICY IF EXISTS "teachers manage own attendance" ON attendance;
CREATE POLICY "teachers manage own attendance" ON attendance FOR ALL
  USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());

DROP POLICY IF EXISTS "students read own attendance" ON attendance;
CREATE POLICY "students read own attendance" ON attendance FOR SELECT USING (student_id = auth.uid());

-- ─── submissions: add file_url (student file uploads) ────────────────
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS file_url text;

-- ─── homework_items: make subject nullable (UI treats it as optional) ──
ALTER TABLE homework_items ALTER COLUMN subject DROP NOT NULL;

-- ─── RLS: parent reads class assignments (was missing) ────────────────
DROP POLICY IF EXISTS "parents read child assignments" ON assignments;
CREATE POLICY "parents read child assignments" ON assignments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM parent_children pc
    JOIN class_members cm ON cm.student_id = pc.child_id
    WHERE pc.parent_id = auth.uid()
    AND cm.class_id = assignments.class_id
  )
);
