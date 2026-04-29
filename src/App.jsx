import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}
import { useAuth } from './contexts/AuthContext'
import { PageSpinner } from './components/ui/Spinner'
import AppLayout from './components/layout/AppLayout'
import ErrorBoundary from './components/ui/ErrorBoundary'

// Landing page — eager (first paint)
import Landing from './pages/Landing'
import InfoPage from './pages/InfoPage'
import Solutions from './pages/Solutions'
import Features from './pages/Features'
import FeaturePage from './pages/FeaturePage'
import ZekaAIPage from './pages/ZekaAIPage'

// Auth pages — lazy
const Login            = lazy(() => import('./pages/auth/Login'))
const SignUp           = lazy(() => import('./pages/auth/SignUp'))
const ForgotPassword   = lazy(() => import('./pages/auth/ForgotPassword'))
const ResetPassword    = lazy(() => import('./pages/auth/ResetPassword'))
const Verify           = lazy(() => import('./pages/auth/Verify'))

// Student pages — lazy
const StudentDashboard   = lazy(() => import('./pages/student/Dashboard'))
const StudentZeka        = lazy(() => import('./pages/student/Zeka'))
const StudentGrades      = lazy(() => import('./pages/student/Grades'))
const StudentAttendance  = lazy(() => import('./pages/student/Attendance'))
const StudentAssignments = lazy(() => import('./pages/student/Assignments'))
const StudentMessages    = lazy(() => import('./pages/student/Messages'))
const StudentProfile     = lazy(() => import('./pages/student/Profile'))
const StudentExams       = lazy(() => import('./pages/student/Exams'))
const StudentHomework    = lazy(() => import('./pages/student/Homework'))
const StudentProgress    = lazy(() => import('./pages/student/Progress'))
const StudentPortfolio   = lazy(() => import('./pages/student/Portfolio'))

// Teacher pages — lazy
const TeacherDashboard   = lazy(() => import('./pages/teacher/Dashboard'))
const Gradebook          = lazy(() => import('./pages/teacher/Gradebook'))
const AttendanceRegister = lazy(() => import('./pages/teacher/AttendanceRegister'))
const TeacherZeka        = lazy(() => import('./pages/teacher/Zeka'))
const TeacherAssignments = lazy(() => import('./pages/teacher/Assignments'))
const TeacherMessages    = lazy(() => import('./pages/teacher/Messages'))
const TeacherReports     = lazy(() => import('./pages/teacher/Reports'))
const TeacherAnalytics   = lazy(() => import('./pages/teacher/Analytics'))
const TeacherTimetable   = lazy(() => import('./pages/teacher/Timetable'))
const TeacherProfile     = lazy(() => import('./pages/teacher/Profile'))
const TeacherExams       = lazy(() => import('./pages/teacher/Exams'))
const TeacherDiscipline  = lazy(() => import('./pages/teacher/Discipline'))
const TeacherConversations = lazy(() => import('./pages/teacher/Conversations'))
const TeacherUnitPlanner = lazy(() => import('./pages/teacher/UnitPlanner'))
const TeacherClasses     = lazy(() => import('./pages/teacher/Classes'))

// Parent pages — lazy
const ParentDashboard    = lazy(() => import('./pages/parent/Dashboard'))
const ParentGrades       = lazy(() => import('./pages/parent/Grades'))
const ParentAttendance   = lazy(() => import('./pages/parent/Attendance'))
const ParentAssignments  = lazy(() => import('./pages/parent/Assignments'))
const ParentMessages     = lazy(() => import('./pages/parent/Messages'))
const ParentNotifications = lazy(() => import('./pages/parent/Notifications'))
const ParentProfile      = lazy(() => import('./pages/parent/Profile'))
const ParentExams        = lazy(() => import('./pages/parent/Exams'))
const ParentConversations = lazy(() => import('./pages/parent/Conversations'))
const ParentProgress     = lazy(() => import('./pages/parent/Progress'))

