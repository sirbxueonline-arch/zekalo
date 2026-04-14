-- =============================================
-- ZEKALO PROTOTYPE DATA
-- Run AFTER schema, seed, rls, and functions
-- This creates test subjects, classes, and
-- assignments/grades/attendance for YOUR account.
-- =============================================

-- First, get a school ID to use (TISA)
-- We'll reference it below

-- =============================================
-- STEP 1: Create subjects for TISA (IB school)
-- =============================================
INSERT INTO subjects (school_id, name, name_az, ib_criterion_group)
SELECT s.id, sub.name, sub.name_az, sub.criterion
FROM schools s
CROSS JOIN (VALUES
  ('Mathematics', 'Riyaziyyat', 'Sciences'),
  ('Physics', 'Fizika', 'Sciences'),
  ('Chemistry', 'Kimya', 'Sciences'),
  ('Biology', 'Biologiya', 'Sciences'),
  ('English Language & Literature', 'İngilis dili və Ədəbiyyat', 'Language & Literature'),
  ('Azerbaijani Language', 'Azərbaycan dili', 'Language Acquisition'),
  ('History', 'Tarix', 'Individuals & Societies'),
  ('Geography', 'Coğrafiya', 'Individuals & Societies'),
  ('Visual Arts', 'Təsviri İncəsənət', 'Arts'),
  ('Physical Education', 'Bədən Tərbiyəsi', 'PHE'),
  ('Computer Science', 'İnformatika', 'Design')
) AS sub(name, name_az, criterion)
WHERE s.name = 'TISA — The International School of Azerbaijan';

-- Create subjects for Məktəb №6 (government school)
INSERT INTO subjects (school_id, name, name_az)
SELECT s.id, sub.name, sub.name_az
FROM schools s
CROSS JOIN (VALUES
  ('Riyaziyyat', 'Riyaziyyat'),
  ('Fizika', 'Fizika'),
  ('Kimya', 'Kimya'),
  ('Biologiya', 'Biologiya'),
  ('Azərbaycan dili', 'Azərbaycan dili'),
  ('Ədəbiyyat', 'Ədəbiyyat'),
  ('Tarix', 'Tarix'),
  ('Coğrafiya', 'Coğrafiya'),
  ('İngilis dili', 'İngilis dili'),
  ('İnformatika', 'İnformatika'),
  ('Bədən Tərbiyəsi', 'Bədən Tərbiyəsi')
) AS sub(name, name_az)
WHERE s.name = 'Məktəb №6';

-- =============================================
-- STEP 2: Create classes
-- =============================================
INSERT INTO classes (school_id, name, grade_level, academic_year)
SELECT s.id, cls.name, cls.grade, '2025-2026'
FROM schools s
CROSS JOIN (VALUES
  ('MYP 1A', '6'),
  ('MYP 1B', '6'),
  ('MYP 2A', '7'),
  ('MYP 3A', '8'),
  ('MYP 4A', '9'),
  ('MYP 5A', '10'),
  ('DP 1A', '11'),
  ('DP 2A', '12')
) AS cls(name, grade)
WHERE s.name = 'TISA — The International School of Azerbaijan';

INSERT INTO classes (school_id, name, grade_level, academic_year)
SELECT s.id, cls.name, cls.grade, '2025-2026'
FROM schools s
CROSS JOIN (VALUES
  ('6-A', '6'),
  ('6-B', '6'),
  ('7-A', '7'),
  ('8-A', '8'),
  ('9-A', '9'),
  ('10-A', '10'),
  ('11-A', '11')
) AS cls(name, grade)
WHERE s.name = 'Məktəb №6';

-- =============================================
-- STEP 3: Create prototype assignments
-- These will be visible to any student enrolled
-- in the corresponding class
-- =============================================

-- IB School assignments (TISA - MYP 4A class)
INSERT INTO assignments (class_id, teacher_id, subject_id, title, description, due_date, max_score)
SELECT
  c.id,
  (SELECT id FROM profiles WHERE role = 'teacher' AND school_id = c.school_id LIMIT 1),
  sub.id,
  a.title,
  a.description,
  a.due_date::timestamptz,
  a.max_score
