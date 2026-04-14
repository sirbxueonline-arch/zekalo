create extension if not exists "uuid-ossp";

create table schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  district text,
  edition text not null check (edition in ('ib', 'government')),
  ib_programmes text[],
  logo_url text,
  asan_api_key text,
  egov_api_key text,
  egov_api_endpoint text,
  default_language text default 'az',
  created_at timestamptz default now()
);

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text not null,
  email text not null,
  role text not null check (role in ('student', 'teacher', 'parent', 'admin')),
  school_id uuid references schools on delete set null,
  edition text check (edition in ('ib', 'government')),
  language text default 'az' check (language in ('az', 'en', 'ru')),
  ib_programme text check (ib_programme in ('myp', 'dp')),
  avatar_color text default '#534AB7',
  apns_token text,
  notify_new_grade boolean default true,
  notify_absence boolean default true,
  notify_message boolean default true,
  notify_assignment boolean default true,
  streak_count int default 0,
  streak_longest int default 0,
  streak_last_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table subjects (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools on delete cascade not null,
  name text not null,
  name_az text,
  ib_criterion_group text,
  created_at timestamptz default now()
);

create table classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools on delete cascade not null,
  name text not null,
  grade_level text,
  academic_year text,
  created_at timestamptz default now()
);

create table class_members (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references classes on delete cascade not null,
  student_id uuid references profiles on delete cascade not null,
  enrolled_at timestamptz default now(),
  unique(class_id, student_id)
);

create table teacher_classes (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references classes on delete cascade not null,
  teacher_id uuid references profiles on delete cascade not null,
  subject_id uuid references subjects on delete cascade not null,
  unique(class_id, teacher_id, subject_id)
);

create table parent_children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references profiles on delete cascade not null,
  child_id uuid references profiles on delete cascade not null,
  created_at timestamptz default now(),
  unique(parent_id, child_id)
);

create table timetable_slots (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools on delete cascade not null,
  class_id uuid references classes on delete cascade not null,
  teacher_id uuid references profiles on delete cascade not null,
  subject_id uuid references subjects on delete cascade not null,
  day_of_week int not null check (day_of_week between 1 and 6),
  period int not null check (period between 1 and 8),
  start_time time,
  end_time time,
  room text,
  published boolean default false,
  created_at timestamptz default now(),
  unique(class_id, day_of_week, period),
  unique(teacher_id, day_of_week, period)
);

create table grades (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles on delete cascade not null,
  teacher_id uuid references profiles on delete cascade not null,
  subject_id uuid references subjects on delete cascade not null,
  class_id uuid references classes on delete cascade not null,
  assessment_title text not null,
  grade_type text check (grade_type in ('test', 'homework', 'project', 'exam', 'classwork', 'other')),
  score numeric check (score >= 0),
  max_score numeric check (max_score > 0),
  criterion_a numeric check (criterion_a between 0 and 8),
  criterion_b numeric check (criterion_b between 0 and 8),
  criterion_c numeric check (criterion_c between 0 and 8),
  criterion_d numeric check (criterion_d between 0 and 8),
  notes text,
  date date default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles on delete cascade not null,
  class_id uuid references classes on delete cascade not null,
  teacher_id uuid references profiles on delete cascade not null,
  date date not null default current_date,
  status text not null check (status in ('present', 'absent', 'late')),
  note text,
  created_at timestamptz default now(),
  unique(student_id, class_id, date)
);

create table assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references classes on delete cascade not null,
  teacher_id uuid references profiles on delete cascade not null,
  subject_id uuid references subjects on delete cascade not null,
  title text not null,
  description text,
  due_date timestamptz,
  max_score numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid references assignments on delete cascade not null,
  student_id uuid references profiles on delete cascade not null,
  content text,
  submitted_at timestamptz default now(),
  score numeric,
  feedback text,
  status text default 'submitted' check (status in ('submitted', 'graded', 'late')),
  graded_at timestamptz,
  unique(assignment_id, student_id)
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null,
  sender_id uuid references profiles on delete cascade not null,
  recipient_id uuid references profiles on delete cascade not null,
  content text not null,
  read boolean default false,
  read_at timestamptz,
  created_at timestamptz default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles on delete cascade not null,
  type text not null check (type in ('new_grade', 'absence', 'new_message', 'assignment_due', 'report_submitted', 'announcement')),
  title text not null,
  body text,
  data jsonb,
  read boolean default false,
  created_at timestamptz default now()
);

create table ministry_reports (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools on delete cascade not null,
  class_id uuid references classes on delete cascade,
  generated_by uuid references profiles on delete cascade not null,
  report_type text check (report_type in ('class', 'student', 'attendance', 'ministry')),
  status text default 'draft' check (status in ('draft', 'submitted', 'accepted', 'rejected')),
  submitted_at timestamptz,
  egov_reference text,
  error_log text,
  created_at timestamptz default now()
);

create table zeka_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles on delete cascade not null,
  subject text,
  language text default 'az' check (language in ('az', 'en', 'ru')),
  messages jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table ib_extended_essays (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles on delete cascade not null,
  school_id uuid references schools on delete cascade not null,
  supervisor_id uuid references profiles on delete cascade,
  topic text,
  subject text,
  status text default 'not_started' check (status in ('not_started', 'in_progress', 'submitted', 'graded')),
  submitted_at timestamptz,
  final_grade text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table announcements (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools on delete cascade not null,
  sender_id uuid references profiles on delete cascade not null,
  title text not null,
  body text not null,
  audience text not null check (audience in ('all_parents', 'all_teachers', 'all_students', 'class')),
  class_id uuid references classes on delete cascade,
  created_at timestamptz default now()
);
