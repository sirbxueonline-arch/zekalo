-- ================================================================
-- ZIRVA — FULL DATABASE SETUP (Fresh)
-- Paste this entire file into Supabase SQL Editor and click Run
-- ================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- TABLES (in dependency order)
-- ================================================================

CREATE TABLE schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  district text,
  edition text NOT NULL CHECK (edition IN ('ib', 'government')),
  ib_programmes text[],
  logo_url text,
  default_language text DEFAULT 'az',
  -- Government edition integration keys
  asan_api_key text,
  egov_api_key text,
  egov_endpoint text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('student', 'teacher', 'parent', 'admin', 'super_admin')),
  school_id uuid REFERENCES schools ON DELETE SET NULL,
  edition text CHECK (edition IN ('ib', 'government')),
  language text DEFAULT 'az' CHECK (language IN ('az', 'en', 'ru')),
  ib_programme text CHECK (ib_programme IN ('myp', 'dp', 'MYP', 'DP')),
  avatar_color text DEFAULT '#534AB7',
  parent_email text,
  apns_token text,
  notify_new_grade boolean DEFAULT true,
  notify_absence boolean DEFAULT true,
  notify_message boolean DEFAULT true,
  notify_assignment boolean DEFAULT true,
  streak_count int DEFAULT 0,
  streak_longest int DEFAULT 0,
  streak_last_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  name_az text,
  ib_criterion_group text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  grade_level text,
  academic_year text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE class_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES classes ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  enrolled_at timestamptz DEFAULT now(),
  UNIQUE(class_id, student_id)
);

CREATE TABLE teacher_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES classes ON DELETE CASCADE NOT NULL,
  teacher_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  subject_id uuid REFERENCES subjects ON DELETE CASCADE NOT NULL,
  UNIQUE(class_id, teacher_id, subject_id)
);

CREATE TABLE parent_children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  child_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(parent_id, child_id)
);

CREATE TABLE timetable_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools ON DELETE CASCADE NOT NULL,
  class_id uuid REFERENCES classes ON DELETE CASCADE NOT NULL,
  teacher_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  subject_id uuid REFERENCES subjects ON DELETE CASCADE NOT NULL,
  day_of_week int NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  period int NOT NULL CHECK (period BETWEEN 1 AND 8),
  start_time time,
  end_time time,
  room text,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(class_id, day_of_week, period),
  UNIQUE(teacher_id, day_of_week, period)
);

-- Assessments table for teacher gradebook
CREATE TABLE assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES classes ON DELETE CASCADE NOT NULL,
  subject_id uuid REFERENCES subjects ON DELETE CASCADE NOT NULL,
  teacher_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  type text DEFAULT 'test' CHECK (type IN ('test', 'homework', 'project', 'exam', 'classwork')),
  date date DEFAULT CURRENT_DATE,
  max_score numeric DEFAULT 10,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  teacher_id uuid REFERENCES profiles ON DELETE CASCADE,
  class_id uuid REFERENCES classes ON DELETE CASCADE NOT NULL,
  subject_id uuid REFERENCES subjects ON DELETE CASCADE NOT NULL,
  school_id uuid REFERENCES schools ON DELETE CASCADE,
  assessment_id uuid REFERENCES assessments ON DELETE SET NULL,
  assessment_title text,
  -- 'criterion' stores IB criteria letter (A/B/C/D) for IB gradebook
  criterion text,
  grade_type text CHECK (grade_type IN ('test', 'homework', 'project', 'exam', 'classwork', 'other')),
  score numeric CHECK (score >= 0),
  max_score numeric CHECK (max_score > 0),
  criterion_a numeric CHECK (criterion_a BETWEEN 0 AND 8),
  criterion_b numeric CHECK (criterion_b BETWEEN 0 AND 8),
  criterion_c numeric CHECK (criterion_c BETWEEN 0 AND 8),
  criterion_d numeric CHECK (criterion_d BETWEEN 0 AND 8),
  notes text,
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  class_id uuid REFERENCES classes ON DELETE CASCADE NOT NULL,
  school_id uuid REFERENCES schools ON DELETE CASCADE,
  recorded_by uuid REFERENCES profiles ON DELETE SET NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  note text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, class_id, date)
);