// Admin pages — lazy
const AdminDashboard      = lazy(() => import('./pages/admin/Dashboard'))
const AdminStudents       = lazy(() => import('./pages/admin/Students'))
const AdminTeachers       = lazy(() => import('./pages/admin/Teachers'))
const AdminParents        = lazy(() => import('./pages/admin/Parents'))
const AdminClasses        = lazy(() => import('./pages/admin/Classes'))
const AdminGradebook      = lazy(() => import('./pages/admin/Gradebook'))
const AdminTimetable      = lazy(() => import('./pages/admin/Timetable'))
const AdminReports        = lazy(() => import('./pages/admin/Reports'))
const AdminAnalytics      = lazy(() => import('./pages/admin/Analytics'))
const AdminMessages       = lazy(() => import('./pages/admin/Messages'))
const AdminEvents         = lazy(() => import('./pages/admin/Events'))
const AdminExams          = lazy(() => import('./pages/admin/Exams'))
const AdminDiscipline     = lazy(() => import('./pages/admin/Discipline'))
const AdminSubstitutions  = lazy(() => import('./pages/admin/Substitutions'))
const AdminReportCards    = lazy(() => import('./pages/admin/ReportCards'))
const AdminStudentProgress = lazy(() => import('./pages/admin/StudentProgress'))
const IBPanel             = lazy(() => import('./pages/admin/IBPanel'))
const Ministry            = lazy(() => import('./pages/admin/Ministry'))
const AdminSettings       = lazy(() => import('./pages/admin/Settings'))
const AdminSubjects       = lazy(() => import('./pages/admin/Subjects'))
const AdminCAS            = lazy(() => import('./pages/admin/CAS'))
const AdminAdmissions     = lazy(() => import('./pages/admin/Admissions'))
const AdminLeaveRequests  = lazy(() => import('./pages/admin/LeaveRequests'))
const AdminRoomBooking    = lazy(() => import('./pages/admin/RoomBooking'))
const AdminLibrary        = lazy(() => import('./pages/admin/Library'))
const AdminSurveys        = lazy(() => import('./pages/admin/Surveys'))
const AdminCollegeCounseling = lazy(() => import('./pages/admin/CollegeCounseling'))
const AdminPTConferences  = lazy(() => import('./pages/admin/PTConferences'))

// Shared & system — lazy
const SharedCalendar      = lazy(() => import('./pages/shared/Calendar'))
const SuperAdminDashboard = lazy(() => import('./pages/superadmin/Dashboard'))
const SuperAdminSchools   = lazy(() => import('./pages/superadmin/Schools'))
const NotFound            = lazy(() => import('./pages/system/NotFound'))
const ServerError         = lazy(() => import('./pages/system/ServerError'))
const Maintenance         = lazy(() => import('./pages/system/Maintenance'))
const Demo                = lazy(() => import('./pages/Demo'))

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
      <ScrollToTop />
      <ErrorBoundary>
      <Suspense fallback={<PageSpinner />}>
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
          <Route path="/portfolio" element={<StudentPortfolio />} />
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
          <Route path="/muellim/vahid-plan" element={<TeacherUnitPlanner />} />
          <Route path="/muellim/sinifler" element={<TeacherClasses />} />
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
          <Route path="/admin/cas" element={<AdminCAS />} />
          <Route path="/admin/kabul" element={<AdminAdmissions />} />
          <Route path="/admin/izin" element={<AdminLeaveRequests />} />
          <Route path="/admin/oda-rezerv" element={<AdminRoomBooking />} />
          <Route path="/admin/kitabxana" element={<AdminLibrary />} />
          <Route path="/admin/anket" element={<AdminSurveys />} />
          <Route path="/admin/kollec" element={<AdminCollegeCounseling />} />
          <Route path="/admin/ptc" element={<AdminPTConferences />} />
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

        {/* Marketing pages */}
        <Route path="/solutions" element={<Solutions />} />
        <Route path="/features" element={<Features />} />
        <Route path="/features/curriculum"    element={<FeaturePage type="curriculum" />} />
        <Route path="/features/assessment"    element={<FeaturePage type="assessment" />} />
        <Route path="/features/attendance"    element={<FeaturePage type="attendance" />} />
        <Route path="/features/reports"       element={<FeaturePage type="reports" />} />
        <Route path="/features/communication" element={<FeaturePage type="communication" />} />
        <Route path="/features/timetable"     element={<FeaturePage type="timetable" />} />
        <Route path="/features/student-staff" element={<FeaturePage type="student-staff" />} />
        <Route path="/zeka-ai" element={<ZekaAIPage />} />

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
      </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
