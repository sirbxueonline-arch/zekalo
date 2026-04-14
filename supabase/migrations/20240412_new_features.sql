-- ============================================================
-- NEW FEATURES MIGRATION
-- Events, Exams, Discipline, Substitutions, Homework, Conversations, SuperAdmin
-- ============================================================

-- Allow super_admin role
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('student', 'teacher', 'parent', 'admin', 'super_admin'));

-- ─────────────────────────────────────
-- EVENTS / CALENDAR
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   uuid REFERENCES schools ON DELETE CASCADE NOT NULL,
  title       text NOT NULL,
  description text,
  start_date  date NOT NULL,
  end_date    date,
  type        text NOT NULL DEFAULT 'event'
              CHECK (type IN ('holiday', 'exam', 'meeting', 'event', 'other')),
  visible_to  text NOT NULL DEFAULT 'all'
              CHECK (visible_to IN ('all', 'teachers', 'students', 'parents', 'admin')),
  color       text DEFAULT '#534AB7',
  created_by  uuid REFERENCES profiles ON DELETE SET NULL,
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events_school_select" ON events FOR SELECT
  USING (school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "events_admin_all" ON events FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = events.school_id));

-- ─────────────────────────────────────
-- EXAMS
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS exams (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id         uuid REFERENCES schools ON DELETE CASCADE NOT NULL,
  class_id          uuid REFERENCES classes ON DELETE CASCADE,
  subject_id        uuid REFERENCES subjects ON DELETE CASCADE,
  title             text NOT NULL,
  exam_date         date NOT NULL,
  duration_minutes  int,
  max_score         numeric DEFAULT 100,
  published         boolean DEFAULT false,
  created_by        uuid REFERENCES profiles ON DELETE SET NULL,
  created_at        timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS exam_results (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id    uuid REFERENCES exams ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  score      numeric,
  notes      text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(exam_id, student_id)
);
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exams_school_select" ON exams FOR SELECT
  USING (school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "exams_admin_all" ON exams FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = exams.school_id));
CREATE POLICY "exams_teacher_all" ON exams FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher' AND school_id = exams.school_id));
CREATE POLICY "exam_results_select" ON exam_results FOR SELECT
  USING (
    student_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','teacher') AND school_id = (SELECT school_id FROM exams WHERE id = exam_results.exam_id))
    OR EXISTS (SELECT 1 FROM parent_children WHERE parent_id = auth.uid() AND child_id = exam_results.student_id)
  );
CREATE POLICY "exam_results_teacher_insert" ON exam_results FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','teacher')));
CREATE POLICY "exam_results_teacher_update" ON exam_results FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','teacher')));

-- ─────────────────────────────────────
-- DISCIPLINE LOG
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS discipline_records (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id       uuid REFERENCES schools ON DELETE CASCADE NOT NULL,
  student_id      uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  recorded_by     uuid REFERENCES profiles ON DELETE SET NULL,
  date            date NOT NULL DEFAULT CURRENT_DATE,
  type            text NOT NULL CHECK (type IN ('warning','detention','suspension','commendation','note')),
  description     text NOT NULL,
  parent_notified boolean DEFAULT false,
  created_at      timestamptz DEFAULT now()
);
ALTER TABLE discipline_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "discipline_admin_all" ON discipline_records FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = discipline_records.school_id));
CREATE POLICY "discipline_teacher_all" ON discipline_records FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher' AND school_id = discipline_records.school_id));
CREATE POLICY "discipline_student_select" ON discipline_records FOR SELECT
  USING (student_id = auth.uid());
CREATE POLICY "discipline_parent_select" ON discipline_records FOR SELECT
  USING (EXISTS (SELECT 1 FROM parent_children WHERE parent_id = auth.uid() AND child_id = discipline_records.student_id));

-- ─────────────────────────────────────
-- TEACHER SUBSTITUTIONS
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS substitutions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id             uuid REFERENCES schools ON DELETE CASCADE NOT NULL,
  timetable_slot_id     uuid REFERENCES timetable_slots ON DELETE CASCADE NOT NULL,
  absent_teacher_id     uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  substitute_teacher_id uuid REFERENCES profiles ON DELETE CASCADE,
  date                  date NOT NULL,
  reason                text,
  created_at            timestamptz DEFAULT now(),
  UNIQUE(timetable_slot_id, date)
);
ALTER TABLE substitutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "substitutions_admin_all" ON substitutions FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = substitutions.school_id));
CREATE POLICY "substitutions_teacher_select" ON substitutions FOR SELECT
  USING (absent_teacher_id = auth.uid() OR substitute_teacher_id = auth.uid());

-- ─────────────────────────────────────
-- HOMEWORK (personal student tracker)
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS homework_items (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  subject    text NOT NULL,
  title      text NOT NULL,
  due_date   date,
  completed  boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE homework_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "homework_own" ON homework_items FOR ALL
  USING (student_id = auth.uid());

-- ─────────────────────────────────────
-- PARENT-TEACHER CONVERSATIONS
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id  uuid REFERENCES schools ON DELETE CASCADE NOT NULL,
  parent_id  uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  teacher_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(parent_id, teacher_id, student_id)
);
CREATE TABLE IF NOT EXISTS conversation_messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations ON DELETE CASCADE NOT NULL,
  sender_id       uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  content         text NOT NULL,
  read            boolean DEFAULT false,
  created_at      timestamptz DEFAULT now()
);
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conv_participant_all" ON conversations FOR ALL
  USING (parent_id = auth.uid() OR teacher_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = conversations.school_id));
CREATE POLICY "conv_msg_participant_all" ON conversation_messages FOR ALL
  USING (EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = conversation_messages.conversation_id
      AND (c.parent_id = auth.uid() OR c.teacher_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin' AND school_id = c.school_id))
  ));
