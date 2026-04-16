-- ============================================================
-- SETUP FILE 2 OF 2 — FUNCTIONS & TRIGGERS
-- Fully idempotent — safe to re-run on any existing database.
-- Run AFTER SETUP_1_TABLES.sql
-- ============================================================

-- ─── Helper: get current user's school_id ────────────────────
-- SECURITY DEFINER avoids RLS recursion when policies call this.
create or replace function get_my_school_id()
returns uuid as $$
  select school_id from profiles where id = auth.uid();
$$ language sql security definer stable;

-- ─── Auto-update updated_at ───────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at    on profiles;
drop trigger if exists grades_updated_at      on grades;
drop trigger if exists assignments_updated_at on assignments;
drop trigger if exists zeka_updated_at        on zeka_conversations;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

create trigger grades_updated_at
  before update on grades
  for each row execute function update_updated_at();

create trigger assignments_updated_at
  before update on assignments
  for each row execute function update_updated_at();

create trigger zeka_updated_at
  before update on zeka_conversations
  for each row execute function update_updated_at();

-- ─── Notification on new grade ───────────────────────────────
create or replace function notify_on_grade()
returns trigger as $$
declare
  student_name text;
  subject_name text;
  parent_id    uuid;
begin
  select full_name into student_name from profiles where id = new.student_id;
  select name      into subject_name from subjects where id = new.subject_id;

  -- Notify the student
  insert into notifications (user_id, type, title, body, data)
  values (
    new.student_id,
    'new_grade',
    'Yeni qiymət',
    subject_name || ': ' || coalesce(new.score::text, 'qiymətləndirildi'),
    jsonb_build_object('grade_id', new.id, 'subject', subject_name)
  );

  -- Notify every linked parent
  for parent_id in
    select pc.parent_id from parent_children pc where pc.child_id = new.student_id
  loop
    insert into notifications (user_id, type, title, body, data)
    values (
      parent_id,
      'new_grade',
      student_name || ' — Yeni qiymət',
      subject_name || ': ' || coalesce(new.score::text, 'qiymətləndirildi'),
      jsonb_build_object('grade_id', new.id, 'student_id', new.student_id)
    );
  end loop;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists grade_notification on grades;
create trigger grade_notification
  after insert on grades
  for each row execute function notify_on_grade();

-- ─── Notification on absence ─────────────────────────────────
create or replace function notify_on_absence()
returns trigger as $$
declare
  student_name text;
  parent_id    uuid;
begin
  if new.status in ('absent', 'late') then
    select full_name into student_name from profiles where id = new.student_id;

    -- Notify every linked parent
    for parent_id in
      select pc.parent_id from parent_children pc where pc.child_id = new.student_id
    loop
      insert into notifications (user_id, type, title, body, data)
      values (
        parent_id,
        'absence',
        student_name || ' — ' ||
          case when new.status = 'absent' then 'Dərsi buraxdı'
               else 'Dərsə gecikmə ilə iştirak etdi' end,
        to_char(new.date, 'DD.MM.YYYY'),
        jsonb_build_object('attendance_id', new.id, 'student_id', new.student_id, 'status', new.status)
      );
    end loop;

    -- Notify the student
    insert into notifications (user_id, type, title, body, data)
    values (
      new.student_id,
      'absence',
      case when new.status = 'absent' then 'Dərsinizə iştirak etmədiniz'
           else 'Dərsə gecikdiniz' end,
      to_char(new.date, 'DD.MM.YYYY'),
      jsonb_build_object('attendance_id', new.id)
    );
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists absence_notification on attendance;
create trigger absence_notification
  after insert on attendance
  for each row execute function notify_on_absence();

-- ─── Notification on new message ─────────────────────────────
create or replace function notify_on_message()
returns trigger as $$
declare
  sender_name text;
begin
  select full_name into sender_name from profiles where id = new.sender_id;

  insert into notifications (user_id, type, title, body, data)
  values (
    new.recipient_id,
    'new_message',
    'Yeni mesaj — ' || sender_name,
    left(new.content, 80),
    jsonb_build_object('thread_id', new.thread_id, 'sender_id', new.sender_id)
  );

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists message_notification on messages;
create trigger message_notification
  after insert on messages
  for each row execute function notify_on_message();

-- ─── Streak update on Zeka conversation ──────────────────────
create or replace function update_streak()
returns trigger as $$
declare
  last_date      date;
  current_streak int;
  longest_streak int;
begin
  select streak_last_date, streak_count, streak_longest
  into   last_date, current_streak, longest_streak
  from   profiles where id = new.user_id;

  if last_date = current_date then
    -- Already updated today, do nothing
    return new;
  elsif last_date = current_date - 1 then
    current_streak := current_streak + 1;
  else
    current_streak := 1;
  end if;

  if current_streak > longest_streak then
    longest_streak := current_streak;
  end if;

  update profiles set
    streak_count    = current_streak,
    streak_longest  = longest_streak,
    streak_last_date = current_date
  where id = new.user_id;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists zeka_streak on zeka_conversations;
create trigger zeka_streak
  after insert on zeka_conversations
  for each row execute function update_streak();

-- ─── Analytics helpers ────────────────────────────────────────

-- Weighted average score for a student (optionally per subject)
create or replace function get_student_average(
  p_student_id uuid,
  p_subject_id uuid default null
)
returns numeric as $$
  select round(avg(
    case
      when max_score > 0 then (score / max_score) * 10
      else score
    end
  ), 1)
  from grades
  where student_id = p_student_id
    and (p_subject_id is null or subject_id = p_subject_id)
    and score is not null;
$$ language sql security definer;

-- Attendance percentage for a student (optionally per class)
create or replace function get_attendance_percentage(
  p_student_id uuid,
  p_class_id   uuid default null
)
returns numeric as $$
  select round(
    count(*) filter (where status = 'present')::numeric /
    nullif(count(*), 0) * 100,
    1
  )
  from attendance
  where student_id = p_student_id
    and (p_class_id is null or class_id = p_class_id);
$$ language sql security definer;

-- Returns students below grade threshold (<5) or attendance threshold (<80%)
create or replace function get_at_risk_students(p_school_id uuid)
returns table (
  student_id     uuid,
  full_name      text,
  class_name     text,
  avg_grade      numeric,
  attendance_pct numeric
) as $$
  select
    p.id,
    p.full_name,
    c.name,
    get_student_average(p.id),
    get_attendance_percentage(p.id)
  from profiles p
  join class_members cm on cm.student_id = p.id
  join classes c on c.id = cm.class_id
  where p.school_id = p_school_id
    and p.role = 'student'
    and (
      get_student_average(p.id) < 5
      or get_attendance_percentage(p.id) < 80
    );
$$ language sql security definer;