CREATE TABLE assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES classes ON DELETE CASCADE NOT NULL,
  teacher_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  subject_id uuid REFERENCES subjects ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  due_date timestamptz,
  max_score numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES assignments ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  content text,
  status text DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'late')),
  score numeric,
  feedback text,
  submitted_at timestamptz DEFAULT now(),
  graded_at timestamptz,
  UNIQUE(assignment_id, student_id)
);

CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL,
  sender_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  recipient_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles ON DELETE CASCADE,
  profile_id uuid REFERENCES profiles ON DELETE CASCADE,
  school_id uuid REFERENCES schools ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('new_grade','absence','new_message','assignment_due','report_submitted','announcement')),
  title text NOT NULL,
  body text,
  data jsonb,
  reference_id uuid,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE ministry_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools ON DELETE CASCADE NOT NULL,
  submitted_by uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  class_id uuid REFERENCES classes ON DELETE SET NULL,
  report_type text,
  data jsonb,
  date_from date,
  date_to date,
  status text DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'accepted', 'rejected')),
  submitted_at timestamptz DEFAULT now(),
  egov_reference text,
  error_log text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE zeka_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  subject text,
  language text DEFAULT 'az' CHECK (language IN ('az', 'en', 'ru')),
  messages jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE ib_extended_essays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  school_id uuid REFERENCES schools ON DELETE CASCADE NOT NULL,
  supervisor_id uuid REFERENCES profiles ON DELETE SET NULL,
  topic text,
  subject text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'not_started', 'in_progress', 'submitted', 'graded')),
  submitted_date date,
  submitted_at timestamptz,
  final_grade text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  -- audience: 'all_parents', 'all_teachers', 'all_students', or 'class:<uuid>'
  audience text NOT NULL,
  class_id uuid REFERENCES classes ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- ================================================================
-- FUNCTIONS
-- ================================================================

-- get_my_school_id: SECURITY DEFINER bypasses RLS to avoid recursion
CREATE OR REPLACE FUNCTION get_my_school_id()
RETURNS uuid AS $$
  SELECT school_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Compute student average grade (optionally per subject)
CREATE OR REPLACE FUNCTION get_student_average(p_student_id uuid, p_subject_id uuid DEFAULT NULL)
RETURNS numeric AS $$
  SELECT ROUND(AVG(
    CASE WHEN max_score > 0 THEN (score / max_score) * 10 ELSE score END
  ), 1)
  FROM grades
  WHERE student_id = p_student_id
    AND (p_subject_id IS NULL OR subject_id = p_subject_id)
    AND score IS NOT NULL;
$$ LANGUAGE sql SECURITY DEFINER;

-- Compute student attendance percentage
CREATE OR REPLACE FUNCTION get_attendance_percentage(p_student_id uuid, p_class_id uuid DEFAULT NULL)
RETURNS numeric AS $$
  SELECT ROUND(
    COUNT(*) FILTER (WHERE status = 'present')::numeric / NULLIF(COUNT(*), 0) * 100, 1
  )
  FROM attendance
  WHERE student_id = p_student_id
    AND (p_class_id IS NULL OR class_id = p_class_id);
$$ LANGUAGE sql SECURITY DEFINER;

