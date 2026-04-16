-- ================================================================
-- ZIRVA — STEP 1: TABLES + RLS
-- Paste into Supabase SQL Editor and click Run.
-- Safe to run on a completely fresh project.
-- ================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- TABLES (dependency order)
-- ================================================================

CREATE TABLE IF NOT EXISTS schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  district text,
  edition text NOT NULL CHECK (edition IN ('ib', 'government')),
  ib_programmes text[],
  logo_url text,
  default_language text DEFAULT 'az',
  asan_api_key text,
  egov_api_key text,
  egov_endpoint text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('student','teacher','parent','admin','super_admin')),
  school_id uuid REFERENCES schools ON DELETE SET NULL,
  edition text CHECK (edition IN ('ib','government')),
  language text DEFAULT 'az' CHECK (language IN ('az','en','ru')),
  ib_programme text CHECK (ib_programme IN ('myp','dp','MYP','DP')),
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

CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  name_az text,
  ib_criterion_group text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  grade_level text,
  academic_year text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS class_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES classes ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  enrolled_at timestamptz DEFAULT now(),
  UNIQUE(class_id, student_id)
);

CREATE TABLE IF NOT EXISTS teacher_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES classes ON DELETE CASCADE NOT NULL,
  teacher_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  subject_id uuid REFERENCES subjects ON DELETE CASCADE NOT NULL,
  UNIQUE(class_id, teacher_id, subject_id)
);

CREATE TABLE IF NOT EXISTS parent_children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  child_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(parent_id, child_id)
);

CREATE TABLE IF NOT EXISTS timetable_slots (
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

CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES classes ON DELETE CASCADE NOT NULL,
  subject_id uuid REFERENCES subjects ON DELETE CASCADE NOT NULL,
  teacher_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  type text DEFAULT 'test' CHECK (type IN ('test','homework','project','exam','classwork')),
  date date DEFAULT CURRENT_DATE,
  max_score numeric DEFAULT 10,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  teacher_id uuid REFERENCES profiles ON DELETE CASCADE,
  class_id uuid REFERENCES classes ON DELETE CASCADE NOT NULL,
  subject_id uuid REFERENCES subjects ON DELETE CASCADE NOT NULL,
  school_id uuid REFERENCES schools ON DELETE CASCADE,
  assessment_id uuid REFERENCES assessments ON DELETE SET NULL,
  assessment_title text,
  criterion text,
  grade_type text CHECK (grade_type IN ('test','homework','project','exam','classwork','other')),
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

CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  class_id uuid REFERENCES classes ON DELETE CASCADE NOT NULL,
  school_id uuid REFERENCES schools ON DELETE CASCADE,
  recorded_by uuid REFERENCES profiles ON DELETE SET NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL CHECK (status IN ('present','absent','late')),
  note text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, class_id, date)
);

CREATE TABLE IF NOT EXISTS assignments (
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

CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES assignments ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  content text,
  status text DEFAULT 'submitted' CHECK (status IN ('submitted','graded','late')),
  score numeric,
  feedback text,
  submitted_at timestamptz DEFAULT now(),
  graded_at timestamptz,
  UNIQUE(assignment_id, student_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL,
  sender_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  recipient_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles ON DELETE CASCADE,
  profile_id uuid REFERENCES profiles ON DELETE CASCADE,
  school_id uuid REFERENCES schools ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  data jsonb,
  reference_id uuid,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ministry_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools ON DELETE CASCADE NOT NULL,
  submitted_by uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  class_id uuid REFERENCES classes ON DELETE SET NULL,
  report_type text,
  data jsonb,
  date_from date,
  date_to date,
  status text DEFAULT 'submitted' CHECK (status IN ('draft','submitted','accepted','rejected')),
  submitted_at timestamptz DEFAULT now(),
  egov_reference text,
  error_log text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS zeka_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  subject text,
  language text DEFAULT 'az' CHECK (language IN ('az','en','ru')),
  messages jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ib_extended_essays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  school_id uuid REFERENCES schools ON DELETE CASCADE NOT NULL,
  supervisor_id uuid REFERENCES profiles ON DELETE SET NULL,
  topic text,
  subject text,
  status text DEFAULT 'draft' CHECK (status IN ('draft','not_started','in_progress','submitted','graded')),
  submitted_date date,
  submitted_at timestamptz,
  final_grade text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  audience text NOT NULL,
  class_id uuid REFERENCES classes ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- ── Extended feature tables ───────────────────────────────────

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date,
  type text NOT NULL DEFAULT 'event' CHECK (type IN ('holiday','exam','meeting','event','other')),
  visible_to text NOT NULL DEFAULT 'all' CHECK (visible_to IN ('all','teachers','students','parents','admin')),
  color text DEFAULT '#534AB7',
  created_by uuid REFERENCES profiles ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools ON DELETE CASCADE NOT NULL,
  class_id uuid REFERENCES classes ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects ON DELETE CASCADE,
  title text NOT NULL,
  exam_date date NOT NULL,
  duration_minutes int,
  max_score numeric DEFAULT 100,
  published boolean DEFAULT false,
  created_by uuid REFERENCES profiles ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exam_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid REFERENCES exams ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  score numeric,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(exam_id, student_id)
);

CREATE TABLE IF NOT EXISTS discipline_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  recorded_by uuid REFERENCES profiles ON DELETE SET NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  type text NOT NULL CHECK (type IN ('warning','detention','suspension','commendation','note')),
  description text NOT NULL,
  parent_notified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS substitutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools ON DELETE CASCADE NOT NULL,
  timetable_slot_id uuid REFERENCES timetable_slots ON DELETE CASCADE NOT NULL,
  absent_teacher_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  substitute_teacher_id uuid REFERENCES profiles ON DELETE CASCADE,
  date date NOT NULL,
  reason text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(timetable_slot_id, date)
);

