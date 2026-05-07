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
  admin_email      text := 'kaan.guluzada@gmail.com';
  admin_full_name  text := 'Kaan Guluzada';
  admin_role       text := 'super_admin';            -- 'super_admin' (Zirva platform owner) | 'admin' (school admin)
  admin_language   text := 'az';                     -- az / en / tr / ru
  -- ▲ EDIT THESE ▲ ─────────────────────────────────────────

  v_user_id  uuid;
BEGIN
  -- Find the auth user you just created in step 1
  SELECT id INTO v_user_id
  FROM   auth.users
  WHERE  email = admin_email;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No auth user with email %.  Create them in Supabase → Authentication → Users first, then re-run this script.', admin_email;
  END IF;

  -- Create or upgrade the profile to admin
  -- super_admin doesn't need school_id (manages all schools).
  INSERT INTO public.profiles (id, email, full_name, role, school_id, language, avatar_color)
  VALUES (
    v_user_id,
    admin_email,
    admin_full_name,
    admin_role,
    NULL,
    admin_language,
    '#7c6ee0'
  )
  ON CONFLICT (id) DO UPDATE
    SET role         = admin_role,
        school_id    = CASE WHEN admin_role = 'super_admin' THEN NULL ELSE EXCLUDED.school_id END,
        full_name    = admin_full_name,
        email        = admin_email,
        language     = admin_language;

  RAISE NOTICE '✅ Account ready: % (role=%)', admin_email, admin_role;
  IF admin_role = 'super_admin' THEN
    RAISE NOTICE '   Log in at /daxil-ol — you will land at /superadmin/dashboard';
    RAISE NOTICE '   From there you can create schools and assign school admins.';
  ELSE
    RAISE NOTICE '   Log in at /daxil-ol — you will land at /admin/dashboard';
  END IF;
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
WHERE   p.role IN ('admin', 'super_admin')
ORDER BY p.role, p.email;
