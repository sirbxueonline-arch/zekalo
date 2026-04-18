-- ============================================================
-- MISSING_TABLES.sql
-- Creates all tables the app references but that don't exist.
-- Paste into Supabase SQL Editor and run once.
-- Safe to re-run (uses CREATE TABLE IF NOT EXISTS).
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. EXAMS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exams (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id        uuid REFERENCES schools    ON DELETE CASCADE NOT NULL,
  class_id         uuid REFERENCES classes    ON DELETE CASCADE NOT NULL,
  subject_id       uuid REFERENCES subjects   ON DELETE CASCADE NOT NULL,
  created_by       uuid REFERENCES profiles   ON DELETE CASCADE NOT NULL,
  title            text NOT NULL,
  exam_date        date NOT NULL,
  duration_minutes int  DEFAULT 60,
  max_score        numeric DEFAULT 100,
  published        boolean DEFAULT false,
  created_at       timestamptz DEFAULT now()
);

ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teachers manage own exams" ON exams;
CREATE POLICY "teachers manage own exams" ON exams FOR ALL
  USING    (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "students read published exams" ON exams;
CREATE POLICY "students read published exams" ON exams FOR SELECT USING (
  published = true AND EXISTS (
    SELECT 1 FROM class_members cm WHERE cm.student_id = auth.uid() AND cm.class_id = exams.class_id
  )
);

DROP POLICY IF EXISTS "parents read published exams" ON exams;
CREATE POLICY "parents read published exams" ON exams FOR SELECT USING (
  published = true AND EXISTS (
    SELECT 1 FROM parent_children pc
    JOIN class_members cm ON cm.student_id = pc.child_id
    WHERE pc.parent_id = auth.uid() AND cm.class_id = exams.class_id
  )
);

DROP POLICY IF EXISTS "admin manages exams" ON exams;
CREATE POLICY "admin manages exams" ON exams FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = exams.school_id)
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = exams.school_id)
);

-- ────────────────────────────────────────────────────────────
-- 2. EXAM RESULTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exam_results (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id    uuid REFERENCES exams    ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  score      numeric,
  notes      text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(exam_id, student_id)
);

ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teachers manage exam_results" ON exam_results;
CREATE POLICY "teachers manage exam_results" ON exam_results FOR ALL USING (
  EXISTS (SELECT 1 FROM exams e WHERE e.id = exam_results.exam_id AND e.created_by = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM exams e WHERE e.id = exam_results.exam_id AND e.created_by = auth.uid())
);

DROP POLICY IF EXISTS "students read own exam_results" ON exam_results;
CREATE POLICY "students read own exam_results" ON exam_results FOR SELECT
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "parents read child exam_results" ON exam_results;
CREATE POLICY "parents read child exam_results" ON exam_results FOR SELECT USING (
  EXISTS (SELECT 1 FROM parent_children pc WHERE pc.parent_id = auth.uid() AND pc.child_id = exam_results.student_id)
);