CREATE TABLE IF NOT EXISTS homework_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  subject text,            -- nullable: UI treats subject as optional
  title text NOT NULL,
  due_date date,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools ON DELETE CASCADE NOT NULL,
  parent_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  teacher_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(parent_id, teacher_id, student_id)
);

CREATE TABLE IF NOT EXISTS conversation_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- CAS entries (IB Creativity/Activity/Service)
CREATE TABLE IF NOT EXISTS cas_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  school_id uuid REFERENCES schools ON DELETE CASCADE NOT NULL,
  strand text NOT NULL CHECK (strand IN ('creativity','activity','service')),
  title text NOT NULL,
  description text,
  hours numeric DEFAULT 0,
  evidence_url text,
  reflection text,
  supervisor_id uuid REFERENCES profiles ON DELETE SET NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft','submitted','approved')),
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Unit plans (curriculum planning)
CREATE TABLE IF NOT EXISTS unit_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools ON DELETE CASCADE NOT NULL,
  teacher_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  class_id uuid REFERENCES classes ON DELETE SET NULL,
  subject_id uuid REFERENCES subjects ON DELETE SET NULL,
  title text NOT NULL,
  central_idea text,
  learning_objectives text,
  atl_skills text[],
  start_date date,
  end_date date,
  status text DEFAULT 'draft' CHECK (status IN ('draft','active','complete')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Student portfolios
CREATE TABLE IF NOT EXISTS portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  school_id uuid REFERENCES schools ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  subject text,
  reflection text,
  file_url text,
  created_at timestamptz DEFAULT now()
);

-- Admissions applications
CREATE TABLE IF NOT EXISTS admissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools ON DELETE CASCADE NOT NULL,
  full_name text NOT NULL,
  email text,
  phone text,
  grade_applying text,
  date_of_birth date,
  notes text,
  status text DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','waitlist')),
  reviewed_by uuid REFERENCES profiles ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Staff leave requests
CREATE TABLE IF NOT EXISTS leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools ON DELETE CASCADE NOT NULL,
  teacher_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  leave_type text NOT NULL CHECK (leave_type IN ('sick','personal','professional','other')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text,
  status text DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_by uuid REFERENCES profiles ON DELETE SET NULL,
  review_note text,
  created_at timestamptz DEFAULT now()
);

-- Rooms / resources for booking
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text DEFAULT 'classroom' CHECK (type IN ('classroom','lab','hall','sports','other')),
  capacity int,
  created_at timestamptz DEFAULT now()
);

-- Room bookings
CREATE TABLE IF NOT EXISTS room_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools ON DELETE CASCADE NOT NULL,
  room_id uuid REFERENCES rooms ON DELETE CASCADE NOT NULL,
  booked_by uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  purpose text,
  created_at timestamptz DEFAULT now()
);

-- Library books
CREATE TABLE IF NOT EXISTS library_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  author text,
  isbn text,
  total_copies int DEFAULT 1,
  available_copies int DEFAULT 1,
  category text,
  created_at timestamptz DEFAULT now()
);

-- Library checkouts
CREATE TABLE IF NOT EXISTS library_checkouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools ON DELETE CASCADE NOT NULL,
  book_id uuid REFERENCES library_books ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  checked_out_at timestamptz DEFAULT now(),
  due_date date NOT NULL,
  returned_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Surveys
