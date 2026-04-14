-- =============================================
-- FIX: Admin RLS policies — idempotent
-- Run this in Supabase SQL Editor
-- NOTE: PostgreSQL does NOT support
--   CREATE POLICY IF NOT EXISTS
-- So we DROP IF EXISTS first, then CREATE.
-- =============================================

-- ─── CLASSES ────────────────────────────────
DROP POLICY IF EXISTS "admin manages classes" ON classes;
CREATE POLICY "admin manages classes"
  ON classes FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND p.school_id = classes.school_id
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND p.school_id = classes.school_id
    )
  );

DROP POLICY IF EXISTS "users read own school classes" ON classes;
CREATE POLICY "users read own school classes"
  ON classes FOR SELECT USING (
    school_id = get_my_school_id()
  );

-- ─── SUBJECTS ───────────────────────────────
DROP POLICY IF EXISTS "admin manages subjects" ON subjects;
CREATE POLICY "admin manages subjects"
  ON subjects FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND p.school_id = subjects.school_id
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND p.school_id = subjects.school_id
    )
  );

DROP POLICY IF EXISTS "users read own school subjects" ON subjects;
CREATE POLICY "users read own school subjects"
  ON subjects FOR SELECT USING (
    school_id = get_my_school_id()
  );

-- ─── TEACHER_CLASSES ────────────────────────
ALTER TABLE teacher_classes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "school members read teacher_classes" ON teacher_classes;
CREATE POLICY "school members read teacher_classes"
  ON teacher_classes FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "admin manages teacher_classes" ON teacher_classes;
CREATE POLICY "admin manages teacher_classes"
  ON teacher_classes FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- ─── PROFILES ───────────────────────────────
-- Drop all old policies first
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

-- Everyone can read own profile
CREATE POLICY "read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

-- Same school members can read each other
CREATE POLICY "read same school"
  ON profiles FOR SELECT USING (school_id = get_my_school_id());

-- Users can update own profile
CREATE POLICY "update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Users can insert own profile (signup)
CREATE POLICY "insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin can update any profile in their school
CREATE POLICY "admin updates school profiles"
  ON profiles FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND p.school_id = profiles.school_id
    )
  );

-- Admin can delete profiles in their school
CREATE POLICY "admin deletes school profiles"
  ON profiles FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND p.school_id = profiles.school_id
    )
  );

-- ─── GRADES ─────────────────────────────────
DROP POLICY IF EXISTS "admin reads school grades" ON grades;
DROP POLICY IF EXISTS "admin manages school grades" ON grades;
CREATE POLICY "admin manages school grades"
  ON grades FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN classes c ON c.school_id = p.school_id
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND c.id = grades.class_id
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN classes c ON c.school_id = p.school_id
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND c.id = grades.class_id
    )
  );

DROP POLICY IF EXISTS "teachers manage own grades" ON grades;
CREATE POLICY "teachers manage own grades"
  ON grades FOR ALL USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

DROP POLICY IF EXISTS "students read own grades" ON grades;
CREATE POLICY "students read own grades"
  ON grades FOR SELECT USING (student_id = auth.uid());

-- ─── ATTENDANCE ─────────────────────────────
DROP POLICY IF EXISTS "admin reads school attendance" ON attendance;
DROP POLICY IF EXISTS "admin manages school attendance" ON attendance;
CREATE POLICY "admin manages school attendance"
  ON attendance FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN classes c ON c.school_id = p.school_id
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND c.id = attendance.class_id
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN classes c ON c.school_id = p.school_id
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND c.id = attendance.class_id
    )
  );

DROP POLICY IF EXISTS "teachers manage own attendance" ON attendance;
CREATE POLICY "teachers manage own attendance"
  ON attendance FOR ALL USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

DROP POLICY IF EXISTS "students read own attendance" ON attendance;
CREATE POLICY "students read own attendance"
  ON attendance FOR SELECT USING (student_id = auth.uid());

-- ─── ASSIGNMENTS ────────────────────────────
DROP POLICY IF EXISTS "admin manages assignments" ON assignments;
CREATE POLICY "admin manages assignments"
  ON assignments FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN classes c ON c.school_id = p.school_id
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND c.id = assignments.class_id
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN classes c ON c.school_id = p.school_id
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND c.id = assignments.class_id
    )
  );

DROP POLICY IF EXISTS "teachers manage own assignments" ON assignments;
CREATE POLICY "teachers manage own assignments"
  ON assignments FOR ALL USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

DROP POLICY IF EXISTS "students read class assignments" ON assignments;
CREATE POLICY "students read class assignments"
  ON assignments FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM class_members cm
      WHERE cm.student_id = auth.uid()
      AND cm.class_id = assignments.class_id
    )
  );

-- ─── SUBMISSIONS ────────────────────────────
DROP POLICY IF EXISTS "admin reads submissions" ON submissions;
CREATE POLICY "admin reads submissions"
  ON submissions FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assignments a
      JOIN classes c ON c.id = a.class_id
      JOIN profiles p ON p.school_id = c.school_id
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND a.id = submissions.assignment_id
    )
  );

DROP POLICY IF EXISTS "students manage own submissions" ON submissions;
CREATE POLICY "students manage own submissions"
  ON submissions FOR ALL USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "teachers read class submissions" ON submissions;
CREATE POLICY "teachers read class submissions"
  ON submissions FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assignments a
      JOIN teacher_classes tc ON tc.class_id = a.class_id
      WHERE tc.teacher_id = auth.uid()
      AND a.id = submissions.assignment_id
    )
  );

-- ─── CLASS_MEMBERS ──────────────────────────
ALTER TABLE class_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin manages class_members" ON class_members;
CREATE POLICY "admin manages class_members"
  ON class_members FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "teachers read class_members" ON class_members;
CREATE POLICY "teachers read class_members"
  ON class_members FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM teacher_classes tc
      WHERE tc.teacher_id = auth.uid()
      AND tc.class_id = class_members.class_id
    )
  );

DROP POLICY IF EXISTS "students read own class_members" ON class_members;
CREATE POLICY "students read own class_members"
  ON class_members FOR SELECT USING (student_id = auth.uid());

-- ─── MESSAGES ───────────────────────────────
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users manage own messages" ON messages;
CREATE POLICY "users manage own messages"
  ON messages FOR ALL USING (
    sender_id = auth.uid() OR recipient_id = auth.uid()
  ) WITH CHECK (sender_id = auth.uid());

-- ─── SCHOOLS (public read for signup) ───────
DROP POLICY IF EXISTS "anyone can read schools" ON schools;
CREATE POLICY "anyone can read schools"
  ON schools FOR SELECT USING (true);

-- ─── IB_EXTENDED_ESSAYS ─────────────────────
DROP POLICY IF EXISTS "admin manages ib_extended_essays" ON ib_extended_essays;
CREATE POLICY "admin manages ib_extended_essays"
  ON ib_extended_essays FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND p.school_id = ib_extended_essays.school_id
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND p.school_id = ib_extended_essays.school_id
    )
  );

DROP POLICY IF EXISTS "teachers read ib_extended_essays" ON ib_extended_essays;
CREATE POLICY "teachers read ib_extended_essays"
  ON ib_extended_essays FOR SELECT USING (
    supervisor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'teacher'
      AND p.school_id = ib_extended_essays.school_id
    )
  );

DROP POLICY IF EXISTS "students read own ib_extended_essays" ON ib_extended_essays;
CREATE POLICY "students read own ib_extended_essays"
  ON ib_extended_essays FOR SELECT USING (student_id = auth.uid());