FROM classes c
JOIN schools s ON s.id = c.school_id
CROSS JOIN LATERAL (
  SELECT id FROM subjects WHERE school_id = s.id AND name = a.subject_name LIMIT 1
) sub
CROSS JOIN (VALUES
  ('Kvadrat tənliklər — Ev tapşırığı', 'Kvadrat tənliklərin həlli üsullarını öyrənin. Hər üsul üçün 3 nümunə həll edin: faktorizasiya, kvadrat düstur, diskriminant. Cavabları addım-addım yazın.', 'Mathematics', (NOW() + INTERVAL '5 days')::text, 8),
  ('Nyutonun Qanunları — Layihə', 'Nyutonun 3 hərəkət qanununu real həyat nümunələri ilə izah edən poster hazırlayın. Hər qanun üçün minimum 2 nümunə. A3 format.', 'Physics', (NOW() + INTERVAL '10 days')::text, 8),
  ('Dövri Cədvəl Təqdimatı', 'Seçdiyiniz elementin fiziki və kimyəvi xassələrini araşdırın. 10 slaydlıq təqdimat hazırlayın. Mənbələri qeyd edin.', 'Chemistry', (NOW() + INTERVAL '7 days')::text, 8),
  ('Ekosistem Esse', 'Yerli bir ekosistemi seçin və orada baş verən enerji axınını izah edin. Qida zənciri və qida şəbəkəsi sxemlərini daxil edin. 500-800 söz.', 'Biology', (NOW() + INTERVAL '14 days')::text, 8),
  ('Şəxsi Narrativ Esse', 'Həyatınızda mühüm bir anı təsvir edən şəxsi esse yazın. Təsviri dil, dialoq və refleksiya daxil edin. 600-900 söz.', 'English Language & Literature', (NOW() + INTERVAL '8 days')::text, 8),
  ('Azərbaycan Tarixi — Tədqiqat', 'XX əsrdə Azərbaycanın müstəqillik hərəkatını araşdırın. Əsas hadisələri xronoloji sıra ilə təqdim edin. Minimum 3 birinci mənbə istifadə edin.', 'History', (NOW() + INTERVAL '12 days')::text, 8),
  ('Python Proqramlaşdırma', 'Sadə hesab maşını proqramı yazın. Toplama, çıxma, vurma, bölmə əməliyyatlarını dəstəkləsin. İstifadəçi interfeysi olsun. Kodu GitHub-a yükləyin.', 'Computer Science', (NOW() + INTERVAL '6 days')::text, 8),
  ('Xəritə Analizi Tapşırığı', 'Azərbaycanın iqlim xəritəsini analiz edin. Müxtəlif regionların iqlim xüsusiyyətlərini müqayisə edin. Cədvəl və qrafiklər daxil edin.', 'Geography', (NOW() + INTERVAL '9 days')::text, 8)
) AS a(title, description, subject_name, due_date, max_score)
WHERE c.name = 'MYP 4A' AND s.name = 'TISA — The International School of Azerbaijan'
AND EXISTS (SELECT 1 FROM profiles WHERE role = 'teacher' AND school_id = c.school_id)
AND EXISTS (SELECT 1 FROM subjects WHERE school_id = s.id AND name = a.subject_name);

-- Government school assignments (Məktəb №6 - 9-A class)
INSERT INTO assignments (class_id, teacher_id, subject_id, title, description, due_date, max_score)
SELECT
  c.id,
  (SELECT id FROM profiles WHERE role = 'teacher' AND school_id = c.school_id LIMIT 1),
  sub.id,
  a.title,
  a.description,
  a.due_date::timestamptz,
  a.max_score