CREATE TABLE IF NOT EXISTS surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools ON DELETE CASCADE NOT NULL,
  created_by uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  audience text DEFAULT 'all' CHECK (audience IN ('all','parents','teachers','students')),
  status text DEFAULT 'draft' CHECK (status IN ('draft','active','closed')),
  created_at timestamptz DEFAULT now()
);

-- College counseling (IB DP)
CREATE TABLE IF NOT EXISTS college_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  university text NOT NULL,
  program text,
  deadline date,
  status text DEFAULT 'planning' CHECK (status IN ('planning','applied','offer','accepted','rejected')),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Parent-teacher conference slots
CREATE TABLE IF NOT EXISTS ptc_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools ON DELETE CASCADE NOT NULL,
  teacher_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  booked_by uuid REFERENCES profiles ON DELETE SET NULL,
  student_id uuid REFERENCES profiles ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- ================================================================
-- HELPER FUNCTION (needed by RLS policies below)
-- ================================================================
-- profiles table now exists, so the SQL function body is valid.
-- SETUP_2_FUNCTIONS.sql also defines this — CREATE OR REPLACE is idempotent.
CREATE OR REPLACE FUNCTION get_my_school_id()
RETURNS uuid AS $$
  SELECT school_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ================================================================
-- ENABLE ROW LEVEL SECURITY
-- ================================================================

ALTER TABLE schools              ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects             ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_members        ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_classes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_children      ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_slots      ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades               ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance           ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages             ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications        ENABLE ROW LEVEL SECURITY;
ALTER TABLE ministry_reports     ENABLE ROW LEVEL SECURITY;
ALTER TABLE zeka_conversations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE ib_extended_essays   ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements        ENABLE ROW LEVEL SECURITY;
ALTER TABLE events               ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams                ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results         ENABLE ROW LEVEL SECURITY;
ALTER TABLE discipline_records   ENABLE ROW LEVEL SECURITY;
ALTER TABLE substitutions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- RLS POLICIES
-- ================================================================

-- SCHOOLS
DROP POLICY IF EXISTS "schools_read" ON schools;
CREATE POLICY "schools_read"         ON schools FOR SELECT USING (true);
DROP POLICY IF EXISTS "schools_insert" ON schools;
CREATE POLICY "schools_insert"       ON schools FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "schools_admin_update" ON schools;
CREATE POLICY "schools_admin_update" ON schools FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = schools.id));

-- PROFILES (uses get_my_school_id() — defined in Step 2)
DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (
  auth.uid() = id
  OR (school_id IS NOT NULL AND school_id = get_my_school_id())
);
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert"       ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"   ON profiles FOR UPDATE
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;
CREATE POLICY "profiles_update_admin" ON profiles FOR UPDATE USING (
  school_id IS NOT NULL AND school_id = get_my_school_id()
  AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);
DROP POLICY IF EXISTS "profiles_delete_admin" ON profiles;
CREATE POLICY "profiles_delete_admin" ON profiles FOR DELETE USING (
  school_id IS NOT NULL AND school_id = get_my_school_id()
  AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- SUBJECTS
DROP POLICY IF EXISTS "subjects_select" ON subjects;
CREATE POLICY "subjects_select"    ON subjects FOR SELECT USING (true);
DROP POLICY IF EXISTS "subjects_admin_all" ON subjects;
CREATE POLICY "subjects_admin_all" ON subjects FOR ALL
  USING    (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = subjects.school_id))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = subjects.school_id));

-- CLASSES
DROP POLICY IF EXISTS "classes_select" ON classes;
CREATE POLICY "classes_select"    ON classes FOR SELECT USING (true);
DROP POLICY IF EXISTS "classes_admin_all" ON classes;
CREATE POLICY "classes_admin_all" ON classes FOR ALL
  USING    (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = classes.school_id))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = classes.school_id));

