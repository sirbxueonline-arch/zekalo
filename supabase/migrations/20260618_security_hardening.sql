-- Run STEP 0 verification queries first (see .claude/SECURITY_REMEDIATION.md); adjust drift-prone column names (egov_endpoint, submitted_by, recorded_by) to the LIVE names before applying. Idempotent. Test on a Supabase branch first.

-- ============================================================================
-- P0 — CRITICAL (anonymously exploitable)
-- ============================================================================

-- P0-1 — Harden handle_new_user trigger (role hardcoded 'student')
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, language, created_at)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
    'student',                                  -- HARDCODED. role is set only by the create-user edge fn.
    COALESCE(NEW.raw_user_meta_data->>'language','az'),
    now()
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

-- P0-2 — Restrict profiles INSERT RLS so role can't be self-set
DROP POLICY IF EXISTS "insert own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert_self_student" ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id AND role IN ('student','parent'));

-- P0-6 — notifications open INSERT (phishing vector)
DROP POLICY IF EXISTS "notifications_insert" ON notifications;
DROP POLICY IF EXISTS "anyone insert notifications" ON notifications;
CREATE POLICY "notifications_insert" ON notifications FOR INSERT
  WITH CHECK (user_id = auth.uid() OR profile_id = auth.uid());

-- P0-7 — Cross-tenant RLS: class_members, teacher_classes, parent_children
DROP POLICY IF EXISTS "admin manages class_members" ON class_members;
CREATE POLICY "admin manages class_members" ON class_members FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p JOIN classes c ON c.id=class_members.class_id
                 WHERE p.id=(SELECT auth.uid()) AND p.role='admin' AND p.school_id=c.school_id))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p JOIN classes c ON c.id=class_members.class_id
                 WHERE p.id=(SELECT auth.uid()) AND p.role='admin' AND p.school_id=c.school_id));

DROP POLICY IF EXISTS "admin manages teacher_classes" ON teacher_classes;
CREATE POLICY "admin manages teacher_classes" ON teacher_classes FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p JOIN classes c ON c.id=teacher_classes.class_id
                 WHERE p.id=(SELECT auth.uid()) AND p.role='admin' AND p.school_id=c.school_id))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p JOIN classes c ON c.id=teacher_classes.class_id
                 WHERE p.id=(SELECT auth.uid()) AND p.role='admin' AND p.school_id=c.school_id));

DROP POLICY IF EXISTS "admin manages parent_children" ON parent_children;
CREATE POLICY "admin manages parent_children" ON parent_children FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles p JOIN profiles child ON child.id=parent_children.child_id
                 WHERE p.id=(SELECT auth.uid()) AND p.role='admin' AND p.school_id=child.school_id))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p JOIN profiles child ON child.id=parent_children.child_id
                 WHERE p.id=(SELECT auth.uid()) AND p.role='admin' AND p.school_id=child.school_id));

-- P0-8 — schools world-readable, exposes asan_api_key / egov_api_key
DROP POLICY IF EXISTS "schools_read" ON schools;
DROP POLICY IF EXISTS "anyone can read schools" ON schools;
CREATE POLICY "schools_own_school_select" ON schools FOR SELECT
  USING (id=(SELECT school_id FROM profiles WHERE id=(SELECT auth.uid()))
     OR EXISTS (SELECT 1 FROM profiles WHERE id=(SELECT auth.uid()) AND role='super_admin'));
CREATE OR REPLACE VIEW public.schools_public AS SELECT id, name, district, edition FROM public.schools;
GRANT SELECT ON public.schools_public TO anon, authenticated;

-- ============================================================================
-- P1 — HIGH
-- ============================================================================

-- P1-1 — subjects / classes / teacher_classes USING (true) SELECT (cross-tenant reads)
DROP POLICY IF EXISTS "anyone reads subjects" ON subjects;
DROP POLICY IF EXISTS "subjects_select" ON subjects;
CREATE POLICY "subjects_select" ON subjects FOR SELECT
  USING (school_id=(SELECT school_id FROM profiles WHERE id=(SELECT auth.uid())));

DROP POLICY IF EXISTS "anyone reads classes" ON classes;
DROP POLICY IF EXISTS "classes_select" ON classes;
CREATE POLICY "classes_select" ON classes FOR SELECT
  USING (school_id=(SELECT school_id FROM profiles WHERE id=(SELECT auth.uid())));

DROP POLICY IF EXISTS "school members read teacher_classes" ON teacher_classes;
DROP POLICY IF EXISTS "teacher_classes_select" ON teacher_classes;
CREATE POLICY "teacher_classes_select" ON teacher_classes FOR SELECT
  USING (EXISTS (SELECT 1 FROM classes c WHERE c.id=teacher_classes.class_id
                 AND c.school_id=(SELECT school_id FROM profiles WHERE id=(SELECT auth.uid()))));

-- P1-2 — schools INSERT open to any authenticated user → super_admin only
DROP POLICY IF EXISTS "schools_insert" ON schools;
CREATE POLICY "schools_insert" ON schools FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id=(SELECT auth.uid()) AND role='super_admin'));

-- P1-3 — Add indexes (zero exist on FKs + hot columns)
CREATE INDEX IF NOT EXISTS idx_class_members_student ON class_members(student_id);
CREATE INDEX IF NOT EXISTS idx_class_members_class   ON class_members(class_id);
CREATE INDEX IF NOT EXISTS idx_teacher_classes_teacher ON teacher_classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_classes_class   ON teacher_classes(class_id);
CREATE INDEX IF NOT EXISTS idx_parent_children_parent  ON parent_children(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_children_child   ON parent_children(child_id);
CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_class   ON grades(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_class_date   ON attendance(class_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_school_role    ON profiles(school_id, role);
CREATE INDEX IF NOT EXISTS idx_notifications_user      ON notifications(user_id, created_at DESC) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_messages_recipient      ON messages(recipient_id, created_at DESC) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_assignments_class       ON assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment  ON submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_subjects_school         ON subjects(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_school          ON classes(school_id);

-- P1-5 — pt_slots booking has no owner check (anyone can steal/cancel a booking)
DROP POLICY IF EXISTS "parent_book_pt_slots" ON pt_slots;
CREATE POLICY "parent_book_pt_slots" ON pt_slots FOR UPDATE
  USING (school_id=(SELECT school_id FROM profiles WHERE id=(SELECT auth.uid())) AND status='open'
         AND EXISTS (SELECT 1 FROM profiles WHERE id=(SELECT auth.uid()) AND role='parent'))
  WITH CHECK (parent_id = (SELECT auth.uid()));