FROM classes c
JOIN schools s ON s.id = c.school_id
CROSS JOIN LATERAL (
  SELECT id FROM subjects WHERE school_id = s.id AND name = a.subject_name LIMIT 1
) sub
CROSS JOIN (VALUES
  ('Cəbr — Ev tapşırığı №12', 'Dərslikdən səh. 145-148 — nömrə 1-15. Hər misalın həllini dəftərə yazın.', 'Riyaziyyat', (NOW() + INTERVAL '3 days')::text, 10),
  ('Mexanika Test Hazırlığı', 'Mexanika bölməsindən test suallarını həll edin. 30 sual, hər biri 1 bal. Vaxt: 45 dəqiqə.', 'Fizika', (NOW() + INTERVAL '5 days')::text, 10),
  ('İnşa — Vətənim Azərbaycan', 'Azərbaycanın təbiət gözəllikləri haqqında inşa yazın. Minimum 300 söz. Əl yazısı ilə.', 'Azərbaycan dili', (NOW() + INTERVAL '4 days')::text, 10),
  ('Tarix Referatı', 'Azərbaycan Xalq Cümhuriyyəti haqqında referat yazın. 2-3 səhifə. Mənbələri qeyd edin.', 'Tarix', (NOW() + INTERVAL '7 days')::text, 10),
  ('İngilis dili — Grammar Test', 'Present Perfect vs Past Simple mövzusundan test. 25 sual. Dərslikdən Unit 7-8.', 'İngilis dili', (NOW() + INTERVAL '6 days')::text, 10),
  ('Biologiya Laboratoriya', 'Mikroskopla hüceyrə müşahidəsi. Hesabatda: məqsəd, materiallar, müşahidə, nəticə. Şəkillər çəkin.', 'Biologiya', (NOW() + INTERVAL '8 days')::text, 10)
) AS a(title, description, subject_name, due_date, max_score)
WHERE c.name = '9-A' AND s.name = 'Məktəb №6'
AND EXISTS (SELECT 1 FROM profiles WHERE role = 'teacher' AND school_id = c.school_id)
AND EXISTS (SELECT 1 FROM subjects WHERE school_id = s.id AND name = a.subject_name);

-- =============================================
-- STEP 4: Helper function to enroll current user
-- Run this AFTER you sign up with your account
-- Replace 'YOUR_EMAIL' with your actual email
-- =============================================

-- === INSTRUCTIONS ===
-- After signing up, run these queries one by one,
-- replacing the email with YOUR email address:

-- 1. Enroll yourself in a class:
/*
INSERT INTO class_members (class_id, student_id)
SELECT c.id, p.id
FROM profiles p
JOIN schools s ON s.id = p.school_id
JOIN classes c ON c.school_id = s.id AND c.name = 'MYP 4A'  -- or '9-A' for government
WHERE p.email = 'YOUR_EMAIL@example.com'
ON CONFLICT DO NOTHING;
*/

-- 2. Create a demo teacher for your school:
/*
-- First create a teacher auth user via Supabase dashboard,
-- then link them:
INSERT INTO teacher_classes (class_id, teacher_id, subject_id)
SELECT c.id, t.id, sub.id
FROM profiles t
JOIN schools s ON s.id = t.school_id
JOIN classes c ON c.school_id = s.id
JOIN subjects sub ON sub.school_id = s.id
WHERE t.role = 'teacher' AND t.school_id = (
  SELECT school_id FROM profiles WHERE email = 'YOUR_EMAIL@example.com'
)
LIMIT 5;
*/

