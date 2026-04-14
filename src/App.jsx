import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { PageSpinner } from './components/ui/Spinner'
import AppLayout from './components/layout/AppLayout'

// Landing page
import Landing from './pages/Landing'

// Auth pages
import Login from './pages/auth/Login'
import SignUp from './pages/auth/SignUp'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import Verify from './pages/auth/Verify'

// Student pages
import StudentDashboard from './pages/student/Dashboard'
import StudentZeka from './pages/student/Zeka'
import StudentGrades from './pages/student/Grades'
import StudentAttendance from './pages/student/Attendance'
import StudentAssignments from './pages/student/Assignments'
import StudentMessages from './pages/student/Messages'
import StudentProfile from './pages/student/Profile'
import StudentExams from './pages/student/Exams'
import StudentHomework from './pages/student/Homework'
import StudentProgress from './pages/student/Progress'

// Teacher pages
import TeacherDashboard from './pages/teacher/Dashboard'
import Gradebook from './pages/teacher/Gradebook'
import AttendanceRegister from './pages/teacher/AttendanceRegister'
import TeacherZeka from './pages/teacher/Zeka'
import TeacherAssignments from './pages/teacher/Assignments'
import TeacherMessages from './pages/teacher/Messages'
import TeacherReports from './pages/teacher/Reports'
import TeacherAnalytics from './pages/teacher/Analytics'
import TeacherTimetable from './pages/teacher/Timetable'
import TeacherProfile from './pages/teacher/Profile'
import TeacherExams from './pages/teacher/Exams'
import TeacherDiscipline from './pages/teacher/Discipline'
import TeacherConversations from './pages/teacher/Conversations'

// Parent pages
import ParentDashboard from './pages/parent/Dashboard'
import ParentGrades from './pages/parent/Grades'
import ParentAttendance from './pages/parent/Attendance'
import ParentAssignments from './pages/parent/Assignments'
import ParentMessages from './pages/parent/Messages'
import ParentNotifications from './pages/parent/Notifications'
import ParentProfile from './pages/parent/Profile'
import ParentExams from './pages/parent/Exams'
import ParentConversations from './pages/parent/Conversations'
import ParentProgress from './pages/parent/Progress'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminStudents from './pages/admin/Students'
import AdminTeachers from './pages/admin/Teachers'
import AdminParents from './pages/admin/Parents'
import AdminClasses from './pages/admin/Classes'
import AdminTimetable from './pages/admin/Timetable'
import AdminReports from './pages/admin/Reports'
import AdminAnalytics from './pages/admin/Analytics'
import AdminMessages from './pages/admin/Messages'
import AdminEvents from './pages/admin/Events'
import AdminExams from './pages/admin/Exams'
import AdminDiscipline from './pages/admin/Discipline'
import AdminSubstitutions from './pages/admin/Substitutions'
import AdminReportCards from './pages/admin/ReportCards'
import AdminStudentProgress from './pages/admin/StudentProgress'
import IBPanel from './pages/admin/IBPanel'
import Ministry from './pages/admin/Ministry'
import AdminSettings from './pages/admin/Settings'

// Shared pages
import SharedCalendar from './pages/shared/Calendar'

// Super Admin pages
import SuperAdminDashboard from './pages/superadmin/Dashboard'
import SuperAdminSchools from './pages/superadmin/Schools'

// System pages
import NotFound from './pages/system/NotFound'
import ServerError from './pages/system/ServerError'
import Maintenance from './pages/system/Maintenance'