-- ────────────────────────────────────────────────────────────
-- 3. HOMEWORK ITEMS  (student personal homework tracker)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS homework_items (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  subject    text,
  title      text NOT NULL,
  due_date   date,
  completed  boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE homework_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "students manage own homework" ON homework_items;
CREATE POLICY "students manage own homework" ON homework_items FOR ALL
  USING    (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- ────────────────────────────────────────────────────────────
-- 4. PORTFOLIO ITEMS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  school_id   uuid REFERENCES schools  ON DELETE CASCADE,
  title       text NOT NULL,
  description text,
  subject     text,
  reflection  text,
  date        date,
  file_url    text,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "students manage own portfolio" ON portfolio_items;
CREATE POLICY "students manage own portfolio" ON portfolio_items FOR ALL
  USING    (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "teachers read school portfolio" ON portfolio_items;
CREATE POLICY "teachers read school portfolio" ON portfolio_items FOR SELECT USING (
  school_id = get_my_school_id()
);

DROP POLICY IF EXISTS "admin reads school portfolio" ON portfolio_items;
CREATE POLICY "admin reads school portfolio" ON portfolio_items FOR SELECT USING (
  school_id = get_my_school_id()
);

-- ────────────────────────────────────────────────────────────
-- 5. UNIT PLANS  (teacher IB unit planner)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS unit_plans (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   uuid REFERENCES schools  ON DELETE CASCADE NOT NULL,
  teacher_id  uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  class_id    uuid REFERENCES classes  ON DELETE CASCADE,
  title       text NOT NULL,
  subject     text,
  description text,
  atl_skills  text[],
  start_date  date,
  end_date    date,
  weeks       int,
  status      text DEFAULT 'draft' CHECK (status IN ('draft','active','complete')),
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE unit_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teachers manage own unit_plans" ON unit_plans;
CREATE POLICY "teachers manage own unit_plans" ON unit_plans FOR ALL
  USING    (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

DROP POLICY IF EXISTS "admin reads school unit_plans" ON unit_plans;
CREATE POLICY "admin reads school unit_plans" ON unit_plans FOR SELECT USING (
  school_id = get_my_school_id()
);

-- ────────────────────────────────────────────────────────────
-- 6. DISCIPLINE RECORDS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS discipline_records (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id        uuid REFERENCES schools  ON DELETE CASCADE NOT NULL,
  student_id       uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  recorded_by      uuid REFERENCES profiles ON DELETE SET NULL,
  date             date DEFAULT current_date,
  type             text DEFAULT 'warning' CHECK (type IN ('warning','detention','suspension','commendation','other')),
  description      text NOT NULL,
  parent_notified  boolean DEFAULT false,
  created_at       timestamptz DEFAULT now()
);

ALTER TABLE discipline_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teachers manage discipline" ON discipline_records;
CREATE POLICY "teachers manage discipline" ON discipline_records FOR ALL USING (
  school_id = get_my_school_id() AND EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('teacher','admin')
  )
) WITH CHECK (
  school_id = get_my_school_id() AND EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('teacher','admin')
  )
);

DROP POLICY IF EXISTS "students read own discipline" ON discipline_records;
CREATE POLICY "students read own discipline" ON discipline_records FOR SELECT
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "parents read child discipline" ON discipline_records;
CREATE POLICY "parents read child discipline" ON discipline_records FOR SELECT USING (
  EXISTS (SELECT 1 FROM parent_children pc WHERE pc.parent_id = auth.uid() AND pc.child_id = discipline_records.student_id)
);

-- ────────────────────────────────────────────────────────────
-- 7. CONVERSATIONS  (parent ↔ teacher messaging threads)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   uuid REFERENCES schools  ON DELETE CASCADE NOT NULL,
  parent_id   uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  teacher_id  uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  student_id  uuid REFERENCES profiles ON DELETE CASCADE,
  subject     text,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE(parent_id, teacher_id, student_id)
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "participants read conversations" ON conversations;
CREATE POLICY "participants read conversations" ON conversations FOR SELECT
  USING (parent_id = auth.uid() OR teacher_id = auth.uid());

DROP POLICY IF EXISTS "participants insert conversations" ON conversations;
CREATE POLICY "participants insert conversations" ON conversations FOR INSERT
  WITH CHECK (parent_id = auth.uid() OR teacher_id = auth.uid());

DROP POLICY IF EXISTS "participants update conversations" ON conversations;
CREATE POLICY "participants update conversations" ON conversations FOR UPDATE
  USING (parent_id = auth.uid() OR teacher_id = auth.uid());

DROP POLICY IF EXISTS "admin reads school conversations" ON conversations;
CREATE POLICY "admin reads school conversations" ON conversations FOR SELECT USING (
  school_id = get_my_school_id()
);

-- ────────────────────────────────────────────────────────────
-- 8. CONVERSATION MESSAGES
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversation_messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations ON DELETE CASCADE NOT NULL,
  sender_id       uuid REFERENCES profiles      ON DELETE CASCADE NOT NULL,
  content         text NOT NULL,
  read            boolean DEFAULT false,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "participants manage conv messages" ON conversation_messages;
CREATE POLICY "participants manage conv messages" ON conversation_messages FOR ALL USING (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = conversation_messages.conversation_id
    AND (c.parent_id = auth.uid() OR c.teacher_id = auth.uid())
  )
) WITH CHECK (
  sender_id = auth.uid() AND EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = conversation_messages.conversation_id
    AND (c.parent_id = auth.uid() OR c.teacher_id = auth.uid())
  )
);

-- ────────────────────────────────────────────────────────────
-- 9. ROOM BOOKINGS  (admin)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS room_bookings (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id    uuid REFERENCES schools  ON DELETE CASCADE NOT NULL,
  room_id      text NOT NULL,
  teacher_id   uuid REFERENCES profiles ON DELETE CASCADE,
  teacher_name text,
  date         date NOT NULL,
  time_from    time NOT NULL,
  time_to      time NOT NULL,
  purpose      text,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE room_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "school members manage room_bookings" ON room_bookings;
CREATE POLICY "school members manage room_bookings" ON room_bookings FOR ALL USING (
  school_id = get_my_school_id()
) WITH CHECK (school_id = get_my_school_id());

-- ────────────────────────────────────────────────────────────
-- 10. PT SLOTS  (parent-teacher conference slots)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pt_slots (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id  uuid REFERENCES schools  ON DELETE CASCADE NOT NULL,
  teacher_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  parent_id  uuid REFERENCES profiles ON DELETE SET NULL,
  student_id uuid REFERENCES profiles ON DELETE SET NULL,
  date       date NOT NULL,
  time_from  time NOT NULL,
  time_to    time NOT NULL,
  status     text DEFAULT 'available' CHECK (status IN ('available','booked','cancelled')),
  notes      text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pt_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "school members manage pt_slots" ON pt_slots;
CREATE POLICY "school members manage pt_slots" ON pt_slots FOR ALL USING (
  school_id = get_my_school_id()
) WITH CHECK (school_id = get_my_school_id());

-- ────────────────────────────────────────────────────────────
-- 11. EVENTS  (school calendar events)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   uuid REFERENCES schools ON DELETE CASCADE NOT NULL,
  title       text NOT NULL,
  description text,
  start_date  date NOT NULL,
  end_date    date,
  type        text DEFAULT 'general',
  created_by  uuid REFERENCES profiles ON DELETE SET NULL,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "school members read events" ON events;
CREATE POLICY "school members read events" ON events FOR SELECT USING (
  school_id = get_my_school_id()
);

DROP POLICY IF EXISTS "admin manages events" ON events;
CREATE POLICY "admin manages events" ON events FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = events.school_id)
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = events.school_id)
);