-- 3. Add sample grades for yourself:
/*
INSERT INTO grades (student_id, teacher_id, subject_id, class_id, assessment_title, grade_type, score, max_score, criterion_a, criterion_b, criterion_c, criterion_d, date)
SELECT
  p.id,
  (SELECT id FROM profiles WHERE role = 'teacher' AND school_id = p.school_id LIMIT 1),
  sub.id,
  cm.class_id,
  g.title,
  g.gtype,
  g.score,
  g.max_score,
  g.ca, g.cb, g.cc, g.cd,
  g.gdate::date
FROM profiles p
JOIN class_members cm ON cm.student_id = p.id
JOIN subjects sub ON sub.school_id = p.school_id AND sub.name = g.subject_name
CROSS JOIN (VALUES
  ('Mathematics', 'Unit Test 1', 'test', 7, 8, 6, 7, 5, 7, (NOW() - INTERVAL '30 days')::text),
  ('Mathematics', 'Homework 3', 'homework', 6, 8, 5, 6, 7, 6, (NOW() - INTERVAL '20 days')::text),
  ('Physics', 'Lab Report', 'project', 8, 8, 7, 8, 6, 7, (NOW() - INTERVAL '25 days')::text),
  ('Physics', 'Quiz 2', 'test', 5, 8, 4, 5, 6, 5, (NOW() - INTERVAL '15 days')::text),
  ('Chemistry', 'Periodic Table Test', 'test', 7, 8, 7, 6, 7, 8, (NOW() - INTERVAL '22 days')::text),
  ('Biology', 'Ecosystem Project', 'project', 8, 8, 8, 7, 7, 8, (NOW() - INTERVAL '18 days')::text),
  ('English Language & Literature', 'Essay 1', 'homework', 6, 8, 5, 7, 6, 6, (NOW() - INTERVAL '12 days')::text),
  ('History', 'Research Paper', 'project', 7, 8, 6, 7, 8, 7, (NOW() - INTERVAL '10 days')::text),
  ('Computer Science', 'Coding Assignment', 'homework', 8, 8, 8, 7, 8, 8, (NOW() - INTERVAL '8 days')::text),
  ('Geography', 'Map Analysis', 'classwork', 6, 8, 5, 6, 7, 6, (NOW() - INTERVAL '5 days')::text)
) AS g(subject_name, title, gtype, score, max_score, ca, cb, cc, cd, gdate)
WHERE p.email = 'YOUR_EMAIL@example.com'
AND EXISTS (SELECT 1 FROM subjects WHERE school_id = p.school_id AND name = g.subject_name);
*/

-- 4. Add sample attendance for yourself:
/*
INSERT INTO attendance (student_id, class_id, teacher_id, date, status, note)
SELECT
  p.id,
  cm.class_id,
  (SELECT id FROM profiles WHERE role = 'teacher' AND school_id = p.school_id LIMIT 1),
  d.dt::date,
  d.st,
  d.nt
FROM profiles p
JOIN class_members cm ON cm.student_id = p.id
CROSS JOIN (VALUES
  ((NOW() - INTERVAL '1 day')::text, 'present', NULL),
  ((NOW() - INTERVAL '2 days')::text, 'present', NULL),
  ((NOW() - INTERVAL '3 days')::text, 'late', 'Avtobusun gecikməsi'),
  ((NOW() - INTERVAL '4 days')::text, 'present', NULL),
  ((NOW() - INTERVAL '5 days')::text, 'absent', 'Xəstə'),
  ((NOW() - INTERVAL '6 days')::text, 'present', NULL),
  ((NOW() - INTERVAL '7 days')::text, 'present', NULL),
  ((NOW() - INTERVAL '8 days')::text, 'present', NULL),
  ((NOW() - INTERVAL '9 days')::text, 'present', NULL),
  ((NOW() - INTERVAL '10 days')::text, 'present', NULL),
  ((NOW() - INTERVAL '11 days')::text, 'late', NULL),
  ((NOW() - INTERVAL '12 days')::text, 'present', NULL),
  ((NOW() - INTERVAL '13 days')::text, 'present', NULL),
  ((NOW() - INTERVAL '14 days')::text, 'absent', 'Ailə səbəbi'),
  ((NOW() - INTERVAL '15 days')::text, 'present', NULL),
  ((NOW() - INTERVAL '16 days')::text, 'present', NULL),
  ((NOW() - INTERVAL '17 days')::text, 'present', NULL),
  ((NOW() - INTERVAL '18 days')::text, 'present', NULL),
  ((NOW() - INTERVAL '19 days')::text, 'present', NULL),
  ((NOW() - INTERVAL '20 days')::text, 'present', NULL)
) AS d(dt, st, nt)
WHERE p.email = 'YOUR_EMAIL@example.com'
ON CONFLICT (student_id, class_id, date) DO NOTHING;
*/

