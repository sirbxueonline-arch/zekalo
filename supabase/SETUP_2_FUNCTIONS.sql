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

-- ─── Notification on new assignment ──────────────────────────
-- Notifies every student in the class + their parents when a teacher
-- creates an assignment.
create or replace function notify_on_assignment()
returns trigger as $$
declare
  v_school_id uuid;
  v_title     text;
  v_student   record;
  parent_id   uuid;
begin
  select c.school_id into v_school_id
  from classes c where c.id = new.class_id;

  v_title := 'Yeni tapşırıq: ' || new.title;

  -- Notify each student enrolled in the class
  for v_student in
    select cm.student_id from class_members cm where cm.class_id = new.class_id
  loop
    insert into notifications (user_id, profile_id, school_id, type, title, body, data)
    values (
      v_student.student_id,
      v_student.student_id,
      v_school_id,
      'assignment',
      v_title,
      coalesce(new.description, ''),
      jsonb_build_object('assignment_id', new.id, 'class_id', new.class_id)
    );

    -- Also notify that student's parents
    for parent_id in
      select pc.parent_id from parent_children pc where pc.child_id = v_student.student_id
    loop
      insert into notifications (user_id, profile_id, school_id, type, title, body, data)
      values (
        parent_id,
        parent_id,
        v_school_id,
        'assignment',
        v_title,
        coalesce(new.description, ''),
        jsonb_build_object('assignment_id', new.id, 'student_id', v_student.student_id)
      );
    end loop;
  end loop;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists assignment_notification on assignments;
create trigger assignment_notification
  after insert on assignments
  for each row execute function notify_on_assignment();

-- ─── Notification on submission ───────────────────────────────
-- Notifies the teacher when a student submits an assignment.
create or replace function notify_on_submission()
returns trigger as $$
declare
  v_assignment assignments%rowtype;
  v_school_id  uuid;
  v_student_name text;
begin
  select * into v_assignment from assignments where id = new.assignment_id;
  select c.school_id into v_school_id from classes c where c.id = v_assignment.class_id;
  select full_name into v_student_name from profiles where id = new.student_id;

  insert into notifications (user_id, profile_id, school_id, type, title, body, data)
  values (
    v_assignment.teacher_id,
    v_assignment.teacher_id,
    v_school_id,
    'submission',
    v_student_name || ' tapşırığı təhvil verdi',
    v_assignment.title,
    jsonb_build_object('assignment_id', new.assignment_id, 'submission_id', new.id, 'student_id', new.student_id)
  );

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists submission_notification on submissions;
create trigger submission_notification
  after insert on submissions
  for each row execute function notify_on_submission();

-- ─── Notification when submission is graded ───────────────────
-- Notifies the student (and their parents) when a teacher grades a submission.
create or replace function notify_on_submission_graded()
returns trigger as $$
declare
  v_assignment assignments%rowtype;
  v_school_id  uuid;
  parent_id    uuid;
begin
  -- Only fire when status changes to 'graded'
  if old.status = 'graded' or new.status <> 'graded' then
    return new;
  end if;

  select * into v_assignment from assignments where id = new.assignment_id;
  select c.school_id into v_school_id from classes c where c.id = v_assignment.class_id;

  -- Notify the student
  insert into notifications (user_id, profile_id, school_id, type, title, body, data)
  values (
    new.student_id,
    new.student_id,
    v_school_id,
    'submission_graded',
    'Tapşırıq qiymətləndirildi',
    v_assignment.title || ': ' || coalesce(new.score::text, '') ||
      case when v_assignment.max_score is not null then ' / ' || v_assignment.max_score::text else '' end,
    jsonb_build_object('assignment_id', new.assignment_id, 'submission_id', new.id)
  );

  -- Notify parents
  for parent_id in
    select pc.parent_id from parent_children pc where pc.child_id = new.student_id
  loop
    insert into notifications (user_id, profile_id, school_id, type, title, body, data)
    values (
      parent_id,
      parent_id,
      v_school_id,
      'submission_graded',
      'Tapşırıq qiymətləndirildi',
      v_assignment.title || ': ' || coalesce(new.score::text, ''),
      jsonb_build_object('assignment_id', new.assignment_id, 'student_id', new.student_id)
    );
  end loop;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists submission_graded_notification on submissions;