-- CLASS_MEMBERS
DROP POLICY IF EXISTS "class_members_select" ON class_members;
CREATE POLICY "class_members_select" ON class_members FOR SELECT USING (
  student_id = auth.uid()
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','teacher')
             AND p.school_id = (SELECT school_id FROM classes WHERE id = class_members.class_id))
  OR EXISTS (SELECT 1 FROM parent_children pc WHERE pc.parent_id = auth.uid() AND pc.child_id = class_members.student_id)
);
DROP POLICY IF EXISTS "class_members_admin_all" ON class_members;
CREATE POLICY "class_members_admin_all" ON class_members FOR ALL
  USING    (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- TEACHER_CLASSES
DROP POLICY IF EXISTS "teacher_classes_select" ON teacher_classes;
CREATE POLICY "teacher_classes_select"    ON teacher_classes FOR SELECT USING (true);
DROP POLICY IF EXISTS "teacher_classes_admin_all" ON teacher_classes;
CREATE POLICY "teacher_classes_admin_all" ON teacher_classes FOR ALL
  USING    (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- PARENT_CHILDREN
DROP POLICY IF EXISTS "parent_children_select" ON parent_children;
CREATE POLICY "parent_children_select"    ON parent_children FOR SELECT
  USING (parent_id = auth.uid() OR child_id = auth.uid());
DROP POLICY IF EXISTS "parent_children_admin_all" ON parent_children;
CREATE POLICY "parent_children_admin_all" ON parent_children FOR ALL
  USING    (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- TIMETABLE_SLOTS
DROP POLICY IF EXISTS "timetable_select" ON timetable_slots;
CREATE POLICY "timetable_select"    ON timetable_slots FOR SELECT USING (school_id = get_my_school_id());
DROP POLICY IF EXISTS "timetable_admin_all" ON timetable_slots;
CREATE POLICY "timetable_admin_all" ON timetable_slots FOR ALL
  USING    (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = timetable_slots.school_id))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = timetable_slots.school_id));

-- ASSESSMENTS
DROP POLICY IF EXISTS "assessments_select" ON assessments;
CREATE POLICY "assessments_select" ON assessments FOR SELECT USING (
  teacher_id = auth.uid()
  OR EXISTS (SELECT 1 FROM class_members cm WHERE cm.student_id = auth.uid() AND cm.class_id = assessments.class_id)
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
             AND p.school_id = (SELECT school_id FROM classes WHERE id = assessments.class_id))
);
DROP POLICY IF EXISTS "assessments_teacher_all" ON assessments;
CREATE POLICY "assessments_teacher_all" ON assessments FOR ALL
  USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());
DROP POLICY IF EXISTS "assessments_admin_all" ON assessments;
CREATE POLICY "assessments_admin_all"   ON assessments FOR ALL
  USING    (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- GRADES
DROP POLICY IF EXISTS "grades_student_select" ON grades;
CREATE POLICY "grades_student_select" ON grades FOR SELECT USING (student_id = auth.uid());
DROP POLICY IF EXISTS "grades_parent_select" ON grades;
CREATE POLICY "grades_parent_select"  ON grades FOR SELECT USING (
  EXISTS (SELECT 1 FROM parent_children pc WHERE pc.parent_id = auth.uid() AND pc.child_id = grades.student_id)
);
DROP POLICY IF EXISTS "grades_teacher_all" ON grades;
CREATE POLICY "grades_teacher_all" ON grades FOR ALL
  USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());
DROP POLICY IF EXISTS "grades_admin_all" ON grades;
CREATE POLICY "grades_admin_all"   ON grades FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles p JOIN classes c ON c.school_id = p.school_id
    WHERE p.id = auth.uid() AND p.role = 'admin' AND c.id = grades.class_id
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles p JOIN classes c ON c.school_id = p.school_id
    WHERE p.id = auth.uid() AND p.role = 'admin' AND c.id = grades.class_id
  ));

-- ATTENDANCE
DROP POLICY IF EXISTS "attendance_student_select" ON attendance;
CREATE POLICY "attendance_student_select" ON attendance FOR SELECT USING (student_id = auth.uid());
DROP POLICY IF EXISTS "attendance_parent_select" ON attendance;
CREATE POLICY "attendance_parent_select"  ON attendance FOR SELECT USING (
  EXISTS (SELECT 1 FROM parent_children pc WHERE pc.parent_id = auth.uid() AND pc.child_id = attendance.student_id)
);
DROP POLICY IF EXISTS "attendance_teacher_select" ON attendance;
CREATE POLICY "attendance_teacher_select" ON attendance FOR SELECT USING (
  EXISTS (SELECT 1 FROM teacher_classes tc WHERE tc.teacher_id = auth.uid() AND tc.class_id = attendance.class_id)
);
DROP POLICY IF EXISTS "attendance_teacher_insert" ON attendance;
CREATE POLICY "attendance_teacher_insert" ON attendance FOR INSERT WITH CHECK (recorded_by = auth.uid());
DROP POLICY IF EXISTS "attendance_teacher_upsert" ON attendance;
CREATE POLICY "attendance_teacher_upsert" ON attendance FOR UPDATE
  USING (recorded_by = auth.uid()
    OR EXISTS (SELECT 1 FROM teacher_classes tc WHERE tc.teacher_id = auth.uid() AND tc.class_id = attendance.class_id));
