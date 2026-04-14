-- Schools (public read for signup school picker)
alter table schools enable row level security;

create policy "anyone can read schools"
  on schools for select using (true);

create policy "admin updates own school"
  on schools for update using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
      and p.role = 'admin'
      and p.school_id = schools.id
    )
  );

-- Subjects
alter table subjects enable row level security;

create policy "anyone reads subjects"
  on subjects for select using (true);

create policy "admin manages subjects"
  on subjects for all using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
      and p.role = 'admin'
      and p.school_id = subjects.school_id
    )
  );

-- Classes
alter table classes enable row level security;

create policy "anyone reads classes"
  on classes for select using (true);

create policy "admin manages classes"
  on classes for all using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
      and p.role = 'admin'
      and p.school_id = classes.school_id
    )
  );

-- Teacher classes
alter table teacher_classes enable row level security;

create policy "anyone reads teacher_classes"
  on teacher_classes for select using (true);

create policy "admin manages teacher_classes"
  on teacher_classes for all using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
      and p.role = 'admin'
    )
  );

alter table class_members enable row level security;

create policy "read own membership"
  on class_members for select using (auth.uid() = student_id);

create policy "school members read class members"
  on class_members for select using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
      and p.school_id = (select school_id from classes where id = class_members.class_id)
    )
  );

create policy "admin manages class members"
  on class_members for all using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
      and p.role = 'admin'
    )
  );

alter table profiles enable row level security;
alter table grades enable row level security;
alter table attendance enable row level security;
alter table messages enable row level security;
alter table assignments enable row level security;
alter table submissions enable row level security;
alter table zeka_conversations enable row level security;
alter table notifications enable row level security;
alter table ministry_reports enable row level security;
alter table ib_extended_essays enable row level security;
alter table announcements enable row level security;
alter table timetable_slots enable row level security;
alter table parent_children enable row level security;

-- Profiles (uses get_my_school_id() function to avoid RLS recursion)
create policy "users read own profile"
  on profiles for select using (auth.uid() = id);

create policy "users read same school"
  on profiles for select using (school_id = get_my_school_id());

create policy "users update own profile"
  on profiles for update using (auth.uid() = id);

create policy "users insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- Grades
create policy "student reads own grades"
  on grades for select using (auth.uid() = student_id);

create policy "parent reads child grades"
  on grades for select using (
    exists (
      select 1 from parent_children pc
      where pc.parent_id = auth.uid()
      and pc.child_id = grades.student_id
    )
  );

create policy "teacher manages own grades"
  on grades for all using (auth.uid() = teacher_id);

create policy "admin reads school grades"
  on grades for select using (
    exists (
      select 1 from profiles p
      join classes c on c.school_id = p.school_id
      where p.id = auth.uid()
      and p.role = 'admin'
      and c.id = grades.class_id
    )
  );

-- Attendance
create policy "student reads own attendance"
  on attendance for select using (auth.uid() = student_id);

create policy "parent reads child attendance"
  on attendance for select using (
    exists (
      select 1 from parent_children pc
      where pc.parent_id = auth.uid()
      and pc.child_id = attendance.student_id
    )
  );

create policy "teacher manages attendance"
  on attendance for all using (auth.uid() = teacher_id);

create policy "admin reads school attendance"
  on attendance for select using (
    exists (
      select 1 from profiles p
      join classes c on c.school_id = p.school_id
      where p.id = auth.uid()
      and p.role = 'admin'
      and c.id = attendance.class_id
    )
  );

-- Messages
create policy "read own messages"
  on messages for select using (
    auth.uid() = sender_id or auth.uid() = recipient_id
  );

create policy "send messages"
  on messages for insert with check (auth.uid() = sender_id);

create policy "mark own messages read"
  on messages for update using (auth.uid() = recipient_id);

-- Assignments
create policy "student reads class assignments"
  on assignments for select using (
    exists (
      select 1 from class_members cm
      where cm.class_id = assignments.class_id
      and cm.student_id = auth.uid()
    )
  );

create policy "parent reads child assignments"
  on assignments for select using (
    exists (
      select 1 from parent_children pc
      join class_members cm on cm.student_id = pc.child_id
      where pc.parent_id = auth.uid()
      and cm.class_id = assignments.class_id
    )
  );

create policy "teacher manages own assignments"
  on assignments for all using (auth.uid() = teacher_id);

-- Submissions
create policy "student manages own submissions"
  on submissions for all using (auth.uid() = student_id);

create policy "teacher reads class submissions"
  on submissions for select using (
    exists (
      select 1 from assignments a
      where a.id = submissions.assignment_id
      and a.teacher_id = auth.uid()
    )
  );

create policy "teacher grades submissions"
  on submissions for update using (
    exists (
      select 1 from assignments a
      where a.id = submissions.assignment_id
      and a.teacher_id = auth.uid()
    )
  );

-- Notifications
create policy "own notifications"
  on notifications for all using (auth.uid() = user_id);

-- Zeka conversations
create policy "own zeka conversations"
  on zeka_conversations for all using (auth.uid() = user_id);

-- Ministry reports
create policy "admin manages school reports"
  on ministry_reports for all using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
      and p.role in ('admin', 'teacher')
      and p.school_id = ministry_reports.school_id
    )
  );

-- IB extended essays
create policy "student reads own essay"
  on ib_extended_essays for select using (auth.uid() = student_id);

create policy "admin and supervisor manage essays"
  on ib_extended_essays for all using (
    auth.uid() = supervisor_id or
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
      and p.role = 'admin'
      and p.school_id = ib_extended_essays.school_id
    )
  );

-- Announcements
create policy "school members read announcements"
  on announcements for select using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
      and p.school_id = announcements.school_id
    )
  );

create policy "admin creates announcements"
  on announcements for insert with check (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
      and p.role in ('admin', 'teacher')
    )
  );

-- Timetable
create policy "school members read timetable"
  on timetable_slots for select using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
      and p.school_id = timetable_slots.school_id
    )
  );

create policy "admin manages timetable"
  on timetable_slots for all using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
      and p.role = 'admin'
      and p.school_id = timetable_slots.school_id
    )
  );

-- Parent children
create policy "parent reads own children"
  on parent_children for select using (auth.uid() = parent_id);

create policy "admin manages parent children"
  on parent_children for all using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
      and p.role = 'admin'
    )
  );