create trigger submission_graded_notification
  after update on submissions
  for each row execute function notify_on_submission_graded();

-- ─── Notification on discipline record ────────────────────────
-- Notifies the student and their parents when a discipline record is created.
create or replace function notify_on_discipline()
returns trigger as $$
declare
  parent_id uuid;
  v_type_label text;
begin
  v_type_label := case new.type
    when 'warning'      then 'Xəbərdarlıq'
    when 'detention'    then 'Cəza'
    when 'suspension'   then 'Kənarlaşdırma'
    when 'commendation' then 'Təşəkkür'
    else 'Qeyd'
  end;

  -- Notify the student
  insert into notifications (user_id, profile_id, school_id, type, title, body, data)
  values (
    new.student_id,
    new.student_id,
    new.school_id,
    'discipline',
    'İntizam qeydi: ' || v_type_label,
    new.description,
    jsonb_build_object('discipline_id', new.id, 'type', new.type)
  );

  -- Notify parents
  for parent_id in
    select pc.parent_id from parent_children pc where pc.child_id = new.student_id
  loop
    insert into notifications (user_id, profile_id, school_id, type, title, body, data)
    values (
      parent_id,
      parent_id,
      new.school_id,
      'discipline',
      'İntizam qeydi: ' || v_type_label,
      new.description,
      jsonb_build_object('discipline_id', new.id, 'student_id', new.student_id)
    );
  end loop;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists discipline_notification on discipline_records;
create trigger discipline_notification
  after insert on discipline_records
  for each row execute function notify_on_discipline();

-- ─── Notification on new event ────────────────────────────────
-- Notifies relevant school members when a new event is published.
create or replace function notify_on_event()
returns trigger as $$
begin
  insert into notifications (user_id, profile_id, school_id, type, title, body, data)
  select
    p.id,
    p.id,
    new.school_id,
    'event',
    'Yeni tədbir: ' || new.title,
    to_char(new.start_date, 'DD.MM.YYYY'),
    jsonb_build_object('event_id', new.id, 'start_date', new.start_date)
  from profiles p
  where p.school_id = new.school_id
    and (
      new.visible_to = 'all'
      or (new.visible_to = 'teachers' and p.role = 'teacher')
      or (new.visible_to = 'students' and p.role = 'student')
      or (new.visible_to = 'parents'  and p.role = 'parent')
      or (new.visible_to = 'admin'    and p.role in ('admin', 'super_admin'))
    );

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists event_notification on events;
create trigger event_notification
  after insert on events
  for each row execute function notify_on_event();

-- ─── Notification on conversation message ─────────────────────
-- Notifies the other participant when a new message arrives in a conversation.
create or replace function notify_on_conversation_message()
returns trigger as $$
declare
  v_conv    conversations%rowtype;
  v_other   uuid;
  v_sender_name text;
begin
  select * into v_conv from conversations where id = new.conversation_id;
  select full_name into v_sender_name from profiles where id = new.sender_id;

  -- The recipient is whoever did NOT send the message
  v_other := case
    when new.sender_id = v_conv.teacher_id then v_conv.parent_id
    else v_conv.teacher_id
  end;

  insert into notifications (user_id, profile_id, school_id, type, title, body, data)
  values (
    v_other,
    v_other,
    v_conv.school_id,
    'new_message',
    'Yeni mesaj — ' || v_sender_name,
    left(new.content, 80),
    jsonb_build_object('conversation_id', new.conversation_id, 'sender_id', new.sender_id)
  );

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists conversation_message_notification on conversation_messages;
create trigger conversation_message_notification
  after insert on conversation_messages
  for each row execute function notify_on_conversation_message();