function PublicOnlyRoute({ children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <PageSpinner />
  if (user && profile) {
    const paths = { student: '/dashboard', teacher: '/muellim/dashboard', parent: '/valideyn/dashboard', admin: '/admin/dashboard', super_admin: '/superadmin/dashboard' }
    return <Navigate to={paths[profile.role] || '/dashboard'} replace />
  }
  return children
}

function PrivateRoute({ children }) {
  const { user, profile, loading, profileError } = useAuth()
  if (loading) return <PageSpinner />
  if (!user) return <Navigate to="/daxil-ol" replace />
  if (!profile && !profileError) return <PageSpinner />
  if (!profile && profileError) return <Navigate to="/daxil-ol" replace />
  return children
}

function RoleRoute({ role, children }) {
  const { profile, loading, profileError } = useAuth()
  if (loading) return <PageSpinner />
  if (!profile && !profileError) return <PageSpinner />
  if (!profile && profileError) return <Navigate to="/daxil-ol" replace />
  if (profile.role !== role) {
    const paths = { student: '/dashboard', teacher: '/muellim/dashboard', parent: '/valideyn/dashboard', admin: '/admin/dashboard', super_admin: '/superadmin/dashboard' }
    return <Navigate to={paths[profile.role] || '/daxil-ol'} replace />
  }
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/daxil-ol" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/qeydiyyat" element={<PublicOnlyRoute><SignUp /></PublicOnlyRoute>} />
        <Route path="/sifremi-unutdum" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
        <Route path="/sifre-yenile" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />
        <Route path="/dogrulama" element={<PublicOnlyRoute><Verify /></PublicOnlyRoute>} />

        {/* Student routes */}
        <Route element={<PrivateRoute><RoleRoute role="student"><AppLayout /></RoleRoute></PrivateRoute>}>
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/zeka" element={<StudentZeka />} />
          <Route path="/qiymetler" element={<StudentGrades />} />
          <Route path="/davamiyyet" element={<StudentAttendance />} />
          <Route path="/tapshiriqlar" element={<StudentAssignments />} />
          <Route path="/ev-tapshiriqlari" element={<StudentHomework />} />
          <Route path="/imtahanlar" element={<StudentExams />} />
          <Route path="/teraqqi" element={<StudentProgress />} />
          <Route path="/mesajlar" element={<StudentMessages />} />
          <Route path="/tedbirler" element={<SharedCalendar />} />
          <Route path="/profil" element={<StudentProfile />} />
        </Route>

        {/* Teacher routes */}
        <Route element={<PrivateRoute><RoleRoute role="teacher"><AppLayout /></RoleRoute></PrivateRoute>}>
          <Route path="/muellim/dashboard" element={<TeacherDashboard />} />
          <Route path="/muellim/jurnal" element={<Gradebook />} />
          <Route path="/muellim/davamiyyet" element={<AttendanceRegister />} />
          <Route path="/muellim/zeka" element={<TeacherZeka />} />
          <Route path="/muellim/tapshiriqlar" element={<TeacherAssignments />} />
          <Route path="/muellim/imtahanlar" element={<TeacherExams />} />
          <Route path="/muellim/intizam" element={<TeacherDiscipline />} />
          <Route path="/muellim/yazismalar" element={<TeacherConversations />} />
          <Route path="/muellim/mesajlar" element={<TeacherMessages />} />
          <Route path="/muellim/hesabatlar" element={<TeacherReports />} />
          <Route path="/muellim/analitika" element={<TeacherAnalytics />} />
          <Route path="/muellim/cedvel" element={<TeacherTimetable />} />
          <Route path="/muellim/tedbirler" element={<SharedCalendar />} />
          <Route path="/muellim/profil" element={<TeacherProfile />} />
        </Route>

        {/* Parent routes */}
        <Route element={<PrivateRoute><RoleRoute role="parent"><AppLayout /></RoleRoute></PrivateRoute>}>
          <Route path="/valideyn/dashboard" element={<ParentDashboard />} />
          <Route path="/valideyn/qiymetler" element={<ParentGrades />} />
          <Route path="/valideyn/davamiyyet" element={<ParentAttendance />} />
          <Route path="/valideyn/tapshiriqlar" element={<ParentAssignments />} />
          <Route path="/valideyn/imtahanlar" element={<ParentExams />} />
          <Route path="/valideyn/yazismalar" element={<ParentConversations />} />
          <Route path="/valideyn/teraqqi" element={<ParentProgress />} />
          <Route path="/valideyn/mesajlar" element={<ParentMessages />} />
          <Route path="/valideyn/bildirisler" element={<ParentNotifications />} />
          <Route path="/valideyn/tedbirler" element={<SharedCalendar />} />
          <Route path="/valideyn/profil" element={<ParentProfile />} />
        </Route>

        {/* Admin routes */}
        <Route element={<PrivateRoute><RoleRoute role="admin"><AppLayout /></RoleRoute></PrivateRoute>}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/shagirdler" element={<AdminStudents />} />
          <Route path="/admin/muelimler" element={<AdminTeachers />} />
          <Route path="/admin/valideyinler" element={<AdminParents />} />
          <Route path="/admin/sinifler" element={<AdminClasses />} />
          <Route path="/admin/cedvel" element={<AdminTimetable />} />
          <Route path="/admin/imtahanlar" element={<AdminExams />} />
          <Route path="/admin/intizam" element={<AdminDiscipline />} />
          <Route path="/admin/evezetme" element={<AdminSubstitutions />} />
          <Route path="/admin/sehadetname" element={<AdminReportCards />} />
          <Route path="/admin/teraqqi" element={<AdminStudentProgress />} />
          <Route path="/admin/hesabatlar" element={<AdminReports />} />
          <Route path="/admin/analitika" element={<AdminAnalytics />} />
          <Route path="/admin/mesajlar" element={<AdminMessages />} />
          <Route path="/admin/tedbirler" element={<AdminEvents />} />
          <Route path="/admin/ib" element={<IBPanel />} />
          <Route path="/admin/nazirlik" element={<Ministry />} />
          <Route path="/admin/parametrler" element={<AdminSettings />} />
        </Route>

        {/* Super Admin routes */}
        <Route element={<PrivateRoute><RoleRoute role="super_admin"><AppLayout /></RoleRoute></PrivateRoute>}>
          <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
          <Route path="/superadmin/mektebler" element={<SuperAdminSchools />} />
        </Route>

        {/* System routes */}
        <Route path="/texniki-xidmet" element={<Maintenance />} />
        <Route path="/500" element={<ServerError />} />

        {/* Landing page */}
        <Route path="/" element={<PublicOnlyRoute><Landing /></PublicOnlyRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
