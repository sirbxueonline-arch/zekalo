import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { PageSpinner } from './components/ui/Spinner'
import AppLayout from './components/layout/AppLayout'
import ErrorBoundary from './components/ui/ErrorBoundary'

// Landing page
import Landing from './pages/Landing'
import Demo from './pages/Demo'
import InfoPage from './pages/InfoPage'

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
import AdminGradebook from './pages/admin/Gradebook'
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
import AdminSubjects from './pages/admin/Subjects'

// New admin pages (lazy loaded)
const AdminCAS             = lazy(() => import('./pages/admin/CAS'))
const AdminAdmissions      = lazy(() => import('./pages/admin/Admissions'))
const AdminLeaveRequests   = lazy(() => import('./pages/admin/LeaveRequests'))
const AdminRoomBooking     = lazy(() => import('./pages/admin/RoomBooking'))
const AdminLibrary         = lazy(() => import('./pages/admin/Library'))
const AdminSurveys         = lazy(() => import('./pages/admin/Surveys'))
const AdminCollegeCounseling = lazy(() => import('./pages/admin/CollegeCounseling'))
const AdminPTConferences   = lazy(() => import('./pages/admin/PTConferences'))

// New teacher pages (lazy loaded)
const TeacherUnitPlanner   = lazy(() => import('./pages/teacher/UnitPlanner'))
const TeacherClasses       = lazy(() => import('./pages/teacher/Classes'))

// New student pages (lazy loaded)
const StudentPortfolio     = lazy(() => import('./pages/student/Portfolio'))

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
  if (!user) return <Navigate to="/daxil-ol?expired=1" replace />
  if (!profile && !profileError) return <PageSpinner />
  if (!profile && profileError) return <Navigate to="/daxil-ol" replace />
  return children
}

function RoleRoute({ role, children }) {
  const { profile, loading, profileError } = useAuth()
  if (loading) return <PageSpinner />
  if (!profile && !profileError) return <PageSpinner />
  if (!profile && profileError) return <Navigate to="/daxil-ol" replace />
  const allowed = Array.isArray(role) ? role : [role]
  if (!allowed.includes(profile.role)) {
    const paths = { student: '/dashboard', teacher: '/muellim/dashboard', parent: '/valideyn/dashboard', admin: '/admin/dashboard', super_admin: '/superadmin/dashboard' }
    return <Navigate to={paths[profile.role] || '/daxil-ol'} replace />
  }
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <Routes>
        {/* Public routes */}
        <Route path="/daxil-ol" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/qeydiyyat" element={<PublicOnlyRoute><SignUp /></PublicOnlyRoute>} />
        <Route path="/sifremi-unutdum" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
        <Route path="/sifre-yenile" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />
        <Route path="/sifre-sifirla" element={<ResetPassword />} />
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
          <Route path="/portfolio" element={<Suspense fallback={<PageSpinner />}><StudentPortfolio /></Suspense>} />
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
          <Route path="/muellim/vahid-plan" element={<Suspense fallback={<PageSpinner />}><TeacherUnitPlanner /></Suspense>} />
          <Route path="/muellim/sinifler" element={<Suspense fallback={<PageSpinner />}><TeacherClasses /></Suspense>} />
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
        <Route element={<PrivateRoute><RoleRoute role={['admin', 'super_admin']}><AppLayout /></RoleRoute></PrivateRoute>}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/shagirdler" element={<AdminStudents />} />
          <Route path="/admin/muelimler" element={<AdminTeachers />} />
          <Route path="/admin/valideyinler" element={<AdminParents />} />
          <Route path="/admin/sinifler" element={<AdminClasses />} />
          <Route path="/admin/jurnal" element={<AdminGradebook />} />
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
          <Route path="/admin/fenler" element={<AdminSubjects />} />
          <Route path="/admin/parametrler" element={<AdminSettings />} />
          <Route path="/admin/cas" element={<Suspense fallback={<PageSpinner />}><AdminCAS /></Suspense>} />
          <Route path="/admin/kabul" element={<Suspense fallback={<PageSpinner />}><AdminAdmissions /></Suspense>} />
          <Route path="/admin/izin" element={<Suspense fallback={<PageSpinner />}><AdminLeaveRequests /></Suspense>} />
          <Route path="/admin/oda-rezerv" element={<Suspense fallback={<PageSpinner />}><AdminRoomBooking /></Suspense>} />
          <Route path="/admin/kitabxana" element={<Suspense fallback={<PageSpinner />}><AdminLibrary /></Suspense>} />
          <Route path="/admin/anket" element={<Suspense fallback={<PageSpinner />}><AdminSurveys /></Suspense>} />
          <Route path="/admin/kollec" element={<Suspense fallback={<PageSpinner />}><AdminCollegeCounseling /></Suspense>} />
          <Route path="/admin/ptc" element={<Suspense fallback={<PageSpinner />}><AdminPTConferences /></Suspense>} />
        </Route>

        {/* Super Admin routes */}
        <Route element={<PrivateRoute><RoleRoute role="super_admin"><AppLayout /></RoleRoute></PrivateRoute>}>
          <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
          <Route path="/superadmin/mektebler" element={<SuperAdminSchools />} />
        </Route>

        {/* System routes */}
        <Route path="/texniki-xidmet" element={<Maintenance />} />
        <Route path="/500" element={<ServerError />} />

        {/* Demo pages (public) */}
        <Route path="/demo/:id" element={<Demo />} />

        {/* Landing page */}
        <Route path="/" element={<PublicOnlyRoute><Landing /></PublicOnlyRoute>} />

        {/* Info pages (footer links) */}
        <Route path="/ib-diploma"          element={<InfoPage type="ib-diploma" />} />
        <Route path="/ib-career"           element={<InfoPage type="ib-career" />} />
        <Route path="/ib-myp"              element={<InfoPage type="ib-myp" />} />
        <Route path="/ib-pyp"              element={<InfoPage type="ib-pyp" />} />
        <Route path="/government-schools"  element={<InfoPage type="government-schools" />} />
        <Route path="/mobile"              element={<InfoPage type="mobile" />} />
        <Route path="/online-exams"        element={<InfoPage type="online-exams" />} />
        <Route path="/ceo-letter"          element={<InfoPage type="ceo-letter" />} />
        <Route path="/resources"           element={<InfoPage type="resources" />} />
        <Route path="/events"              element={<InfoPage type="events" />} />
        <Route path="/blog"                element={<InfoPage type="blog" />} />
        <Route path="/product-portal"      element={<InfoPage type="product-portal" />} />
        <Route path="/reviews"             element={<InfoPage type="reviews" />} />
        <Route path="/faq"                 element={<InfoPage type="faq" />} />
        <Route path="/premium-support"     element={<InfoPage type="premium-support" />} />
        <Route path="/help"                element={<InfoPage type="support" />} />
        <Route path="/about"               element={<InfoPage type="about" />} />
        <Route path="/careers"             element={<InfoPage type="careers" />} />
        <Route path="/partners"            element={<InfoPage type="partners" />} />
        <Route path="/contact"             element={<InfoPage type="contact" />} />
        <Route path="/privacy"             element={<InfoPage type="privacy" />} />
        <Route path="/terms"               element={<InfoPage type="terms" />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
