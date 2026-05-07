-- ============================================================
--  Z I R V A   —   C R E A T E   A D M I N   A C C O U N T
-- ============================================================
--  Bootstraps the very first admin user. Use this only when
--  you don't have any admin yet. After that, admins create new
--  users through the in-app admin dashboard.
--
--  Workflow:
--    1.  Supabase → Authentication → Users → "Add user"
--          email:    you@example.com
--          password: pick a strong one
--          ✓  Auto-confirm user
--        Click "Create user".
--
--    2.  Edit the variables below (admin_email, school_name,
--        school_district, school_edition).
--
--    3.  Run this script in SQL Editor.
--
--  After running you can log in at /daxil-ol with that email
--  and the password you set, and you'll land in /admin/dashboard.
-- ============================================================

DO $$
DECLARE
  -- ▼ EDIT THESE ▼ ─────────────────────────────────────────
  admin_email      text := 'you@example.com';
  admin_full_name  text := 'Admin User';
  admin_language   text := 'az';                     -- az / en / tr / ru
  school_name      text := 'My School';
  school_district  text := 'Bakı';
  school_edition   text := 'national';               -- national / ib / hybrid
  school_language  text := 'az';
  -- ▲ EDIT THESE ▲ ─────────────────────────────────────────

  v_user_id  uuid;
  v_school_id uuid;
BEGIN
  -- Find the auth user you just created in step 1
  SELECT id INTO v_user_id
  FROM   auth.users
  WHERE  email = admin_email;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No auth user with email %.  Create them in Supabase → Authentication → Users first, then re-run this script.', admin_email;
  END IF;

  -- Create the school (or reuse if it already exists)
  SELECT id INTO v_school_id
  FROM   public.schools
  WHERE  name = school_name
  LIMIT 1;

  IF v_school_id IS NULL THEN
    INSERT INTO public.schools (name, district, edition, default_language, blocked)
    VALUES (school_name, school_district, school_edition, school_language, false)
    RETURNING id INTO v_school_id;
    RAISE NOTICE 'Created school: % (id=%)', school_name, v_school_id;
  ELSE
    RAISE NOTICE 'Using existing school: % (id=%)', school_name, v_school_id;
  END IF;

  -- Create or upgrade the profile to admin
  INSERT INTO public.profiles (id, email, full_name, role, school_id, language, avatar_color)
  VALUES (
    v_user_id,
    admin_email,
    admin_full_name,
    'admin',
    v_school_id,
    admin_language,
    '#7c6ee0'
  )
  ON CONFLICT (id) DO UPDATE
    SET role         = 'admin',
        school_id    = v_school_id,
        full_name    = admin_full_name,
        email        = admin_email,
        language     = admin_language;

  RAISE NOTICE '✅ Admin ready: % (role=admin, school=%)', admin_email, school_name;
  RAISE NOTICE '   Log in at /daxil-ol — you will be sent to /admin/dashboard';
END $$;

-- ============================================================
--  Verify
-- ============================================================
SELECT  p.id,
        p.email,
        p.full_name,
        p.role,
        s.name AS school_name,
        s.district,
        s.edition
FROM    public.profiles p
LEFT JOIN public.schools s ON s.id = p.school_id
WHERE   p.role = 'admin';