-- Return at-risk students for a school (low grade or low attendance)
CREATE OR REPLACE FUNCTION get_at_risk_students(p_school_id uuid)
RETURNS TABLE (
  id uuid,
  full_name text,
  class_name text,
  avg_grade numeric,
  attendance_pct numeric,
  risk_reason text
) AS $$
  SELECT
    p.id,
    p.full_name,
    c.name,
    ROUND(AVG(CASE WHEN g.max_score > 0 THEN (g.score / g.max_score) * 10 ELSE g.score END), 1),
    ROUND(COUNT(a.id) FILTER (WHERE a.status = 'present')::numeric / NULLIF(COUNT(a.id), 0) * 100, 1),
    CASE
      WHEN ROUND(AVG(CASE WHEN g.max_score > 0 THEN (g.score / g.max_score) * 10 ELSE g.score END), 1) < 5
       AND ROUND(COUNT(a.id) FILTER (WHERE a.status = 'present')::numeric / NULLIF(COUNT(a.id), 0) * 100, 1) < 80
      THEN 'Həm qiymət, həm davamiyyət'
      WHEN ROUND(AVG(CASE WHEN g.max_score > 0 THEN (g.score / g.max_score) * 10 ELSE g.score END), 1) < 5
      THEN 'Aşağı qiymət'
      ELSE 'Aşağı davamiyyət'
    END
  FROM profiles p
  JOIN class_members cm ON cm.student_id = p.id
  JOIN classes c ON c.id = cm.class_id
  LEFT JOIN grades g ON g.student_id = p.id AND g.score IS NOT NULL
  LEFT JOIN attendance a ON a.student_id = p.id
  WHERE p.school_id = p_school_id
    AND p.role = 'student'
  GROUP BY p.id, p.full_name, c.name
  HAVING (
    ROUND(AVG(CASE WHEN g.max_score > 0 THEN (g.score / g.max_score) * 10 ELSE g.score END), 1) < 5
    OR ROUND(COUNT(a.id) FILTER (WHERE a.status = 'present')::numeric / NULLIF(COUNT(a.id), 0) * 100, 1) < 80
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Update Zəka streak on new conversation
CREATE OR REPLACE FUNCTION update_streak()
RETURNS trigger AS $$
DECLARE
  last_date date;
  current_streak int;
  longest_streak int;
BEGIN
  SELECT streak_last_date, streak_count, streak_longest
  INTO last_date, current_streak, longest_streak
  FROM profiles WHERE id = NEW.user_id;

  IF last_date = CURRENT_DATE THEN RETURN NEW;
  ELSIF last_date = CURRENT_DATE - 1 THEN current_streak := current_streak + 1;
  ELSE current_streak := 1;
  END IF;

  IF current_streak > longest_streak THEN longest_streak := current_streak; END IF;

  UPDATE profiles SET
    streak_count = current_streak,
    streak_longest = longest_streak,
    streak_last_date = CURRENT_DATE
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Push notification on new grade
CREATE OR REPLACE FUNCTION notify_on_grade()
RETURNS trigger AS $$
DECLARE subject_name text;
BEGIN
  SELECT name INTO subject_name FROM subjects WHERE id = NEW.subject_id;
  INSERT INTO notifications (user_id, profile_id, type, title, body)
  VALUES (
    NEW.student_id, NEW.student_id, 'new_grade', 'Yeni qiymət',
    COALESCE(subject_name, '') || ': ' || COALESCE(NEW.score::text, 'qiymətləndirildi')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Push notification on new message
CREATE OR REPLACE FUNCTION notify_on_message()
RETURNS trigger AS $$
DECLARE sender_name text;
BEGIN
  SELECT full_name INTO sender_name FROM profiles WHERE id = NEW.sender_id;
  INSERT INTO notifications (user_id, profile_id, type, title, body)
  VALUES (
    NEW.recipient_id, NEW.recipient_id, 'new_message',
    'Yeni mesaj — ' || COALESCE(sender_name, ''),
    LEFT(NEW.content, 80)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- TRIGGERS
-- ================================================================

CREATE TRIGGER profiles_updated_at    BEFORE UPDATE ON profiles    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER grades_updated_at      BEFORE UPDATE ON grades      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER assignments_updated_at BEFORE UPDATE ON assignments  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER ib_essays_updated_at   BEFORE UPDATE ON ib_extended_essays FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER zeka_updated_at        BEFORE UPDATE ON zeka_conversations  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER grade_notification     AFTER INSERT   ON grades      FOR EACH ROW EXECUTE FUNCTION notify_on_grade();
CREATE TRIGGER message_notification   AFTER INSERT   ON messages    FOR EACH ROW EXECUTE FUNCTION notify_on_message();
CREATE TRIGGER zeka_streak            AFTER INSERT   ON zeka_conversations FOR EACH ROW EXECUTE FUNCTION update_streak();

-- ================================================================
-- ENABLE RLS
-- ================================================================

ALTER TABLE schools             ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects            ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_members       ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_classes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_children     ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_slots     ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades              ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance          ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages            ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE ministry_reports    ENABLE ROW LEVEL SECURITY;
ALTER TABLE zeka_conversations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE ib_extended_essays  ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements       ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- RLS POLICIES
-- ================================================================

-- SCHOOLS: everyone can read, authenticated users can create (signup flow), admin can update own school
CREATE POLICY "schools_read"         ON schools FOR SELECT USING (true);
CREATE POLICY "schools_insert"       ON schools FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "schools_admin_update" ON schools FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = schools.id));

-- PROFILES
-- SELECT: own profile OR anyone in same school (null-safe)
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (
  auth.uid() = id
  OR (school_id IS NOT NULL AND school_id = get_my_school_id())
);
-- INSERT: only own profile (during signup)
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
-- UPDATE: own profile
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
-- UPDATE: admin can update anyone in their school
CREATE POLICY "profiles_update_admin" ON profiles FOR UPDATE USING (
  school_id IS NOT NULL AND school_id = get_my_school_id()
  AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);
-- DELETE: admin only
CREATE POLICY "profiles_delete_admin" ON profiles FOR DELETE USING (
  school_id IS NOT NULL AND school_id = get_my_school_id()
  AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- SUBJECTS: everyone reads, admin manages own school
CREATE POLICY "subjects_select"    ON subjects FOR SELECT USING (true);
CREATE POLICY "subjects_admin_all" ON subjects FOR ALL
  USING    (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = subjects.school_id))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = subjects.school_id));