-- ────────────────────────────────────────────────────────────
-- 12. SURVEYS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS surveys (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   uuid REFERENCES schools  ON DELETE CASCADE NOT NULL,
  created_by  uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  title       text NOT NULL,
  description text,
  questions   jsonb DEFAULT '[]',
  published   boolean DEFAULT false,
  due_date    date,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin manages surveys" ON surveys;
CREATE POLICY "admin manages surveys" ON surveys FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = surveys.school_id)
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = surveys.school_id)
);

DROP POLICY IF EXISTS "school members read surveys" ON surveys;
CREATE POLICY "school members read surveys" ON surveys FOR SELECT USING (
  published = true AND school_id = get_my_school_id()
);

-- ────────────────────────────────────────────────────────────
-- 13. LEAVE REQUESTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leave_requests (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   uuid REFERENCES schools  ON DELETE CASCADE NOT NULL,
  student_id  uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  parent_id   uuid REFERENCES profiles ON DELETE SET NULL,
  start_date  date NOT NULL,
  end_date    date NOT NULL,
  reason      text NOT NULL,
  status      text DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_by uuid REFERENCES profiles ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "school members manage leave_requests" ON leave_requests;
CREATE POLICY "school members manage leave_requests" ON leave_requests FOR ALL USING (
  school_id = get_my_school_id()
) WITH CHECK (school_id = get_my_school_id());

-- ────────────────────────────────────────────────────────────
-- 14. LIBRARY
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS library_books (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   uuid REFERENCES schools ON DELETE CASCADE NOT NULL,
  title       text NOT NULL,
  author      text,
  isbn        text,
  category    text,
  copies      int DEFAULT 1,
  available   int DEFAULT 1,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS library_checkouts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id     uuid REFERENCES library_books ON DELETE CASCADE NOT NULL,
  student_id  uuid REFERENCES profiles      ON DELETE CASCADE NOT NULL,
  checked_out date DEFAULT current_date,
  due_date    date,
  returned    boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE library_books     ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_checkouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "school members read library" ON library_books;
CREATE POLICY "school members read library" ON library_books FOR SELECT USING (
  school_id = get_my_school_id()
);

DROP POLICY IF EXISTS "admin manages library" ON library_books;
CREATE POLICY "admin manages library" ON library_books FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = library_books.school_id)
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = library_books.school_id)
);