-- =============================================
-- QUICK SETUP — Run this single block after signup
-- Replace YOUR_EMAIL with your email
-- =============================================
/*

DO $$
DECLARE
  v_user_id uuid;
  v_school_id uuid;
  v_class_id uuid;
  v_teacher_id uuid;
BEGIN
  -- Get your user
  SELECT id, school_id INTO v_user_id, v_school_id
  FROM profiles WHERE email = 'YOUR_EMAIL@example.com';

  -- Get a class from your school
  SELECT id INTO v_class_id
  FROM classes WHERE school_id = v_school_id LIMIT 1;

  -- Enroll you
  INSERT INTO class_members (class_id, student_id)
  VALUES (v_class_id, v_user_id)
  ON CONFLICT DO NOTHING;

  -- Check if teacher exists, if not we skip teacher-dependent inserts
  SELECT id INTO v_teacher_id
  FROM profiles WHERE role = 'teacher' AND school_id = v_school_id LIMIT 1;

  IF v_teacher_id IS NOT NULL AND v_class_id IS NOT NULL THEN
    -- Add grades
    INSERT INTO grades (student_id, teacher_id, subject_id, class_id, assessment_title, grade_type, score, max_score, date)
    SELECT v_user_id, v_teacher_id, sub.id, v_class_id, g.title, g.gtype, g.score, g.mscore, g.gdate::date
    FROM subjects sub
    JOIN (VALUES
      (1, 'Unit Test 1', 'test', 8, 10, (NOW() - INTERVAL '30 days')::text),
      (1, 'Ev tapşırığı 3', 'homework', 7, 10, (NOW() - INTERVAL '20 days')::text),
      (2, 'Laboratoriya 1', 'project', 9, 10, (NOW() - INTERVAL '25 days')::text),
      (2, 'Quiz 2', 'test', 6, 10, (NOW() - INTERVAL '15 days')::text),
      (3, 'Test 1', 'test', 8, 10, (NOW() - INTERVAL '22 days')::text),
      (4, 'Layihə', 'project', 9, 10, (NOW() - INTERVAL '18 days')::text),
      (5, 'İnşa 1', 'homework', 7, 10, (NOW() - INTERVAL '12 days')::text),
      (6, 'Referat', 'project', 8, 10, (NOW() - INTERVAL '10 days')::text),
      (7, 'Test', 'test', 9, 10, (NOW() - INTERVAL '8 days')::text),
      (8, 'Ev tapşırığı', 'homework', 7, 10, (NOW() - INTERVAL '5 days')::text)
    ) AS g(sub_idx, title, gtype, score, mscore, gdate) ON TRUE
    WHERE sub.school_id = v_school_id
    AND sub.id = (SELECT id FROM subjects WHERE school_id = v_school_id ORDER BY name OFFSET g.sub_idx - 1 LIMIT 1);

    -- Add attendance
    INSERT INTO attendance (student_id, class_id, teacher_id, date, status)
    SELECT v_user_id, v_class_id, v_teacher_id, d.dt::date, d.st
    FROM (VALUES
      ((NOW() - INTERVAL '1 day')::text, 'present'),
      ((NOW() - INTERVAL '2 days')::text, 'present'),
      ((NOW() - INTERVAL '3 days')::text, 'late'),
      ((NOW() - INTERVAL '4 days')::text, 'present'),
      ((NOW() - INTERVAL '5 days')::text, 'absent'),
      ((NOW() - INTERVAL '6 days')::text, 'present'),
      ((NOW() - INTERVAL '7 days')::text, 'present'),
      ((NOW() - INTERVAL '8 days')::text, 'present'),
      ((NOW() - INTERVAL '9 days')::text, 'present'),
      ((NOW() - INTERVAL '10 days')::text, 'present'),
      ((NOW() - INTERVAL '11 days')::text, 'late'),
      ((NOW() - INTERVAL '12 days')::text, 'present'),
      ((NOW() - INTERVAL '13 days')::text, 'present'),
      ((NOW() - INTERVAL '14 days')::text, 'absent'),
      ((NOW() - INTERVAL '15 days')::text, 'present'),
      ((NOW() - INTERVAL '16 days')::text, 'present'),
      ((NOW() - INTERVAL '17 days')::text, 'present'),
      ((NOW() - INTERVAL '18 days')::text, 'present'),
      ((NOW() - INTERVAL '19 days')::text, 'present'),
      ((NOW() - INTERVAL '20 days')::text, 'present')
    ) AS d(dt, st)
    ON CONFLICT (student_id, class_id, date) DO NOTHING;
  END IF;

  RAISE NOTICE 'Done! User %, School %, Class %', v_user_id, v_school_id, v_class_id;
END $$;

*/