DROP POLICY IF EXISTS "attendance_teacher_delete" ON attendance;
CREATE POLICY "attendance_teacher_delete" ON attendance FOR DELETE
  USING (recorded_by = auth.uid()
    OR EXISTS (SELECT 1 FROM teacher_classes tc WHERE tc.teacher_id = auth.uid() AND tc.class_id = attendance.class_id));
DROP POLICY IF EXISTS "attendance_admin_all" ON attendance;
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
DROP POLICY IF EXISTS "assignments_student_select" ON assignments;
CREATE POLICY "assignments_student_select" ON assignments FOR SELECT USING (
  EXISTS (SELECT 1 FROM class_members cm WHERE cm.class_id = assignments.class_id AND cm.student_id = auth.uid())
);
DROP POLICY IF EXISTS "assignments_parent_select" ON assignments;
CREATE POLICY "assignments_parent_select" ON assignments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM parent_children pc JOIN class_members cm ON cm.student_id = pc.child_id
    WHERE pc.parent_id = auth.uid() AND cm.class_id = assignments.class_id
  )
);
DROP POLICY IF EXISTS "assignments_teacher_all" ON assignments;
CREATE POLICY "assignments_teacher_all" ON assignments FOR ALL
  USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());
DROP POLICY IF EXISTS "assignments_admin_all" ON assignments;
CREATE POLICY "assignments_admin_all"   ON assignments FOR ALL
  USING    (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- SUBMISSIONS
DROP POLICY IF EXISTS "submissions_student_all" ON submissions;
CREATE POLICY "submissions_student_all"    ON submissions FOR ALL
  USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());
DROP POLICY IF EXISTS "submissions_teacher_select" ON submissions;
CREATE POLICY "submissions_teacher_select" ON submissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM assignments a WHERE a.id = submissions.assignment_id AND a.teacher_id = auth.uid())
);
DROP POLICY IF EXISTS "submissions_teacher_update" ON submissions;
CREATE POLICY "submissions_teacher_update" ON submissions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM assignments a WHERE a.id = submissions.assignment_id AND a.teacher_id = auth.uid())
);

-- MESSAGES
DROP POLICY IF EXISTS "messages_select" ON messages;
CREATE POLICY "messages_select" ON messages FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());
DROP POLICY IF EXISTS "messages_insert" ON messages;
CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (sender_id = auth.uid());
DROP POLICY IF EXISTS "messages_update" ON messages;
CREATE POLICY "messages_update" ON messages FOR UPDATE USING (recipient_id = auth.uid());

-- NOTIFICATIONS
DROP POLICY IF EXISTS "notifications_select" ON notifications;
CREATE POLICY "notifications_select" ON notifications FOR SELECT
  USING (user_id = auth.uid() OR profile_id = auth.uid()
    OR (school_id IS NOT NULL AND school_id = get_my_school_id()
        AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')));
DROP POLICY IF EXISTS "notifications_insert" ON notifications;
CREATE POLICY "notifications_insert" ON notifications FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "notifications_update" ON notifications;
CREATE POLICY "notifications_update" ON notifications FOR UPDATE
  USING (user_id = auth.uid() OR profile_id = auth.uid());

-- MINISTRY_REPORTS
DROP POLICY IF EXISTS "reports_select" ON ministry_reports;
CREATE POLICY "reports_select" ON ministry_reports FOR SELECT USING (
  submitted_by = auth.uid()
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = ministry_reports.school_id)
);
DROP POLICY IF EXISTS "reports_insert" ON ministry_reports;
CREATE POLICY "reports_insert" ON ministry_reports FOR INSERT WITH CHECK (
  submitted_by = auth.uid()
  AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','teacher'))
);

-- ZEKA_CONVERSATIONS
DROP POLICY IF EXISTS "zeka_own" ON zeka_conversations;
CREATE POLICY "zeka_own" ON zeka_conversations FOR ALL
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- IB_EXTENDED_ESSAYS
DROP POLICY IF EXISTS "ib_essays_student" ON ib_extended_essays;
CREATE POLICY "ib_essays_student"    ON ib_extended_essays FOR SELECT USING (student_id = auth.uid());
DROP POLICY IF EXISTS "ib_essays_supervisor" ON ib_extended_essays;
CREATE POLICY "ib_essays_supervisor" ON ib_extended_essays FOR SELECT USING (supervisor_id = auth.uid());
DROP POLICY IF EXISTS "ib_essays_admin_all" ON ib_extended_essays;
CREATE POLICY "ib_essays_admin_all"  ON ib_extended_essays FOR ALL
  USING    (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = ib_extended_essays.school_id))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = ib_extended_essays.school_id));