DROP POLICY IF EXISTS "students read own checkouts" ON library_checkouts;
CREATE POLICY "students read own checkouts" ON library_checkouts FOR SELECT
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "admin manages checkouts" ON library_checkouts;
CREATE POLICY "admin manages checkouts" ON library_checkouts FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles p JOIN library_books b ON b.school_id = p.school_id
    WHERE p.id = auth.uid() AND p.role = 'admin' AND b.id = library_checkouts.book_id
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p JOIN library_books b ON b.school_id = p.school_id
    WHERE p.id = auth.uid() AND p.role = 'admin' AND b.id = library_checkouts.book_id
  )
);

-- ────────────────────────────────────────────────────────────
-- 15. CAS ENTRIES  (IB CAS log)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cas_entries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  school_id   uuid REFERENCES schools  ON DELETE CASCADE,
  title       text NOT NULL,
  category    text CHECK (category IN ('creativity','activity','service')),
  description text,
  hours       numeric DEFAULT 0,
  date        date DEFAULT current_date,
  approved    boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE cas_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "students manage own cas" ON cas_entries;
CREATE POLICY "students manage own cas" ON cas_entries FOR ALL
  USING    (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "school members read cas" ON cas_entries;
CREATE POLICY "school members read cas" ON cas_entries FOR SELECT USING (
  school_id = get_my_school_id()
);

-- ────────────────────────────────────────────────────────────
-- 16. ADMISSIONS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admissions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id    uuid REFERENCES schools ON DELETE CASCADE NOT NULL,
  full_name    text NOT NULL,
  birth_date   date,
  parent_name  text,
  parent_phone text,
  parent_email text,
  grade_level  text,
  status       text DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','waitlist')),
  notes        text,
  applied_at   timestamptz DEFAULT now(),
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE admissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin manages admissions" ON admissions;
CREATE POLICY "admin manages admissions" ON admissions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = admissions.school_id)
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = admissions.school_id)
);

-- ────────────────────────────────────────────────────────────
-- 17. COLLEGE APPLICATIONS  (admin college counseling)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS college_applications (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id    uuid REFERENCES schools  ON DELETE CASCADE NOT NULL,
  student_id   uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  college_name text NOT NULL,
  program      text,
  deadline     date,
  status       text DEFAULT 'planning' CHECK (status IN ('planning','applied','accepted','rejected','waitlist','enrolled')),
  notes        text,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE college_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "school members manage college apps" ON college_applications;
CREATE POLICY "school members manage college apps" ON college_applications FOR ALL USING (
  school_id = get_my_school_id()
) WITH CHECK (school_id = get_my_school_id());

-- ────────────────────────────────────────────────────────────
-- 18. SUBSTITUTIONS  (teacher absence cover)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS substitutions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id       uuid REFERENCES schools  ON DELETE CASCADE NOT NULL,
  absent_teacher  uuid REFERENCES profiles ON DELETE CASCADE,
  cover_teacher   uuid REFERENCES profiles ON DELETE SET NULL,
  class_id        uuid REFERENCES classes  ON DELETE CASCADE,
  date            date NOT NULL,
  period          int,
  reason          text,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE substitutions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "school members read substitutions" ON substitutions;
CREATE POLICY "school members read substitutions" ON substitutions FOR SELECT USING (
  school_id = get_my_school_id()
);

DROP POLICY IF EXISTS "admin manages substitutions" ON substitutions;
CREATE POLICY "admin manages substitutions" ON substitutions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = substitutions.school_id)
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.school_id = substitutions.school_id)
);

-- ════════════════════════════════════════════════════════════
-- DONE — all missing tables created
-- ════════════════════════════════════════════════════════════