-- CLASSES: everyone reads, admin manages own school
CREATE POLICY "classes_select"    ON classes FOR SELECT USING (true);
CREATE POLICY "classes_admin_all" ON classes FOR ALL
  USING    (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = classes.school_id))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = classes.school_id));

-- CLASS_MEMBERS
CREATE POLICY "class_members_select" ON class_members FOR SELECT USING (
  student_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'teacher')
    AND p.school_id = (SELECT school_id FROM classes WHERE id = class_members.class_id)
  )
  OR EXISTS (
    SELECT 1 FROM parent_children pc WHERE pc.parent_id = auth.uid() AND pc.child_id = class_members.student_id
  )
);
CREATE POLICY "class_members_admin_all" ON class_members FOR ALL
  USING    (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- TEACHER_CLASSES: everyone reads, admin manages
CREATE POLICY "teacher_classes_select"    ON teacher_classes FOR SELECT USING (true);
CREATE POLICY "teacher_classes_admin_all" ON teacher_classes FOR ALL
  USING    (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- PARENT_CHILDREN
CREATE POLICY "parent_children_select"    ON parent_children FOR SELECT
  USING (parent_id = auth.uid() OR child_id = auth.uid());
CREATE POLICY "parent_children_admin_all" ON parent_children FOR ALL
  USING    (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- TIMETABLE_SLOTS
CREATE POLICY "timetable_select"    ON timetable_slots FOR SELECT
  USING (school_id = get_my_school_id());
CREATE POLICY "timetable_admin_all" ON timetable_slots FOR ALL
  USING    (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = timetable_slots.school_id))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = timetable_slots.school_id));

-- ASSESSMENTS
CREATE POLICY "assessments_select" ON assessments FOR SELECT USING (
  teacher_id = auth.uid()
  OR EXISTS (SELECT 1 FROM class_members cm WHERE cm.student_id = auth.uid() AND cm.class_id = assessments.class_id)
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
             AND p.school_id = (SELECT school_id FROM classes WHERE id = assessments.class_id))
);
CREATE POLICY "assessments_teacher_all" ON assessments FOR ALL
  USING    (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "assessments_admin_all" ON assessments FOR ALL
  USING    (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- GRADES (join via classes to get school_id so no school_id column needed on grades for admin policy)
CREATE POLICY "grades_student_select" ON grades FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "grades_parent_select"  ON grades FOR SELECT USING (
  EXISTS (SELECT 1 FROM parent_children pc WHERE pc.parent_id = auth.uid() AND pc.child_id = grades.student_id)
);
CREATE POLICY "grades_teacher_all"    ON grades FOR ALL
  USING    (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "grades_admin_all"      ON grades FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles p JOIN classes c ON c.school_id = p.school_id
    WHERE p.id = auth.uid() AND p.role = 'admin' AND c.id = grades.class_id
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles p JOIN classes c ON c.school_id = p.school_id
    WHERE p.id = auth.uid() AND p.role = 'admin' AND c.id = grades.class_id
  ));

-- ATTENDANCE
CREATE POLICY "attendance_student_select" ON attendance FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "attendance_parent_select"  ON attendance FOR SELECT USING (
  EXISTS (SELECT 1 FROM parent_children pc WHERE pc.parent_id = auth.uid() AND pc.child_id = attendance.student_id)
);
-- Teacher: read/update/delete their recorded rows
CREATE POLICY "attendance_teacher_select" ON attendance FOR SELECT USING (
  EXISTS (SELECT 1 FROM teacher_classes tc WHERE tc.teacher_id = auth.uid() AND tc.class_id = attendance.class_id)
);
CREATE POLICY "attendance_teacher_insert" ON attendance FOR INSERT
  WITH CHECK (recorded_by = auth.uid());
CREATE POLICY "attendance_teacher_delete" ON attendance FOR DELETE
  USING (recorded_by = auth.uid()
    OR EXISTS (SELECT 1 FROM teacher_classes tc WHERE tc.teacher_id = auth.uid() AND tc.class_id = attendance.class_id));
-- Admin: all
CREATE POLICY "attendance_admin_all" ON attendance FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles p JOIN classes c ON c.school_id = p.school_id
    WHERE p.id = auth.uid() AND p.role = 'admin' AND c.id = attendance.class_id
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles p JOIN classes c ON c.school_id = p.school_id
    WHERE p.id = auth.uid() AND p.role = 'admin' AND c.id = attendance.class_id
  ));