-- ANNOUNCEMENTS
DROP POLICY IF EXISTS "announcements_select" ON announcements;
CREATE POLICY "announcements_select"    ON announcements FOR SELECT USING (school_id = get_my_school_id());
DROP POLICY IF EXISTS "announcements_admin_all" ON announcements;
CREATE POLICY "announcements_admin_all" ON announcements FOR ALL
  USING    (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','teacher') AND p.school_id = announcements.school_id))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','teacher') AND p.school_id = announcements.school_id));

-- EVENTS
DROP POLICY IF EXISTS "events_select" ON events;
CREATE POLICY "events_select"    ON events FOR SELECT
  USING (school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()));
DROP POLICY IF EXISTS "events_admin_all" ON events;
CREATE POLICY "events_admin_all" ON events FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = events.school_id));

-- EXAMS
DROP POLICY IF EXISTS "exams_select" ON exams;
CREATE POLICY "exams_select"      ON exams FOR SELECT
  USING (school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()));
DROP POLICY IF EXISTS "exams_admin_all" ON exams;
CREATE POLICY "exams_admin_all"   ON exams FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = exams.school_id));
DROP POLICY IF EXISTS "exams_teacher_all" ON exams;
CREATE POLICY "exams_teacher_all" ON exams FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher' AND school_id = exams.school_id));

-- EXAM_RESULTS
DROP POLICY IF EXISTS "exam_results_select" ON exam_results;
CREATE POLICY "exam_results_select" ON exam_results FOR SELECT USING (
  student_id = auth.uid()
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','teacher')
             AND school_id = (SELECT school_id FROM exams WHERE id = exam_results.exam_id))
  OR EXISTS (SELECT 1 FROM parent_children WHERE parent_id = auth.uid() AND child_id = exam_results.student_id)
);
DROP POLICY IF EXISTS "exam_results_staff_insert" ON exam_results;
CREATE POLICY "exam_results_staff_insert" ON exam_results FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','teacher')));
DROP POLICY IF EXISTS "exam_results_staff_update" ON exam_results;
CREATE POLICY "exam_results_staff_update" ON exam_results FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','teacher')));

-- DISCIPLINE
DROP POLICY IF EXISTS "discipline_admin_all" ON discipline_records;
CREATE POLICY "discipline_admin_all"   ON discipline_records FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = discipline_records.school_id));
DROP POLICY IF EXISTS "discipline_teacher_all" ON discipline_records;
CREATE POLICY "discipline_teacher_all" ON discipline_records FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher' AND school_id = discipline_records.school_id));
DROP POLICY IF EXISTS "discipline_student_select" ON discipline_records;
CREATE POLICY "discipline_student_select" ON discipline_records FOR SELECT USING (student_id = auth.uid());
DROP POLICY IF EXISTS "discipline_parent_select" ON discipline_records;
CREATE POLICY "discipline_parent_select"  ON discipline_records FOR SELECT USING (
  EXISTS (SELECT 1 FROM parent_children WHERE parent_id = auth.uid() AND child_id = discipline_records.student_id)
);

-- SUBSTITUTIONS
DROP POLICY IF EXISTS "substitutions_admin_all" ON substitutions;
CREATE POLICY "substitutions_admin_all"    ON substitutions FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = substitutions.school_id));
DROP POLICY IF EXISTS "substitutions_teacher_select" ON substitutions;
CREATE POLICY "substitutions_teacher_select" ON substitutions FOR SELECT
  USING (absent_teacher_id = auth.uid() OR substitute_teacher_id = auth.uid());

-- HOMEWORK_ITEMS
DROP POLICY IF EXISTS "homework_own" ON homework_items;
CREATE POLICY "homework_own" ON homework_items FOR ALL
  USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

-- CONVERSATIONS
DROP POLICY IF EXISTS "conv_participant_all" ON conversations;
CREATE POLICY "conv_participant_all" ON conversations FOR ALL
  USING (parent_id = auth.uid() OR teacher_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = conversations.school_id));

-- CONVERSATION_MESSAGES
DROP POLICY IF EXISTS "conv_msg_participant_all" ON conversation_messages;
CREATE POLICY "conv_msg_participant_all" ON conversation_messages FOR ALL
  USING (EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = conversation_messages.conversation_id
      AND (c.parent_id = auth.uid() OR c.teacher_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = c.school_id))
  ));

