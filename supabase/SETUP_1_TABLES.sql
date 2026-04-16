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
CREATE POLICY "schools_read"         ON schools FOR SELECT USING (true);
CREATE POLICY "schools_insert"       ON schools FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "schools_admin_update" ON schools FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = schools.id));

-- PROFILES (uses get_my_school_id() — defined in Step 2)
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (
  auth.uid() = id
  OR (school_id IS NOT NULL AND school_id = get_my_school_id())
);
CREATE POLICY "profiles_insert"       ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own"   ON profiles FOR UPDATE
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_admin" ON profiles FOR UPDATE USING (
  school_id IS NOT NULL AND school_id = get_my_school_id()
  AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);
CREATE POLICY "profiles_delete_admin" ON profiles FOR DELETE USING (
  school_id IS NOT NULL AND school_id = get_my_school_id()
  AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- SUBJECTS
CREATE POLICY "subjects_select"    ON subjects FOR SELECT USING (true);
CREATE POLICY "subjects_admin_all" ON subjects FOR ALL
  USING    (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = subjects.school_id))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = subjects.school_id));

-- CLASSES
CREATE POLICY "classes_select"    ON classes FOR SELECT USING (true);
CREATE POLICY "classes_admin_all" ON classes FOR ALL
  USING    (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = classes.school_id))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = classes.school_id));

-- CLASS_MEMBERS
CREATE POLICY "class_members_select" ON class_members FOR SELECT USING (
  student_id = auth.uid()
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','teacher')
             AND p.school_id = (SELECT school_id FROM classes WHERE id = class_members.class_id))
  OR EXISTS (SELECT 1 FROM parent_children pc WHERE pc.parent_id = auth.uid() AND pc.child_id = class_members.student_id)
);
CREATE POLICY "class_members_admin_all" ON class_members FOR ALL
  USING    (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- TEACHER_CLASSES
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
CREATE POLICY "timetable_select"    ON timetable_slots FOR SELECT USING (school_id = get_my_school_id());
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
  USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "assessments_admin_all"   ON assessments FOR ALL
  USING    (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- GRADES
CREATE POLICY "grades_student_select" ON grades FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "grades_parent_select"  ON grades FOR SELECT USING (
  EXISTS (SELECT 1 FROM parent_children pc WHERE pc.parent_id = auth.uid() AND pc.child_id = grades.student_id)
);
CREATE POLICY "grades_teacher_all" ON grades FOR ALL
  USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());
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
CREATE POLICY "attendance_student_select" ON attendance FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "attendance_parent_select"  ON attendance FOR SELECT USING (
  EXISTS (SELECT 1 FROM parent_children pc WHERE pc.parent_id = auth.uid() AND pc.child_id = attendance.student_id)
);
CREATE POLICY "attendance_teacher_select" ON attendance FOR SELECT USING (
  EXISTS (SELECT 1 FROM teacher_classes tc WHERE tc.teacher_id = auth.uid() AND tc.class_id = attendance.class_id)
);
CREATE POLICY "attendance_teacher_insert" ON attendance FOR INSERT WITH CHECK (recorded_by = auth.uid());
CREATE POLICY "attendance_teacher_upsert" ON attendance FOR UPDATE
  USING (recorded_by = auth.uid()
    OR EXISTS (SELECT 1 FROM teacher_classes tc WHERE tc.teacher_id = auth.uid() AND tc.class_id = attendance.class_id));
CREATE POLICY "attendance_teacher_delete" ON attendance FOR DELETE
  USING (recorded_by = auth.uid()
    OR EXISTS (SELECT 1 FROM teacher_classes tc WHERE tc.teacher_id = auth.uid() AND tc.class_id = attendance.class_id));
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
  USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "assignments_admin_all"   ON assignments FOR ALL
  USING    (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- SUBMISSIONS
CREATE POLICY "submissions_student_all"    ON submissions FOR ALL
  USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());
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

-- NOTIFICATIONS
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
  AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','teacher'))
);

-- ZEKA_CONVERSATIONS
CREATE POLICY "zeka_own" ON zeka_conversations FOR ALL
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

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

-- EVENTS
CREATE POLICY "events_select"    ON events FOR SELECT
  USING (school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "events_admin_all" ON events FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = events.school_id));

-- EXAMS
CREATE POLICY "exams_select"      ON exams FOR SELECT
  USING (school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "exams_admin_all"   ON exams FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = exams.school_id));
CREATE POLICY "exams_teacher_all" ON exams FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher' AND school_id = exams.school_id));

-- EXAM_RESULTS
CREATE POLICY "exam_results_select" ON exam_results FOR SELECT USING (
  student_id = auth.uid()
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','teacher')
             AND school_id = (SELECT school_id FROM exams WHERE id = exam_results.exam_id))
  OR EXISTS (SELECT 1 FROM parent_children WHERE parent_id = auth.uid() AND child_id = exam_results.student_id)
);
CREATE POLICY "exam_results_staff_insert" ON exam_results FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','teacher')));
CREATE POLICY "exam_results_staff_update" ON exam_results FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','teacher')));

-- DISCIPLINE
CREATE POLICY "discipline_admin_all"   ON discipline_records FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = discipline_records.school_id));
CREATE POLICY "discipline_teacher_all" ON discipline_records FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher' AND school_id = discipline_records.school_id));
CREATE POLICY "discipline_student_select" ON discipline_records FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "discipline_parent_select"  ON discipline_records FOR SELECT USING (
  EXISTS (SELECT 1 FROM parent_children WHERE parent_id = auth.uid() AND child_id = discipline_records.student_id)
);

-- SUBSTITUTIONS
CREATE POLICY "substitutions_admin_all"    ON substitutions FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = substitutions.school_id));
CREATE POLICY "substitutions_teacher_select" ON substitutions FOR SELECT
  USING (absent_teacher_id = auth.uid() OR substitute_teacher_id = auth.uid());

-- HOMEWORK_ITEMS
CREATE POLICY "homework_own" ON homework_items FOR ALL
  USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

-- CONVERSATIONS
CREATE POLICY "conv_participant_all" ON conversations FOR ALL
  USING (parent_id = auth.uid() OR teacher_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = conversations.school_id));

-- CONVERSATION_MESSAGES
CREATE POLICY "conv_msg_participant_all" ON conversation_messages FOR ALL
  USING (EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = conversation_messages.conversation_id
      AND (c.parent_id = auth.uid() OR c.teacher_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = c.school_id))
  ));