-- ASSIGNMENTS
CREATE POLICY "assignments_student_select" ON assignments FOR SELECT USING (
  EXISTS (SELECT 1 FROM class_members cm WHERE cm.class_id = assignments.class_id AND cm.student_id = auth.uid())
);
CREATE POLICY "assignments_parent_select" ON assignments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM parent_children pc JOIN class_members cm ON cm.student_id = pc.child_id
    WHERE pc.parent_id = auth.uid() AND cm.class_id = assignments.class_id
  )
);
CREATE POLICY "assignments_teacher_all" ON assignments FOR ALL
  USING    (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "assignments_admin_all"   ON assignments FOR ALL
  USING    (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- SUBMISSIONS
CREATE POLICY "submissions_student_all"    ON submissions FOR ALL
  USING    (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());
CREATE POLICY "submissions_teacher_select" ON submissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM assignments a WHERE a.id = submissions.assignment_id AND a.teacher_id = auth.uid())
);
CREATE POLICY "submissions_teacher_update" ON submissions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM assignments a WHERE a.id = submissions.assignment_id AND a.teacher_id = auth.uid())
);

-- MESSAGES
CREATE POLICY "messages_select" ON messages FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());
CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (sender_id = auth.uid());
CREATE POLICY "messages_update" ON messages FOR UPDATE USING (recipient_id = auth.uid());

-- NOTIFICATIONS: user reads own, anyone can insert (triggers need this), admin reads school
CREATE POLICY "notifications_select" ON notifications FOR SELECT
  USING (user_id = auth.uid() OR profile_id = auth.uid()
    OR (school_id IS NOT NULL AND school_id = get_my_school_id()
        AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')));
CREATE POLICY "notifications_insert" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "notifications_update" ON notifications FOR UPDATE
  USING (user_id = auth.uid() OR profile_id = auth.uid());

-- MINISTRY_REPORTS
CREATE POLICY "reports_select" ON ministry_reports FOR SELECT USING (
  submitted_by = auth.uid()
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = ministry_reports.school_id)
);
CREATE POLICY "reports_insert" ON ministry_reports FOR INSERT WITH CHECK (
  submitted_by = auth.uid()
  AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'teacher'))
);

-- ZEKA_CONVERSATIONS
CREATE POLICY "zeka_own" ON zeka_conversations FOR ALL
  USING    (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- IB_EXTENDED_ESSAYS
CREATE POLICY "ib_essays_student"    ON ib_extended_essays FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "ib_essays_supervisor" ON ib_extended_essays FOR SELECT USING (supervisor_id = auth.uid());
CREATE POLICY "ib_essays_admin_all"  ON ib_extended_essays FOR ALL
  USING    (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = ib_extended_essays.school_id))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = ib_extended_essays.school_id));

-- ANNOUNCEMENTS
CREATE POLICY "announcements_select"    ON announcements FOR SELECT USING (school_id = get_my_school_id());
CREATE POLICY "announcements_admin_all" ON announcements FOR ALL
  USING    (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','teacher') AND p.school_id = announcements.school_id))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','teacher') AND p.school_id = announcements.school_id));