-- ================================================================
-- NEW TABLES: ENABLE ROW LEVEL SECURITY
-- ================================================================
ALTER TABLE cas_entries          ENABLE ROW LEVEL SECURITY;
ALTER TABLE unit_plans           ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE admissions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests       ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms                ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_bookings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_books        ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_checkouts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys              ENABLE ROW LEVEL SECURITY;
ALTER TABLE college_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ptc_slots            ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- NEW TABLES: RLS POLICIES
-- ================================================================

-- CAS_ENTRIES
DROP POLICY IF EXISTS "cas_admin_all" ON cas_entries;
CREATE POLICY "cas_admin_all" ON cas_entries FOR ALL
  USING    (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = cas_entries.school_id))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = cas_entries.school_id));
DROP POLICY IF EXISTS "cas_supervisor_select" ON cas_entries;
CREATE POLICY "cas_supervisor_select" ON cas_entries FOR SELECT
  USING (supervisor_id = auth.uid());
DROP POLICY IF EXISTS "cas_supervisor_update" ON cas_entries;
CREATE POLICY "cas_supervisor_update" ON cas_entries FOR UPDATE
  USING (supervisor_id = auth.uid());
DROP POLICY IF EXISTS "cas_student_all" ON cas_entries;
CREATE POLICY "cas_student_all" ON cas_entries FOR ALL
  USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());
DROP POLICY IF EXISTS "cas_parent_select" ON cas_entries;
CREATE POLICY "cas_parent_select" ON cas_entries FOR SELECT
  USING (EXISTS (SELECT 1 FROM parent_children WHERE parent_id = auth.uid() AND child_id = cas_entries.student_id));

-- UNIT_PLANS
DROP POLICY IF EXISTS "unit_plans_admin_all" ON unit_plans;
CREATE POLICY "unit_plans_admin_all" ON unit_plans FOR ALL
  USING    (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = unit_plans.school_id))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = unit_plans.school_id));
DROP POLICY IF EXISTS "unit_plans_teacher_all" ON unit_plans;
CREATE POLICY "unit_plans_teacher_all" ON unit_plans FOR ALL
  USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());
DROP POLICY IF EXISTS "unit_plans_school_select" ON unit_plans;
CREATE POLICY "unit_plans_school_select" ON unit_plans FOR SELECT
  USING (school_id = get_my_school_id());

-- PORTFOLIO_ITEMS
DROP POLICY IF EXISTS "portfolio_admin_all" ON portfolio_items;
CREATE POLICY "portfolio_admin_all" ON portfolio_items FOR ALL
  USING    (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = portfolio_items.school_id))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = portfolio_items.school_id));
DROP POLICY IF EXISTS "portfolio_teacher_select" ON portfolio_items;
CREATE POLICY "portfolio_teacher_select" ON portfolio_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher' AND school_id = portfolio_items.school_id));
DROP POLICY IF EXISTS "portfolio_student_all" ON portfolio_items;
CREATE POLICY "portfolio_student_all" ON portfolio_items FOR ALL
  USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());
DROP POLICY IF EXISTS "portfolio_parent_select" ON portfolio_items;
CREATE POLICY "portfolio_parent_select" ON portfolio_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM parent_children WHERE parent_id = auth.uid() AND child_id = portfolio_items.student_id));

-- ADMISSIONS
DROP POLICY IF EXISTS "admissions_admin_all" ON admissions;
CREATE POLICY "admissions_admin_all" ON admissions FOR ALL
  USING    (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = admissions.school_id))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = admissions.school_id));
DROP POLICY IF EXISTS "admissions_teacher_select" ON admissions;
CREATE POLICY "admissions_teacher_select" ON admissions FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher' AND school_id = admissions.school_id));

-- LEAVE_REQUESTS
DROP POLICY IF EXISTS "leave_admin_all" ON leave_requests;
CREATE POLICY "leave_admin_all" ON leave_requests FOR ALL
  USING    (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = leave_requests.school_id))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = leave_requests.school_id));
DROP POLICY IF EXISTS "leave_teacher_all" ON leave_requests;
CREATE POLICY "leave_teacher_all" ON leave_requests FOR ALL
  USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());

-- ROOMS
DROP POLICY IF EXISTS "rooms_school_select" ON rooms;
CREATE POLICY "rooms_school_select" ON rooms FOR SELECT
  USING (school_id = get_my_school_id());
DROP POLICY IF EXISTS "rooms_admin_all" ON rooms;
CREATE POLICY "rooms_admin_all" ON rooms FOR ALL
  USING    (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = rooms.school_id))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = rooms.school_id));

-- ROOM_BOOKINGS
DROP POLICY IF EXISTS "room_bookings_school_select" ON room_bookings;
CREATE POLICY "room_bookings_school_select" ON room_bookings FOR SELECT
  USING (school_id = get_my_school_id());
DROP POLICY IF EXISTS "room_bookings_own_all" ON room_bookings;
CREATE POLICY "room_bookings_own_all" ON room_bookings FOR ALL
  USING (booked_by = auth.uid()) WITH CHECK (booked_by = auth.uid());
DROP POLICY IF EXISTS "room_bookings_admin_all" ON room_bookings;
CREATE POLICY "room_bookings_admin_all" ON room_bookings FOR ALL
  USING    (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = room_bookings.school_id))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = room_bookings.school_id));

-- LIBRARY_BOOKS
DROP POLICY IF EXISTS "library_books_school_select" ON library_books;
CREATE POLICY "library_books_school_select" ON library_books FOR SELECT
  USING (school_id = get_my_school_id());
DROP POLICY IF EXISTS "library_books_admin_all" ON library_books;
CREATE POLICY "library_books_admin_all" ON library_books FOR ALL
  USING    (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = library_books.school_id))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = library_books.school_id));

-- LIBRARY_CHECKOUTS
DROP POLICY IF EXISTS "library_checkouts_student_select" ON library_checkouts;
CREATE POLICY "library_checkouts_student_select" ON library_checkouts FOR SELECT
  USING (student_id = auth.uid());
DROP POLICY IF EXISTS "library_checkouts_parent_select" ON library_checkouts;
CREATE POLICY "library_checkouts_parent_select" ON library_checkouts FOR SELECT
  USING (EXISTS (SELECT 1 FROM parent_children WHERE parent_id = auth.uid() AND child_id = library_checkouts.student_id));
DROP POLICY IF EXISTS "library_checkouts_admin_all" ON library_checkouts;
CREATE POLICY "library_checkouts_admin_all" ON library_checkouts FOR ALL
  USING    (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = library_checkouts.school_id))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = library_checkouts.school_id));
DROP POLICY IF EXISTS "library_checkouts_teacher_all" ON library_checkouts;
CREATE POLICY "library_checkouts_teacher_all" ON library_checkouts FOR ALL
  USING    (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher' AND school_id = library_checkouts.school_id))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher' AND school_id = library_checkouts.school_id));

-- SURVEYS
DROP POLICY IF EXISTS "surveys_school_select" ON surveys;
CREATE POLICY "surveys_school_select" ON surveys FOR SELECT
  USING (school_id = get_my_school_id());
DROP POLICY IF EXISTS "surveys_admin_all" ON surveys;
CREATE POLICY "surveys_admin_all" ON surveys FOR ALL
  USING    (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = surveys.school_id))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = surveys.school_id));
DROP POLICY IF EXISTS "surveys_teacher_all" ON surveys;
CREATE POLICY "surveys_teacher_all" ON surveys FOR ALL
  USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

-- COLLEGE_APPLICATIONS
DROP POLICY IF EXISTS "college_admin_all" ON college_applications;
CREATE POLICY "college_admin_all" ON college_applications FOR ALL
  USING    (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = college_applications.school_id))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = college_applications.school_id));
DROP POLICY IF EXISTS "college_teacher_select" ON college_applications;
CREATE POLICY "college_teacher_select" ON college_applications FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher' AND school_id = college_applications.school_id));
DROP POLICY IF EXISTS "college_student_select" ON college_applications;
CREATE POLICY "college_student_select" ON college_applications FOR SELECT
  USING (student_id = auth.uid());
DROP POLICY IF EXISTS "college_parent_select" ON college_applications;
CREATE POLICY "college_parent_select" ON college_applications FOR SELECT
  USING (EXISTS (SELECT 1 FROM parent_children WHERE parent_id = auth.uid() AND child_id = college_applications.student_id));

-- PTC_SLOTS
DROP POLICY IF EXISTS "ptc_admin_all" ON ptc_slots;
CREATE POLICY "ptc_admin_all" ON ptc_slots FOR ALL
  USING    (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = ptc_slots.school_id))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = ptc_slots.school_id));
DROP POLICY IF EXISTS "ptc_teacher_all" ON ptc_slots;
CREATE POLICY "ptc_teacher_all" ON ptc_slots FOR ALL
  USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());
DROP POLICY IF EXISTS "ptc_parent_select" ON ptc_slots;
CREATE POLICY "ptc_parent_select" ON ptc_slots FOR SELECT
  USING (booked_by = auth.uid());
DROP POLICY IF EXISTS "ptc_student_select" ON ptc_slots;
CREATE POLICY "ptc_student_select" ON ptc_slots FOR SELECT
  USING (student_id = auth.uid());
